import express from "express";
import StockController from "../controllers/StockController.js";
import { validateTrade } from "../middleware/validation.js";

const router = express.Router();
const stockController = new StockController();

// Get user's stock portfolio
router.get("/portfolio", (req, res) => stockController.getPortfolio(req, res));

// Get all companies
router.get("/companies", (req, res) => stockController.getAllCompanies(req, res));

// Get companies with user's holdings
router.get("/companies/with-holdings", (req, res) => stockController.getCompaniesWithHoldings(req, res));

// Execute a trade (buy/sell)
router.post("/trade", validateTrade, (req, res) => stockController.executeTrade(req, res));

// Get stocks with profit/loss information
router.get("/profit-loss", (req, res) => stockController.getStocksWithProfitLoss(req, res));

export default router;