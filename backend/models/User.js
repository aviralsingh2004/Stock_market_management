import { getDbClient } from "../config/database.js";

import bcrypt from "bcrypt";

class User {
  get db() {
    if (!this._db) {
      this._db = getDbClient();
    }
    return this._db;
  }

  // Create a new user
  async createUser(userData) {
    const { firstName, lastName, email, password } = userData;
    try {
      // Check if user already exists
      const existingUser = await this.findUserByEmail(email);
      if (existingUser) {
        throw new Error("User already exists with this email");
      }
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      // Generate unique user ID
      const user_id = `user-${Date.now()}`;
      const total_balance = 0;
      const query = `
        INSERT INTO Users (user_id, first_name, last_name, email, password_hash, total_balance)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id, first_name, last_name, email, total_balance
      `;
      const values = [user_id, firstName, lastName, email, hashedPassword, total_balance];
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by email
  async findUserByEmail(email) {
    try {
      const query = "SELECT * FROM USERS WHERE email = $1";
      const result = await this.db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Authenticate user
  async authenticateUser(email, password) {
    try {
      const user = await this.findUserByEmail(email);
      if (!user) {
        throw new Error("User does not exist");
      }
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        throw new Error("Invalid credentials");
      }
      // Return user without password hash
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
  }

  // Get user by ID
  async findUserById(userId) {
    try {
      const query = "SELECT user_id, first_name, last_name, email, total_balance FROM USERS WHERE user_id = $1";
      const result = await this.db.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Update user balance
  async updateUserBalance(userId, newBalance) {
    try {
      const query = "UPDATE USERS SET total_balance = $1 WHERE user_id = $2 RETURNING total_balance";
      const result = await this.db.query(query, [newBalance, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user balance: ${error.message}`);
    }
  }

  // Get user balance
  async getUserBalance(email) {
    try {
      const query = "SELECT total_balance FROM USERS WHERE email = $1";
      const result = await this.db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting user balance: ${error.message}`);
    }
  }

  // Validate user input
  validateUserInput(userData) {
    const { firstName, lastName, email, password } = userData;
    const errors = [];
    if (!firstName || !email || !password) {
      errors.push("All fields (firstName, email, password) are required");
    }
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
    return errors;
  }
}

export default User;
