const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if credentials provided
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Ensure local uploads folder exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration (memory storage for stream/processing or disk)
const storage = isCloudinaryConfigured
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    });

// File filter: images and PDFs only, max 5MB
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, WEBP images and PDF files are allowed.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // max 5 files
  },
  fileFilter,
});

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, originalname, mimetype) => {
  return new Promise((resolve, reject) => {
    const isPdf = mimetype === 'application/pdf';
    const resourceType = isPdf ? 'raw' : 'image';
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ccms_complaints',
        resource_type: resourceType,
        public_id: `cmp_${Date.now()}_${path.parse(originalname).name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// Process uploaded files into attachment objects
const processUploadedFiles = async (req) => {
  if (!req.files || req.files.length === 0) {
    return [];
  }

  const attachments = [];

  for (const file of req.files) {
    const isPdf = file.mimetype === 'application/pdf';
    const fileType = isPdf ? 'pdf' : 'image';

    if (isCloudinaryConfigured && file.buffer) {
      try {
        const result = await uploadToCloudinary(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        attachments.push({
          fileUrl: result.secure_url,
          publicId: result.public_id,
          fileName: file.originalname,
          fileType,
          fileSize: file.size,
          uploadedAt: new Date(),
        });
      } catch (uploadErr) {
        console.error('Cloudinary upload failed, skipping file:', uploadErr);
      }
    } else {
      // Local file fallback
      const serverUrl = `${req.protocol}://${req.get('host')}`;
      const localFileUrl = `${serverUrl}/uploads/${file.filename}`;
      attachments.push({
        fileUrl: localFileUrl,
        publicId: file.filename,
        fileName: file.originalname,
        fileType,
        fileSize: file.size,
        uploadedAt: new Date(),
      });
    }
  }

  return attachments;
};

module.exports = {
  upload,
  processUploadedFiles,
  isCloudinaryConfigured,
};
