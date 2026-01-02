const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/database');

dotenv.config();

const app = express();

// Middleware
// CORS configuration
const getCorsOrigin = () => {
  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  }
  // In production, if no CORS_ORIGIN is set, allow all (backend serves frontend)
  // In development, allow all origins
  return '*';
};

const corsOptions = {
  origin: getCorsOrigin(),
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (before routes to avoid conflicts)
app.get('/api/health-check', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cows', require('./routes/cows'));
app.use('/api/milk', require('./routes/milk'));
app.use('/api/health', require('./routes/health'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';
  let status = err.status || 'error';

  // Handle specific error types
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry - resource already exists';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Invalid reference - related resource not found';
  }

  // In development, send detailed error
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  const errorResponse = {
    status,
    message,
    ...(isDevelopment && {
      error: err.message,
      stack: err.stack,
      details: err
    })
  };

  res.status(statusCode).json(errorResponse);
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
db.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

