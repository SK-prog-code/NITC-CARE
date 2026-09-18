// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('⚠️ [API Error]:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({
      success: false,
      data: null,
      message,
      error: 'ResourceNotFound',
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for '${field}'. Please use another value.`;
    return res.status(400).json({
      success: false,
      data: null,
      message,
      error: 'DuplicateKeyError',
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({
      success: false,
      data: null,
      message,
      error: 'ValidationError',
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      data: null,
      message: err.message,
      error: 'FileUploadError',
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    data: null,
    message: error.message || 'Server Error. Please try again later.',
    error: error.name || 'InternalServerError',
  });
};

module.exports = errorHandler;
