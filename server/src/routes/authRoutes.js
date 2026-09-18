const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  getMe,
  createUser,
  getStaffMembers,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.post('/create-user', protect, authorize('admin'), createUser);
router.get('/staff', protect, authorize('admin', 'staff'), getStaffMembers);

module.exports = router;
