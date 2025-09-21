import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

class UserController {
  constructor() {
    this.userModel = new User();
    this.transactionModel = new Transaction();
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const { userId } = req.params;
      
      const user = await this.userModel.findUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        user: {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          total_balance: user.total_balance
        }
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get username
  async getUsername(req, res) {
    try {
      // console.log("Reached here");
      const email = req.session?.user?.email;
      if (!email) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await this.userModel.findUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user.first_name);
    } catch (error) {
      console.error("Get username error:", error);
      res.status(500).json({ error: "Username not found!" });
    }
  }

  // Get user balance
  async getBalance(req, res) {
    try {
      const email = req.session?.user?.email;
      
      if (!email) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const balanceData = await this.userModel.getUserBalance(email);
      
      if (!balanceData) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ 
        balance: balanceData.total_balance,
        email: email 
      });
    } catch (error) {
      console.error("Get balance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Update user balance
  async updateBalance(req, res) {
    try {
      const { amount } = req.body;
      const userId = req.session?.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: "Valid amount is required" });
      }

      // Get current balance
      const user = await this.userModel.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newBalance = parseFloat(user.total_balance) + parseFloat(amount);
      
      if (newBalance < 0) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const updatedBalance = await this.userModel.updateUserBalance(userId, newBalance);

      res.status(200).json({ 
        message: "Balance updated successfully",
        new_balance: updatedBalance.total_balance 
      });
    } catch (error) {
      console.error("Update balance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Set total balance (for admin or initial setup)
  async setTotalBalance(req, res) {
    try {
      const { total_balance, val, operation } = req.body;
      const userId = req.session?.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      let newBalance;

      // Handle legacy format (val + operation) for compatibility
      if (val !== undefined && operation !== undefined) {
        if (isNaN(val) || val <= 0) {
          return res.status(400).json({ error: "Invalid amount" });
        }

        // Get current balance
        const user = await this.userModel.findUserById(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const currentBalance = parseFloat(user.total_balance);

        if (operation === "add") {
          newBalance = currentBalance + parseFloat(val);
          // Create deposit transaction record
          await this.transactionModel.createBalanceTransaction({
            userId: userId,
            transactionType: 'deposit',
            amount: parseFloat(val)
          });
        } else if (operation === "withdraw") {
          if (currentBalance - val < 0) {
            return res.status(400).json({ error: "Insufficient balance" });
          }
          newBalance = currentBalance - parseFloat(val);
          // Create withdrawal transaction record
          await this.transactionModel.createBalanceTransaction({
            userId: userId,
            transactionType: 'withdraw',
            amount: parseFloat(val)
          });
        } else {
          return res.status(400).json({ error: "Invalid operation. Must be 'add' or 'withdraw'" });
        }
      } else if (total_balance !== undefined) {
        // Handle new format
        if (isNaN(total_balance)) {
          return res.status(400).json({ error: "Valid total balance is required" });
        }
        newBalance = parseFloat(total_balance);
      } else {
        return res.status(400).json({ error: "Either total_balance or val+operation is required" });
      }

      const updatedBalance = await this.userModel.updateUserBalance(userId, newBalance);

      res.status(200).json({ 
        message: "Balance updated successfully",
        balance: updatedBalance.total_balance 
      });
    } catch (error) {
      console.error("Set total balance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default UserController;