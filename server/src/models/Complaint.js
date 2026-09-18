const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: 'attachment',
    },
    fileType: {
      type: String,
      enum: ['image', 'pdf', 'document'],
      default: 'image',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const activityLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    actorName: {
      type: String,
      default: 'System',
    },
    actorRole: {
      type: String,
      enum: ['student', 'admin', 'staff', 'system'],
      default: 'system',
    },
    action: {
      type: String,
      enum: [
        'submitted',
        'status_changed',
        'assigned',
        'comment_added',
        'priority_changed',
        'resolved',
        'closed',
        'reopened',
      ],
      required: true,
    },
    oldValue: {
      type: String,
      default: null,
    },
    newValue: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintCode: {
      type: String,
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      minlength: [20, 'Description must be at least 20 characters long'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    hostelBlock: {
      type: String,
      required: [true, 'Please select the NITC hostel block'],
      trim: true,
      index: true,
    },
    roomNumber: {
      type: String,
      default: '',
      trim: true,
    },
    messName: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide the specific location'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'under_review',
        'assigned',
        'in_progress',
        'resolved',
        'closed',
        'reopened',
      ],
      default: 'submitted',
      index: true,
    },
    assignedDepartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: null,
    },
    attachments: [attachmentSchema],
    activityLog: [activityLogSchema],
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique code generation helper before saving if not present
complaintSchema.pre('save', async function (next) {
  if (!this.complaintCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Complaint').countDocuments();
    const seq = String(count + 1).padStart(6, '0');
    this.complaintCode = `NITC-${year}-${seq}`;
  }
  next();
});

// Compound Indexes for fast querying & search
complaintSchema.index({ studentId: 1, status: 1 });
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ hostelBlock: 1, status: 1 });
complaintSchema.index({ categoryId: 1 });
complaintSchema.index({ title: 'text', description: 'text', location: 'text', hostelBlock: 'text' });

module.exports = mongoose.model('Complaint', complaintSchema);
