// Input validation middleware
export const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const errors = [];

  // Required fields validation
  if (!firstName) errors.push("First name is required");
  if (!lastName) errors.push("Last name is required");
  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  // Format validation
  const nameRegex = /^[A-Za-z]+$/;
  if (firstName && !nameRegex.test(firstName)) {
    errors.push("First name should only contain alphabets");
  }
  if (lastName && !nameRegex.test(lastName)) {
    errors.push("Last name should only contain alphabets");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push("Please enter a valid email address");
  }

  if (password && password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors
    });
  }

  next();
};

// Login validation middleware
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push("Please enter a valid email address");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors
    });
  }

  next();
};

// Trade validation middleware
export const validateTrade = (req, res, next) => {
  const { company_id, quantity, transaction_type } = req.body;
  const errors = [];

  if (!company_id) errors.push("Company ID is required");
  if (!quantity) errors.push("Quantity is required");
  if (!transaction_type) errors.push("Transaction type is required");

  if (quantity && (isNaN(quantity) || parseInt(quantity) <= 0)) {
    errors.push("Quantity must be a positive number");
  }

  if (transaction_type && !["buy", "sell"].includes(transaction_type.toLowerCase())) {
    errors.push("Transaction type must be 'buy' or 'sell'");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors
    });
  }

  // Normalize transaction type
  req.body.transaction_type = transaction_type.toLowerCase();
  req.body.quantity = parseInt(quantity);

  next();
};

// Balance validation middleware
export const validateBalance = (req, res, next) => {
  const { amount, operation } = req.body;
  const errors = [];

  if (amount === undefined) errors.push("Amount is required");
  if (!operation) errors.push("Operation is required");

  if (amount !== undefined && (isNaN(amount) || parseFloat(amount) <= 0)) {
    errors.push("Amount must be a positive number");
  }

  if (operation && !["add", "withdraw"].includes(operation.toLowerCase())) {
    errors.push("Operation must be 'add' or 'withdraw'");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors
    });
  }

  next();
};