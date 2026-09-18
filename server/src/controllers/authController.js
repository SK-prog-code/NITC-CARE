const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Helper to send response with JWT token
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();

  const userObj = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    rollNumber: user.rollNumber,
    hostelBlock: user.hostelBlock,
    roomNumber: user.roomNumber,
    messName: user.messName,
    departmentId: user.departmentId,
    phone: user.phone,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    success: true,
    data: {
      user: userObj,
      token,
    },
    message,
    error: null,
  });
};

// @desc    Register a new student
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, phone, hostelBlock, roomNumber, messName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please provide name, email, and password',
        error: 'MissingFields',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Password must be at least 6 characters long',
        error: 'WeakPassword',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'An account with this email address already exists',
        error: 'EmailAlreadyExists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user (Public registration defaults to 'student')
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'student',
      rollNumber: rollNumber || null,
      hostelBlock: hostelBlock || null,
      roomNumber: roomNumber || null,
      messName: messName || null,
      phone: phone || null,
    });

    sendTokenResponse(user, 201, res, 'Student account registered successfully');
  } catch (err) {
    next(err);
  }
};

// @desc    Login user (Student, Admin, Staff)
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please provide both email and password',
        error: 'MissingCredentials',
      });
    }

    // Find user with passwordHash
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .populate('departmentId', 'name');

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
        error: 'InvalidCredentials',
      });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
        error: 'InvalidCredentials',
      });
    }

    sendTokenResponse(user, 200, res, `Welcome back, ${user.name}`);
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('departmentId', 'name');

    res.status(200).json({
      success: true,
      data: user,
      message: 'User profile fetched successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create Admin or Staff user (Admin only)
// @route   POST /api/v1/auth/create-user
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, departmentId, rollNumber, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please provide name, email, password, and role',
        error: 'MissingFields',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'A user with this email address already exists',
        error: 'EmailAlreadyExists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      departmentId: departmentId || null,
      rollNumber: rollNumber || null,
      phone: phone || null,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
      },
      message: `${role.toUpperCase()} user created successfully`,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all staff members (for assignment dropdown)
// @route   GET /api/v1/auth/staff
// @access  Private (Admin/Staff)
exports.getStaffMembers = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $in: ['staff', 'admin'] } })
      .select('name email role departmentId')
      .populate('departmentId', 'name');

    res.status(200).json({
      success: true,
      data: staff,
      message: 'Staff members retrieved successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
