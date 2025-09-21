import { getDbClient } from "../config/database.js";

class Stock {
  get db() {
    if (!this._db) {
      this._db = getDbClient();
    }
    return this._db;
  }

  // Get user's stock portfolio
  async getUserStocks(userId) {
    try {
      const query = `
        SELECT s.*, c.company_name, c.ticker_symbol, c.stock_price as current_price
        FROM Stocks s
        JOIN Companies c ON s.company_id = c.company_id
        WHERE s.user_id = $1
        ORDER BY c.company_name
      `;
      const result = await this.db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching user stocks: ${error.message}`);
    }
  }

  // Get specific stock holding
  async getUserStock(userId, companyId) {
    try {
      const query = `
        SELECT s.*, c.company_name, c.ticker_symbol, c.stock_price as current_price
        FROM Stocks s
        JOIN Companies c ON s.company_id = c.company_id
        WHERE s.user_id = $1 AND s.company_id = $2
      `;
      const result = await this.db.query(query, [userId, companyId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching user stock: ${error.message}`);
    }
  }

  // Update or create stock holding (for buy/sell operations)
  async updateStockHolding(userId, companyId, quantity, averagePrice) {
    try {
      const query = `
        INSERT INTO Stocks (user_id, company_id, quantity, average_price)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, company_id)
        DO UPDATE SET 
          quantity = $3,
          average_price = $4
        RETURNING *
      `;
      
      const result = await this.db.query(query, [userId, companyId, quantity, averagePrice]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating stock holding: ${error.message}`);
    }
  }

  // Remove stock holding (when quantity becomes 0)
  async removeStockHolding(userId, companyId) {
    try {
      const query = "DELETE FROM Stocks WHERE user_id = $1 AND company_id = $2";
      await this.db.query(query, [userId, companyId]);
      return true;
    } catch (error) {
      throw new Error(`Error removing stock holding: ${error.message}`);
    }
  }

  // Calculate portfolio value
  async getPortfolioValue(userId) {
    try {
      const query = `
        SELECT 
          SUM(s.quantity * c.stock_price) as total_value,
          COUNT(*) as total_holdings
        FROM Stocks s
        JOIN Companies c ON s.company_id = c.company_id
        WHERE s.user_id = $1
      `;
      const result = await this.db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error calculating portfolio value: ${error.message}`);
    }
  }

  // Get stocks with profit/loss information
  async getStocksWithProfitLoss(userId) {
    try {
      const query = `
        SELECT 
          s.*,
          c.company_name,
          c.ticker_symbol,
          c.stock_price as current_price,
          (c.stock_price - s.average_price) * s.quantity as unrealized_pnl,
          ((c.stock_price - s.average_price) / s.average_price) * 100 as pnl_percentage
        FROM Stocks s
        JOIN Companies c ON s.company_id = c.company_id
        WHERE s.user_id = $1
        ORDER BY unrealized_pnl DESC
      `;
      const result = await this.db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching stocks with P&L: ${error.message}`);
    }
  }
}

export default Stock;