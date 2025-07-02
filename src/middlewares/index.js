// Request logging middleware
const logRequests = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.path;
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`[${timestamp}] ${method} ${path} - IP: ${ip}`);
    
    // Log request body for POST/PUT requests (excluding sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const logBody = { ...req.body };
      if (logBody.password) logBody.password = '[REDACTED]';
      console.log(`[${timestamp}] Request Body:`, JSON.stringify(logBody, null, 2));
    }
    
    next();
  };
  
  // 404 Not Found handler
  const notFoundHandler = (req, res) => {
    res.status(404).json({
      error: 'Endpoint not found',
      message: `Cannot ${req.method} ${req.path}`,
      timestamp: new Date().toISOString(),
      availableEndpoints: {
        auth: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'GET /api/auth/profile'
        ],
        books: [
          'GET /api/books',
          'GET /api/books/:id',
          'GET /api/books/search',
          'POST /api/books',
          'PUT /api/books/:id',
          'DELETE /api/books/:id',
          'GET /api/books/user/my-books'
        ]
      }
    });
  };
  
  // Global error handler
  const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Please provide a valid authentication token'
      });
    }
  
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your authentication token has expired. Please login again.'
      });
    }
  
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: err.message
      });
    }
  
    // Handle JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        error: 'Invalid JSON',
        message: 'Please provide valid JSON in request body'
      });
    }
  
    // Handle file system errors
    if (err.code === 'ENOENT') {
      return res.status(500).json({
        error: 'File system error',
        message: 'Data file not found. Please contact administrator.'
      });
    }
  
    if (err.code === 'EACCES') {
      return res.status(500).json({
        error: 'File system error',
        message: 'Permission denied accessing data files.'
      });
    }
  
    // Default error response
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
      error: 'Internal server error',
      message: isDevelopment ? err.message : 'Something went wrong on our end',
      ...(isDevelopment && { stack: err.stack }),
      timestamp: new Date().toISOString()
    });
  };
  
  module.exports = {
    logRequests,
    notFoundHandler,
    errorHandler
  };