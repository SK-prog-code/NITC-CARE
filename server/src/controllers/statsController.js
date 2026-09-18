const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const Department = require('../models/Department');
const mongoose = require('mongoose');

// @desc    Get executive analytics summary
// @route   GET /api/v1/stats/summary
// @access  Private/Admin
exports.getSummaryStats = async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments();
    const submitted = await Complaint.countDocuments({ status: 'submitted' });
    const underReview = await Complaint.countDocuments({ status: 'under_review' });
    const assigned = await Complaint.countDocuments({ status: 'assigned' });
    const inProgress = await Complaint.countDocuments({ status: 'in_progress' });
    const resolved = await Complaint.countDocuments({ status: 'resolved' });
    const closed = await Complaint.countDocuments({ status: 'closed' });
    const reopened = await Complaint.countDocuments({ status: 'reopened' });
    const critical = await Complaint.countDocuments({ priority: 'critical', status: { $nin: ['resolved', 'closed'] } });

    const pending = submitted + underReview;
    const activeWorking = assigned + inProgress + reopened;
    const completed = resolved + closed;

    const resolutionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Average resolution time for complaints with resolvedAt or closedAt
    const resolvedComplaints = await Complaint.find({
      $or: [{ resolvedAt: { $ne: null } }, { closedAt: { $ne: null } }],
    }).select('createdAt resolvedAt closedAt');

    let totalResolutionHours = 0;
    let avgResolutionHours = 0;

    if (resolvedComplaints.length > 0) {
      const validTimes = resolvedComplaints.map((c) => {
        const endTime = c.resolvedAt || c.closedAt;
        const diffMs = new Date(endTime) - new Date(c.createdAt);
        return Math.max(0, diffMs / (1000 * 60 * 60)); // hours
      });

      totalResolutionHours = validTimes.reduce((acc, curr) => acc + curr, 0);
      avgResolutionHours = parseFloat((totalResolutionHours / validTimes.length).toFixed(1));
    }

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        submitted,
        underReview,
        assigned,
        inProgress,
        resolved,
        closed,
        reopened,
        critical,
        completed,
        activeWorking,
        resolutionRate,
        avgResolutionHours,
        avgResolutionDays: parseFloat((avgResolutionHours / 24).toFixed(1)),
      },
      message: 'Summary analytics retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get complaints breakdown by category
// @route   GET /api/v1/stats/by-category
// @access  Private/Admin
exports.getByCategory = async (req, res, next) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $project: {
          _id: 1,
          name: '$category.name',
          icon: '$category.icon',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Category stats retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get complaints breakdown by department
// @route   GET /api/v1/stats/by-department
// @access  Private/Admin
exports.getByDepartment = async (req, res, next) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $match: { assignedDepartmentId: { $ne: null } },
      },
      {
        $group: {
          _id: '$assignedDepartmentId',
          count: { $sum: 1 },
          resolvedCount: {
            $sum: {
              $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $unwind: '$department',
      },
      {
        $project: {
          _id: 1,
          name: '$department.name',
          count: 1,
          resolvedCount: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Department stats retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get complaints breakdown by priority
// @route   GET /api/v1/stats/by-priority
// @access  Private/Admin
exports.getByPriority = async (req, res, next) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          priority: '$_id',
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Priority stats retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get resolution time metrics
// @route   GET /api/v1/stats/resolution-time
// @access  Private/Admin
exports.getResolutionTimeStats = async (req, res, next) => {
  try {
    const resolved = await Complaint.find({
      $or: [{ resolvedAt: { $ne: null } }, { closedAt: { $ne: null } }],
    })
      .select('createdAt resolvedAt closedAt priority')
      .populate('categoryId', 'name');

    const byPriority = {
      low: [],
      medium: [],
      high: [],
      critical: [],
    };

    resolved.forEach((c) => {
      const end = c.resolvedAt || c.closedAt;
      const hours = Math.max(0, (new Date(end) - new Date(c.createdAt)) / (1000 * 60 * 60));
      if (byPriority[c.priority]) {
        byPriority[c.priority].push(hours);
      }
    });

    const avgByPriority = Object.keys(byPriority).map((p) => {
      const arr = byPriority[p];
      const avg = arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      return {
        priority: p,
        avgHours: parseFloat(avg.toFixed(1)),
        avgDays: parseFloat((avg / 24).toFixed(1)),
        count: arr.length,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalResolvedTracked: resolved.length,
        avgByPriority,
      },
      message: 'Resolution time metrics retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get complaints breakdown by NITC Hostel block
// @route   GET /api/v1/stats/by-hostel
// @access  Private/Admin
exports.getByHostel = async (req, res, next) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $match: { hostelBlock: { $ne: null, $ne: '' } },
      },
      {
        $group: {
          _id: '$hostelBlock',
          count: { $sum: 1 },
          resolvedCount: {
            $sum: {
              $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          hostelBlock: '$_id',
          count: 1,
          resolvedCount: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Hostel block stats retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

