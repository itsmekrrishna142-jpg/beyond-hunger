// app.js
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const winston = require('winston');
const morgan = require('morgan');
const connectDB = require('./db/connect');

const app = express();

// 2.3 Monitoring & Logging - WINSTON LOGGER
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'beyond-hunger-api' },
  transports: [
    // Write all errors to error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs to combined.log
    new winston.transports.File({ filename: 'logs/combined.log' }),
    // Also log to console in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
});

// Create a stream for Morgan to use Winston
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

// Morgan for HTTP request logging
app.use(morgan('combined', { stream: logger.stream }));

// Connect to MongoDB
connectDB();

// 1.3 Input Validation & Sanitization - SECURITY MIDDLEWARE
// Helmet for security headers
app.use(helmet());

// Body parser middleware with size limits
app.use(express.json({ limit: '10kb', extended: false }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// 2.1 Production Server Setup - ADDITIONAL SECURITY
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression middleware (gzip compression)
app.use(compression());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gallery', require('./routes/gallery'));

// Test route
app.get('/', (req, res) => {
  logger.info('Root route accessed');
  res.send('🚀 Beyond Hunger Server is running...');
});

// Health check route
app.get('/api/health', (req, res) => {
  logger.info('Health check route accessed');
  res.json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Handle unhandled routes - 404 handler
app.all('*', (req, res) => {
  logger.warn(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛡️  Production security features enabled`);
  console.log(`📝 Logging enabled - check logs/ directory`);
});