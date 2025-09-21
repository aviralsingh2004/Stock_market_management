import Stock from "../models/Stock.js";
import Company from "../models/Company.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

class StockController {
  constructor() {
    this.stockModel = new Stock();
    this.companyModel = new Company();
    this.transactionModel = new Transaction();
    this.userModel = new User();
  }

  // Get user's stock portfolio
  async getPortfolio(req, res) {
    try {
      const userId = req.session?.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const stocks = await this.stockModel.getUserStocks(userId);
      const portfolioValue = await this.stockModel.getPortfolioValue(userId);

      res.status(200).json({
        stocks,
        portfolio_summary: {
          total_value: portfolioValue.total_value || 0,
          total_holdings: portfolioValue.total_holdings || 0
        }
      });
    } catch (error) {
      console.error("Get portfolio error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get all companies
  async getAllCompanies(req, res) {
    try {
      const companies = await this.companyModel.getAllCompanies();
      res.status(200).json(companies);
    } catch (error) {
      console.error("Get companies error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get companies with user's holdings
  async getCompaniesWithHoldings(req, res) {
    try {
      const userId = req.session?.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const companies = await this.companyModel.getAllCompanies();
      const userStocks = await this.stockModel.getUserStocks(userId);

      // Create a map of user holdings by company_id
      const holdingsMap = userStocks.reduce((acc, stock) => {
        acc[stock.company_id] = stock;
        return acc;
      }, {});

      // Combine company data with user holdings
      const companiesWithHoldings = companies.map(company => ({
        ...company,
        user_holding: holdingsMap[company.company_id] || null
      }));

      res.status(200).json(companiesWithHoldings);
    } catch (error) {
      console.error("Get companies with holdings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Execute a trade (buy/sell)
  async executeTrade(req, res) {
    try {
      const { company_id, quantity, transaction_type } = req.body;
      const userId = req.session?.user?.userId;

      console.log("Trade request:", { company_id, quantity, transaction_type, userId });

      if (!userId) {
        console.log("Authentication failed - no userId in session");
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!company_id || !quantity || !transaction_type) {
        console.log("Missing required fields:", { company_id, quantity, transaction_type });
        return res.status(400).json({ error: "Company ID, quantity, and transaction type are required" });
      }

      if (!["buy", "sell"].includes(transaction_type)) {
        console.log("Invalid transaction type:", transaction_type);
        return res.status(400).json({ error: "Transaction type must be 'buy' or 'sell'" });
      }

      // Get company information
      const company = await this.companyModel.getCompanyById(company_id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      const totalAmount = parseFloat(company.stock_price) * parseInt(quantity);

      // Get user's current balance and stock holding
      const user = await this.userModel.findUserById(userId);
      const currentStock = await this.stockModel.getUserStock(userId, company_id);

      if (transaction_type === "buy") {
        // Check if user has sufficient balance
        if (user.total_balance < totalAmount) {
          return res.status(400).json({ error: "Insufficient balance" });
        }

        // Calculate new average price and quantity
        let newQuantity = parseInt(quantity);
        let newAveragePrice = parseFloat(company.stock_price);

        if (currentStock) {
          const currentValue = currentStock.quantity * currentStock.average_price;
          const newValue = newQuantity * newAveragePrice;
          const totalValue = currentValue + newValue;
          
          newQuantity = currentStock.quantity + newQuantity;
          newAveragePrice = totalValue / newQuantity;
        }

        // Update stock holding
        await this.stockModel.updateStockHolding(userId, company_id, newQuantity, newAveragePrice);

        // Update user balance
        const newBalance = user.total_balance - totalAmount;
        await this.userModel.updateUserBalance(userId, newBalance);

      } else { // sell
        // Check if user has sufficient stocks
        if (!currentStock || currentStock.quantity < quantity) {
          return res.status(400).json({ error: "Insufficient stocks to sell" });
        }

        const newQuantity = currentStock.quantity - parseInt(quantity);

        if (newQuantity === 0) {
          // Remove stock holding if quantity becomes 0
          await this.stockModel.removeStockHolding(userId, company_id);
        } else {
          // Update stock holding with new quantity (keep same average price)
          await this.stockModel.updateStockHolding(userId, company_id, newQuantity, currentStock.average_price);
        }

        // Update user balance
        const newBalance = parseFloat(user.total_balance) + totalAmount;
        await this.userModel.updateUserBalance(userId, newBalance);
      }

      // Record the transaction
      await this.transactionModel.createTransaction({
        userId,
        companyId: company_id,
        transactionType: transaction_type,
        quantity: parseInt(quantity),
        totalAmount
      });

      res.status(200).json({
        message: `${transaction_type} order executed successfully`,
        transaction: {
          company_name: company.company_name,
          ticker_symbol: company.ticker_symbol,
          quantity: parseInt(quantity),
          price: parseFloat(company.stock_price),
          total_amount: totalAmount,
          transaction_type
        }
      });

    } catch (error) {
      console.error("Execute trade error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get stocks with profit/loss information
  async getStocksWithProfitLoss(req, res) {
    try {
      const userId = req.session?.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const stocksWithPnL = await this.stockModel.getStocksWithProfitLoss(userId);

      console.log("Stocks with P&L:", stocksWithPnL);

      // Calculate total unrealized profit/loss
      const totalUnrealizedPnL = stocksWithPnL.reduce((total, stock) => {
        const pnl = parseFloat(stock.unrealized_pnl) || 0;
        console.log(`Stock: ${stock.company_name}, P&L: ${pnl}`);
        return total + pnl;
      }, 0);

      console.log("Total Unrealized P&L:", totalUnrealizedPnL);

      // Determine status based on total P&L
      const status = totalUnrealizedPnL >= 0 ? "Profit" : "Loss";

      const summary = {
        status: status,
        amount: Math.abs(totalUnrealizedPnL),
        total_unrealized_pnl: totalUnrealizedPnL
      };

      console.log("Summary being sent:", summary);

      // Return both detailed stocks and summary
      res.status(200).json({
        stocks: stocksWithPnL,
        summary: summary
      });
    } catch (error) {
      console.error("Get stocks with P&L error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default StockController;