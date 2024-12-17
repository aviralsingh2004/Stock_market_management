import express from "express";
import cors from "cors";
import pg from "pg"; // PostgreSQL library

// Extract the Pool class from pg
const { Pool } = pg;

// Create an Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Database Configuration
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "stockdata",
    password: "Aviral@2002",
    port: 5000,                  // Default PostgreSQL port
});

// Test Route
app.get("/", (req, res) => {
  res.send("Stock API is running!");
});

// API Route: Fetch stock data for a specific stock symbol
app.get("/api/stocks/:symbol", async (req, res) => {
  const { symbol } = req.params; // Stock symbol from the request URL

  try {
    // Query to fetch stock data from the PostgreSQL database
    const query = `
      SELECT date, open, high, low, close, volume
      FROM stock_prices
      WHERE symbol = $1
      ORDER BY date ASC;
    `;

    // Execute the query
    const { rows } = await pool.query(query, [symbol]);

    // Send the query result as JSON
    res.json(rows);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

// Start the Server
const PORT = 3000; // Server will run on port 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
