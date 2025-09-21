// Authentication middleware to check if user is logged in
export const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    // User is authenticated, proceed to next middleware/route
    next();
  } else {
    // User is not authenticated
    res.status(401).json({ 
      error: "Authentication required",
      message: "Please log in to access this resource" 
    });
  }
};

// Optional authentication middleware (doesn't block if not authenticated)
export const optionalAuth = (req, res, next) => {
  // Always proceed, but user info will be available if logged in
  next();
};

// Middleware to check if user has admin privileges
export const requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ 
      error: "Admin access required",
      message: "You don't have permission to access this resource" 
    });
  }
};

// Middleware to attach user ID to request for convenience
export const attachUserId = (req, res, next) => {
  if (req.session && req.session.user) {
    req.userId = req.session.user.userId;
    req.userEmail = req.session.user.email;
  }
  next();
};