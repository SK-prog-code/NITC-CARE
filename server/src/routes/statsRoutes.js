const express = require('express');
const router = express.Router();
const {
  getSummaryStats,
  getByCategory,
  getByDepartment,
  getByPriority,
  getResolutionTimeStats,
  getByHostel,
} = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

// All stats routes are Admin only
router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/summary', getSummaryStats);
router.get('/by-category', getByCategory);
router.get('/by-department', getByDepartment);
router.get('/by-priority', getByPriority);
router.get('/by-hostel', getByHostel);
router.get('/resolution-time', getResolutionTimeStats);

module.exports = router;
