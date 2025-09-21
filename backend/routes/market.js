import express from "express";
import { getDbClient } from "../config/database.js";
import scrapeAndStoreStockData from "../services/dataFetcher.js";
import { scrapeNews } from "../services/newsScraper.js";

const router = express.Router();

// Get real-time market data
router.get("/real-time", async (req, res) => {
  try {
    const db = getDbClient();
    
    // Create companies table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS Companies (
        company_id SERIAL PRIMARY KEY,
        company_name VARCHAR(100) NOT NULL,
        ticker_symbol VARCHAR(10) UNIQUE NOT NULL,
        stock_price NUMERIC(10, 2) NOT NULL,
        total_shares INT NOT NULL
      );
    `;
    
    await db.query(createTableQuery);
    console.log("Companies table created successfully");
    
    // Fetch and store latest data
    const response = await scrapeAndStoreStockData();
    
    res.status(200).json({
      message: "Real-time data updated successfully",
      data: response
    });
  } catch (error) {
    console.error("Error fetching real-time data:", error);
    res.status(500).json({ error: "Error fetching real-time data" });
  }
});

// Get companies market data for current date
router.get("/companies", async (req, res) => {
  try {
    const db = getDbClient();
    const query = `
      SELECT symbol, date, open, high, low, close, volume 
      FROM market_data 
      WHERE date = (SELECT MAX(date) FROM market_data)
      ORDER BY symbol
    `;

    const result = await db.query(query);
    console.log("Companies data fetched:", result.rows.length, "records");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Error fetching company data" });
  }
});

// Get all companies from companies table
router.get("/all-companies", async (req, res) => {
  try {
    const db = getDbClient();
    const query = `
      SELECT *  
      FROM companies
      ORDER BY company_name
    `;

    const result = await db.query(query);
    console.log("Companies data fetched:", result.rows.length, "records");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Error fetching company data" });
  }
});

// Get real-time data for specific symbol
router.get("/real-time/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const db = getDbClient();
    
    const query = `
      SELECT company_id, stock_price, total_shares 
      FROM Companies 
      WHERE ticker_symbol = $1
    `;
    
    const result = await db.query(query, [symbol]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Company with symbol ${symbol} not found` });
    }

    console.log(`Real-time data fetched for ${symbol}:`, result.rows.length, "records");
    
    const company = result.rows[0];
    res.status(200).json({
      company_id: parseInt(company.company_id),
      stock_price: parseFloat(company.stock_price),
      total_shares: parseInt(company.total_shares),
    });
  } catch (error) {
    console.error("Error fetching real-time data:", error);
    res.status(500).json({ error: "Error fetching real-time data" });
  }
});

// Get historical data for a symbol
router.get("/historical/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 30 } = req.query;
    const db = getDbClient();
    
    const query = `
      SELECT date, open, high, low, close, volume 
      FROM market_data 
      WHERE symbol = $1 
      ORDER BY date DESC 
      LIMIT $2
    `;

    const result = await db.query(query, [symbol, parseInt(limit)]);
    console.log(`Historical data fetched for ${symbol}:`, result.rows.length, "records");
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    res.status(500).json({ error: "Error fetching historical data" });
  }
});

// Get current financial news
router.get("/news", async (req, res) => {
  try {
    const news = await scrapeNews();
    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Error fetching news" });
  }
});

export default router;