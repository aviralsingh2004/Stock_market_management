import { getDbClient } from "../config/database.js";

class Transaction {
  get db() {
    if (!this._db) {
      this._db = getDbClient();
    }
    return this._db;
  }

  // Create a new transaction
  async createTransaction(transactionData) {
    const { userId, companyId, transactionType, quantity, totalAmount } = transactionData;
    
    try {
      const query = `
        INSERT INTO Transactions (user_id, company_id, transaction_type, quantity, total_amount)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await this.db.query(query, [userId, companyId, transactionType, quantity, totalAmount]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
  }

  // Create a balance transaction (deposit/withdrawal)
  async createBalanceTransaction(transactionData) {
    const { userId, transactionType, amount } = transactionData;
    
    try {
      const query = `
        INSERT INTO Transactions (user_id, company_id, transaction_type, quantity, total_amount)
        VALUES ($1, NULL, $2, 1, $3)
        RETURNING *
      `;
      
      const result = await this.db.query(query, [userId, transactionType, amount]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating balance transaction: ${error.message}`);
    }
  }

  // Get user's transaction history
  async getUserTransactions(userId, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT 
          t.*,
          COALESCE(c.company_name, 
            CASE 
              WHEN t.transaction_type = 'deposit' THEN 'Balance Deposit'
              WHEN t.transaction_type = 'withdraw' THEN 'Balance Withdrawal'
              ELSE 'Unknown'
            END
          ) as company_name,
          COALESCE(c.ticker_symbol, 
            CASE 
              WHEN t.transaction_type = 'deposit' THEN 'DEPOSIT'
              WHEN t.transaction_type = 'withdraw' THEN 'WITHDRAW'
              ELSE 'N/A'
            END
          ) as ticker_symbol
        FROM Transactions t
        LEFT JOIN Companies c ON t.company_id = c.company_id
        WHERE t.user_id = $1
        ORDER BY t.transaction_date DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await this.db.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching user transactions: ${error.message}`);
    }
  }

  // Get transactions by type (buy/sell)
  async getTransactionsByType(userId, transactionType) {
    try {
      const query = `
        SELECT 
          t.*,
          c.company_name,
          c.ticker_symbol
        FROM Transactions t
        JOIN Companies c ON t.company_id = c.company_id
        WHERE t.user_id = $1 AND t.transaction_type = $2
        ORDER BY t.transaction_date DESC
      `;
      
      const result = await this.db.query(query, [userId, transactionType]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching transactions by type: ${error.message}`);
    }
  }

  // Calculate realized profit/loss for a user
  async calculateRealizedProfitLoss(userId) {
    try {
      const query = `
        WITH buy_transactions AS (
          SELECT 
            company_id,
            SUM(quantity) as total_bought,
            SUM(total_amount) as total_buy_amount
          FROM Transactions
          WHERE user_id = $1 AND transaction_type = 'buy'
          GROUP BY company_id
        ),
        sell_transactions AS (
          SELECT 
            company_id,
            SUM(quantity) as total_sold,
            SUM(total_amount) as total_sell_amount
          FROM Transactions
          WHERE user_id = $1 AND transaction_type = 'sell'
          GROUP BY company_id
        )
        SELECT 
          c.company_name,
          c.ticker_symbol,
          COALESCE(b.total_bought, 0) as total_bought,
          COALESCE(s.total_sold, 0) as total_sold,
          COALESCE(b.total_buy_amount, 0) as total_buy_amount,
          COALESCE(s.total_sell_amount, 0) as total_sell_amount,
          COALESCE(s.total_sell_amount, 0) - COALESCE(b.total_buy_amount, 0) as realized_pnl
        FROM Companies c
        LEFT JOIN buy_transactions b ON c.company_id = b.company_id
        LEFT JOIN sell_transactions s ON c.company_id = s.company_id
        WHERE (b.company_id IS NOT NULL OR s.company_id IS NOT NULL)
        ORDER BY realized_pnl DESC
      `;
      
      const result = await this.db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error calculating realized P&L: ${error.message}`);
    }
  }

  // Get total profit/loss for a specific company
  async getCompanyProfitLoss(userId, companyId) {
    try {
      const query = `
        SELECT 
          c.company_name,
          c.ticker_symbol,
          SUM(CASE WHEN t.transaction_type = 'buy' THEN t.total_amount ELSE 0 END) as total_invested,
          SUM(CASE WHEN t.transaction_type = 'sell' THEN t.total_amount ELSE 0 END) as total_returns,
          SUM(CASE WHEN t.transaction_type = 'buy' THEN t.quantity ELSE 0 END) as total_bought,
          SUM(CASE WHEN t.transaction_type = 'sell' THEN t.quantity ELSE 0 END) as total_sold,
          (SUM(CASE WHEN t.transaction_type = 'sell' THEN t.total_amount ELSE 0 END) - 
           SUM(CASE WHEN t.transaction_type = 'buy' THEN t.total_amount ELSE 0 END)) as realized_pnl
        FROM Transactions t
        JOIN Companies c ON t.company_id = c.company_id
        WHERE t.user_id = $1 AND t.company_id = $2
        GROUP BY c.company_id, c.company_name, c.ticker_symbol
      `;
      
      const result = await this.db.query(query, [userId, companyId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error calculating company P&L: ${error.message}`);
    }
  }

  // Get transaction summary
  async getTransactionSummary(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_transactions,
          SUM(CASE WHEN transaction_type = 'buy' THEN total_amount ELSE 0 END) as total_invested,
          SUM(CASE WHEN transaction_type = 'sell' THEN total_amount ELSE 0 END) as total_returns,
          COUNT(CASE WHEN transaction_type = 'buy' THEN 1 END) as buy_count,
          COUNT(CASE WHEN transaction_type = 'sell' THEN 1 END) as sell_count
        FROM Transactions
        WHERE user_id = $1
      `;
      
      const result = await this.db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching transaction summary: ${error.message}`);
    }
  }

  // Get user's current stock holdings
  async getUserCurrentHoldings(userId) {
    try {
      const query = `
        SELECT 
          c.company_name,
          c.ticker_symbol,
          SUM(CASE WHEN t.transaction_type = 'buy' THEN t.quantity ELSE -t.quantity END) as quantity,
          AVG(CASE WHEN t.transaction_type = 'buy' THEN t.total_amount / t.quantity END) as average_price
        FROM Transactions t
        JOIN Companies c ON t.company_id = c.company_id
        WHERE t.user_id = $1
        GROUP BY c.company_id, c.company_name, c.ticker_symbol
        HAVING SUM(CASE WHEN t.transaction_type = 'buy' THEN t.quantity ELSE -t.quantity END) > 0
        ORDER BY c.company_name
      `;
      
      const result = await this.db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching user holdings: ${error.message}`);
    }
  }
}

export default Transaction;