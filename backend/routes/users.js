import express from "express";
import UserController from "../controllers/UserController.js";
import { validateBalance } from "../middleware/validation.js";

const router = express.Router();
const userController = new UserController();

// Get user profile
router.get("/profile/:userId", (req, res) => userController.getProfile(req, res));

// Get username
router.get("/username", (req, res) => userController.getUsername(req, res));

// Get user balance
router.get("/balance", (req, res) => userController.getBalance(req, res));

// Update user balance (add/withdraw)
router.post("/balance", (req, res) => userController.updateBalance(req, res));

// Set total balance
router.post("/total_balance", (req, res) => userController.setTotalBalance(req, res));

export default router;