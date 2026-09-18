const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/v1/departments
// @access  Public / Authenticated
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort('name');

    res.status(200).json({
      success: true,
      data: departments,
      message: 'Departments retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single department
// @route   GET /api/v1/departments/:id
// @access  Authenticated
exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Department not found',
        error: 'DepartmentNotFound',
      });
    }

    res.status(200).json({
      success: true,
      data: department,
      message: 'Department retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create department
// @route   POST /api/v1/departments
// @access  Private/Admin
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description, contactEmail, contactPhone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please provide a department name',
        error: 'MissingName',
      });
    }

    const department = await Department.create({
      name,
      description: description || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
    });

    res.status(201).json({
      success: true,
      data: department,
      message: 'Department created successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update department
// @route   PUT /api/v1/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res, next) => {
  try {
    const { name, description, contactEmail, contactPhone, isActive } = req.body;

    let department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Department not found',
        error: 'DepartmentNotFound',
      });
    }

    department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        name: name || department.name,
        description: description !== undefined ? description : department.description,
        contactEmail: contactEmail !== undefined ? contactEmail : department.contactEmail,
        contactPhone: contactPhone !== undefined ? contactPhone : department.contactPhone,
        isActive: isActive !== undefined ? isActive : department.isActive,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: department,
      message: 'Department updated successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete/Deactivate department
// @route   DELETE /api/v1/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Department not found',
        error: 'DepartmentNotFound',
      });
    }

    department.isActive = false;
    await department.save();

    res.status(200).json({
      success: true,
      data: department,
      message: 'Department deactivated successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
