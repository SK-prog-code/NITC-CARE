const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
  updatePriority,
  addComment,
  reopenComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// All complaint routes require authentication
router.use(protect);

router
  .route('/')
  .post(authorize('student'), upload.array('attachments', 5), createComplaint)
  .get(getComplaints);

router.route('/:id').get(getComplaintById);

router.patch('/:id/status', authorize('admin', 'staff'), updateStatus);
router.patch('/:id/assign', authorize('admin'), assignComplaint);
router.patch('/:id/priority', authorize('admin'), updatePriority);
router.post('/:id/comments', addComment);
router.post('/:id/reopen', authorize('student'), reopenComplaint);

module.exports = router;
