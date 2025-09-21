import express from "express";
import TransactionController from "../controllers/TransactionController.js";

const router = express.Router();
const transactionController = new TransactionController();

// Get user's transaction history
router.get("/", (req, res) => transactionController.getTransactionHistory(req, res));

// Get transactions by type (buy/sell)
router.get("/type/:type", (req, res) => transactionController.getTransactionsByType(req, res));

// Get realized profit/loss
router.get("/profit-loss", (req, res) => transactionController.getRealizedProfitLoss(req, res));

// Get profit/loss for a specific company
router.get("/profit-loss/:companyId", (req, res) => transactionController.getCompanyProfitLoss(req, res));

// Get transaction summary
router.get("/summary", (req, res) => transactionController.getTransactionSummary(req, res));

// Generate PDF report
router.get("/report", (req, res) => transactionController.generateReport(req, res));

export default router;