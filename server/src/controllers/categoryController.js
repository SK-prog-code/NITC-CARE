const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public / Authenticated
exports.getCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const query = includeInactive === 'true' ? {} : { isActive: true };

    const categories = await Category.find(query)
      .populate('defaultDepartmentId', 'name')
      .sort('name');

    res.status(200).json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      'defaultDepartmentId',
      'name'
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Category not found',
        error: 'CategoryNotFound',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
      message: 'Category retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, defaultDepartmentId, icon, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please provide a category name',
        error: 'MissingName',
      });
    }

    const category = await Category.create({
      name,
      description: description || '',
      defaultDepartmentId: defaultDepartmentId || null,
      icon: icon || 'AlertCircle',
      isActive: isActive !== undefined ? isActive : true,
    });

    const populatedCategory = await Category.findById(category._id).populate(
      'defaultDepartmentId',
      'name'
    );

    res.status(201).json({
      success: true,
      data: populatedCategory,
      message: 'Category created successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, defaultDepartmentId, icon, isActive } = req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Category not found',
        error: 'CategoryNotFound',
      });
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name || category.name,
        description: description !== undefined ? description : category.description,
        defaultDepartmentId:
          defaultDepartmentId !== undefined
            ? defaultDepartmentId || null
            : category.defaultDepartmentId,
        icon: icon || category.icon,
        isActive: isActive !== undefined ? isActive : category.isActive,
      },
      { new: true, runValidators: true }
    ).populate('defaultDepartmentId', 'name');

    res.status(200).json({
      success: true,
      data: category,
      message: 'Category updated successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete/Deactivate category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Category not found',
        error: 'CategoryNotFound',
      });
    }

    // Toggle active state or delete
    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      data: category,
      message: 'Category deactivated successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
