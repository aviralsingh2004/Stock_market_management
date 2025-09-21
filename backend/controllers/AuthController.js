import User from "../models/User.js";

class AuthController {
  constructor() {
    this.userModel = new User();
  }

  // User registration
  async register(req, res) {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Validate input
      const validationErrors = this.userModel.validateUserInput({ firstName, lastName, email, password });
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationErrors 
        });
      }

      // Create user
      const newUser = await this.userModel.createUser({ firstName, lastName, email, password });
      
      res.status(201).json({ 
        message: "User registered successfully",
        user: {
          user_id: newUser.user_id,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.message.includes("already exists")) {
        return res.status(409).json({ error: "User already exists. Please log in." });
      }
      
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Authenticate user
      const user = await this.userModel.authenticateUser(email, password);
      
      // Store user info in session (you might want to use JWT tokens instead)
      req.session = req.session || {};
      req.session.user = {
        userId: user.user_id,
        email: user.email,
        firstName: user.first_name
      };

      res.status(200).json({ 
        message: "Login successful",
        user: {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.message.includes("does not exist")) {
        return res.status(404).json({ error: "User does not exist. Please sign up first." });
      }
      
      if (error.message.includes("Invalid credentials")) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // User logout
  async logout(req, res) {
    try {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            return res.status(500).json({ error: "Could not log out" });
          }
          res.status(200).json({ message: "Logout successful" });
        });
      } else {
        res.status(200).json({ message: "No active session" });
      }
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Check authentication status
  async checkAuth(req, res) {
    try {
      if (req.session && req.session.user) {
        const user = await this.userModel.findUserById(req.session.user.userId);
        if (user) {
          res.status(200).json({ 
            authenticated: true,
            user: {
              user_id: user.user_id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email
            }
          });
        } else {
          res.status(401).json({ authenticated: false });
        }
      } else {
        res.status(401).json({ authenticated: false });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default AuthController;