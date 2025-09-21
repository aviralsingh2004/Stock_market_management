import { getDbClient } from "../config/database.js";

class Company {
  get db() {
    if (!this._db) {
      this._db = getDbClient();
    }
    return this._db;
  }

  // Get all companies
  async getAllCompanies() {
    try {
      const query = "SELECT * FROM Companies ORDER BY company_name";
      const result = await this.db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching companies: ${error.message}`);
    }
  }

  // Get company by ID
  async getCompanyById(companyId) {
    try {
      const query = "SELECT * FROM Companies WHERE company_id = $1";
      const result = await this.db.query(query, [companyId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching company by ID: ${error.message}`);
    }
  }

  // Get company by ticker symbol
  async getCompanyBySymbol(tickerSymbol) {
    try {
      const query = "SELECT * FROM Companies WHERE ticker_symbol = $1";
      const result = await this.db.query(query, [tickerSymbol]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching company by symbol: ${error.message}`);
    }
  }

  // Update company stock price
  async updateStockPrice(companyId, newPrice) {
    try {
      const query = "UPDATE Companies SET stock_price = $1 WHERE company_id = $2 RETURNING *";
      const result = await this.db.query(query, [newPrice, companyId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating stock price: ${error.message}`);
    }
  }

  // Create or update company
  async upsertCompany(companyData) {
    const { companyName, tickerSymbol, stockPrice, totalShares } = companyData;
    
    try {
      const query = `
        INSERT INTO Companies (company_name, ticker_symbol, stock_price, total_shares)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (ticker_symbol) 
        DO UPDATE SET 
          company_name = EXCLUDED.company_name,
          stock_price = EXCLUDED.stock_price,
          total_shares = EXCLUDED.total_shares
        RETURNING *
      `;
      
      const result = await this.db.query(query, [companyName, tickerSymbol, stockPrice, totalShares]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error upserting company: ${error.message}`);
    }
  }
}

export default Company;