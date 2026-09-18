const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Initialize DB and auto-seed if empty
const initDB = async () => {
  await connectDB();
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Running initial demo seed...');
      const seedDatabase = require('./seed');
      await seedDatabase();
    }
  } catch (err) {
    console.warn('Auto-seed check note:', err.message);
  }
};
initDB();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware in dev
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Enable CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for easy development and presentation
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 300, // max 300 requests per window
  message: {
    success: false,
    data: null,
    message: 'Too many requests from this IP, please try again after 10 minutes',
    error: 'RateLimitExceeded',
  },
});
app.use('/api/', limiter);

// Serve static uploads folder (fallback if Cloudinary is not used)
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'College Complaint Management System (CCMS) API',
    },
    message: 'CCMS Backend Service is healthy and operational',
    error: null,
  });
});

// Mount API Routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/stats', statsRoutes);

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `API endpoint '${req.originalUrl}' not found.`,
    error: 'RouteNotFound',
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    ` CCMS Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(` Error: ${err.message}`);
});

module.exports = app;
