// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error response
  let statusCode = 500;
  let message = "Internal server error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error: " + err.message;
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized access";
  } else if (err.name === "NotFoundError") {
    statusCode = 404;
    message = "Resource not found";
  } else if (err.message) {
    message = err.message;
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

// 404 handler for unmatched routes
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.path}`
  });
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get("User-Agent") || "Unknown";
  
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
  next();
};

// CORS setup
export const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
    "Pragma"
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  preflightContinue: false
};