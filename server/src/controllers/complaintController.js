const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const Department = require('../models/Department');
const User = require('../models/User');
const { processUploadedFiles } = require('../middleware/upload');

// @desc    Create a new complaint
// @route   POST /api/v1/complaints
// @access  Private/Student
exports.createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      categoryId,
      location,
      priority,
      hostelBlock,
      roomNumber,
      messName,
    } = req.body;

    if (!title || !description || !categoryId || !location) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please provide title, category, description, and location.',
        error: 'MissingFields',
      });
    }

    if (description.length < 20) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Description must be at least 20 characters long.',
        error: 'DescriptionTooShort',
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid category selected.',
        error: 'InvalidCategory',
      });
    }

    // Process file attachments (Cloudinary or local storage)
    const attachments = await processUploadedFiles(req);

    // Initial activity log entry
    const initialActivity = {
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'submitted',
      newValue: 'submitted',
      note: 'Hostel grievance submitted by student',
      createdAt: new Date(),
    };

    // Auto-map default department if category has one configured
    const assignedDepartmentId = category.defaultDepartmentId || null;

    const complaint = await Complaint.create({
      studentId: req.user.id,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      hostelBlock: hostelBlock || req.user.hostelBlock || 'Mega Hostel Block 1',
      roomNumber: roomNumber || req.user.roomNumber || '',
      messName: messName || req.user.messName || '',
      location: location.trim(),
      priority: priority || 'medium',
      status: 'submitted',
      assignedDepartmentId,
      attachments,
      activityLog: [initialActivity],
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('studentId', 'name email rollNumber phone hostelBlock roomNumber')
      .populate('categoryId', 'name icon')
      .populate('assignedDepartmentId', 'name');

    res.status(201).json({
      success: true,
      data: populatedComplaint,
      message: `NITC Complaint registered successfully. Reference ID: ${populatedComplaint.complaintCode}`,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all complaints with search, filters, sorting & pagination
// @route   GET /api/v1/complaints
// @access  Private (Student sees own, Staff sees dept/assigned, Admin sees all)
exports.getComplaints = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      department,
      hostelBlock,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Role-based scoping
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    } else if (req.user.role === 'staff') {
      // Staff members see complaints assigned to them or their department
      if (req.user.departmentId) {
        query.$or = [
          { assignedStaffId: req.user.id },
          { assignedDepartmentId: req.user.departmentId },
        ];
      } else {
        query.assignedStaffId = req.user.id;
      }
    }
    // Admin has no default restriction

    // Status filter
    if (status && status !== 'all') {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    // Category filter
    if (category && category !== 'all') {
      query.categoryId = category;
    }

    // Priority filter
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Department filter
    if (department && department !== 'all') {
      query.assignedDepartmentId = department;
    }

    // Hostel Block filter
    if (hostelBlock && hostelBlock !== 'all') {
      query.hostelBlock = hostelBlock;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Search query (keyword in title, description, location, or code)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { complaintCode: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('studentId', 'name email rollNumber')
      .populate('categoryId', 'name icon')
      .populate('assignedDepartmentId', 'name')
      .populate('assignedStaffId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
      message: 'Complaints retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single complaint details + activity timeline
// @route   GET /api/v1/complaints/:id
// @access  Private (Owner, Assigned Staff, Admin)
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('studentId', 'name email rollNumber phone')
      .populate('categoryId', 'name icon description')
      .populate('assignedDepartmentId', 'name description contactEmail contactPhone')
      .populate('assignedStaffId', 'name email phone')
      .populate('activityLog.actorId', 'name role email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Complaint not found',
        error: 'ComplaintNotFound',
      });
    }

    // Role access authorization check
    if (
      req.user.role === 'student' &&
      complaint.studentId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'You are not authorized to view another student’s complaint.',
        error: 'Forbidden',
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
      message: 'Complaint retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update complaint status (State Machine rules)
// @route   PATCH /api/v1/complaints/:id/status
// @access  Private (Admin / Staff)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note, resolutionNotes } = req.body;

    const validStatuses = [
      'submitted',
      'under_review',
      'assigned',
      'in_progress',
      'resolved',
      'closed',
      'reopened',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
        error: 'InvalidStatus',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Complaint not found',
        error: 'ComplaintNotFound',
      });
    }

    // State machine checks:
    // When marking 'resolved', resolutionNotes must be non-empty
    if (status === 'resolved') {
      const finalResolutionNotes = resolutionNotes || note;
      if (!finalResolutionNotes || finalResolutionNotes.trim().length === 0) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Resolution notes are mandatory when marking a complaint as Resolved.',
          error: 'ResolutionNotesRequired',
        });
      }
      complaint.resolutionNotes = finalResolutionNotes;
      complaint.resolvedAt = new Date();
    }

    if (status === 'closed') {
      complaint.closedAt = new Date();
    }

    const oldStatus = complaint.status;
    complaint.status = status;

    // Add activity log
    complaint.activityLog.push({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: status === 'resolved' ? 'resolved' : status === 'closed' ? 'closed' : 'status_changed',
      oldValue: oldStatus,
      newValue: status,
      note: note || (status === 'resolved' ? complaint.resolutionNotes : `Status updated to ${status.replace('_', ' ')}`),
      createdAt: new Date(),
    });

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('studentId', 'name email rollNumber phone')
      .populate('categoryId', 'name icon')
      .populate('assignedDepartmentId', 'name')
      .populate('assignedStaffId', 'name email');

    res.status(200).json({
      success: true,
      data: updatedComplaint,
      message: `Complaint status updated to ${status.replace('_', ' ')}`,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign complaint to department and/or staff
// @route   PATCH /api/v1/complaints/:id/assign
// @access  Private (Admin)
exports.assignComplaint = async (req, res, next) => {
  try {
    const { departmentId, staffId, note } = req.body;

    if (!departmentId && !staffId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please provide a departmentId or staffId to assign.',
        error: 'MissingAssignmentDetails',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Complaint not found',
        error: 'ComplaintNotFound',
      });
    }

    let departmentName = '';
    if (departmentId) {
      const dept = await Department.findById(departmentId);
      if (!dept) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Department not found',
          error: 'InvalidDepartment',
        });
      }
      complaint.assignedDepartmentId = departmentId;
      departmentName = dept.name;
    }

    let staffName = '';
    if (staffId) {
      const staff = await User.findById(staffId);
      if (!staff) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Staff user not found',
          error: 'InvalidStaff',
        });
      }
      complaint.assignedStaffId = staffId;
      staffName = staff.name;
    }

    // If status is submitted or under_review, transition to assigned
    if (['submitted', 'under_review'].includes(complaint.status)) {
      complaint.status = 'assigned';
    }

    const assignmentDesc = [
      departmentName ? `Department: ${departmentName}` : null,
      staffName ? `Staff: ${staffName}` : null,
    ]
      .filter(Boolean)
      .join(', ');

    complaint.activityLog.push({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'assigned',
      newValue: assignmentDesc,
      note: note || `Assigned to ${assignmentDesc}`,
      createdAt: new Date(),
    });

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('studentId', 'name email rollNumber phone')
      .populate('categoryId', 'name icon')
      .populate('assignedDepartmentId', 'name')
      .populate('assignedStaffId', 'name email');

    res.status(200).json({
      success: true,
      data: updatedComplaint,
      message: `Complaint successfully assigned to ${assignmentDesc}`,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update complaint priority
// @route   PATCH /api/v1/complaints/:id/priority
// @access  Private (Admin)
exports.updatePriority = async (req, res, next) => {
  try {
    const { priority, note } = req.body;
    const validPriorities = ['low', 'medium', 'high', 'critical'];

    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Invalid priority. Allowed values: ${validPriorities.join(', ')}`,
        error: 'InvalidPriority',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Complaint not found',
        error: 'ComplaintNotFound',
      });
    }

    const oldPriority = complaint.priority;
    complaint.priority = priority;

    complaint.activityLog.push({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'priority_changed',
      oldValue: oldPriority,
      newValue: priority,
      note: note || `Priority updated from ${oldPriority} to ${priority}`,
      createdAt: new Date(),
    });

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('studentId', 'name email rollNumber phone')
      .populate('categoryId', 'name icon')
      .populate('assignedDepartmentId', 'name')
      .populate('assignedStaffId', 'name email');

    res.status(200).json({
      success: true,
      data: updatedComplaint,
      message: `Priority updated to ${priority.toUpperCase()}`,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment/note to complaint timeline
// @route   POST /api/v1/complaints/:id/comments
// @access  Private (Student owner, Staff, Admin)
exports.addComment = async (req, res, next) => {
  try {
    const { note } = req.body;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please provide a comment note.',
        error: 'EmptyComment',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Complaint not found',
        error: 'ComplaintNotFound',
      });
    }

    // Role check
    if (
      req.user.role === 'student' &&
      complaint.studentId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'You can only comment on your own complaints.',
        error: 'Forbidden',
      });
    }

    complaint.activityLog.push({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'comment_added',
      note: note.trim(),
      createdAt: new Date(),
    });

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('studentId', 'name email rollNumber phone')
      .populate('categoryId', 'name icon')
      .populate('assignedDepartmentId', 'name')
      .populate('assignedStaffId', 'name email');

    res.status(200).json({
      success: true,
      data: updatedComplaint,
      message: 'Comment added to timeline successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reopen a resolved or closed complaint
// @route   POST /api/v1/complaints/:id/reopen
// @access  Private (Student owner only)
exports.reopenComplaint = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Complaint not found',
        error: 'ComplaintNotFound',
      });
    }

    if (complaint.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Only the student who submitted the complaint can reopen it.',
        error: 'Forbidden',
      });
    }

    if (!['resolved', 'closed'].includes(complaint.status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Only resolved or closed complaints can be reopened.',
        error: 'InvalidReopenStatus',
      });
    }

    const previousStatus = complaint.status;
    complaint.status = 'reopened';

    complaint.activityLog.push({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'reopened',
      oldValue: previousStatus,
      newValue: 'reopened',
      note: reason || 'Student requested reopening due to unresolved issue.',
      createdAt: new Date(),
    });

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('studentId', 'name email rollNumber phone')
      .populate('categoryId', 'name icon')
      .populate('assignedDepartmentId', 'name')
      .populate('assignedStaffId', 'name email');

    res.status(200).json({
      success: true,
      data: updatedComplaint,
      message: 'Complaint has been reopened for further action.',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
