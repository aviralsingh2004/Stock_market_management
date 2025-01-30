import pkg from "pg";
import axios from "axios";
const { Client } = pkg;

// PostgreSQL configuration
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "World_trade",
  password: " ",
  port: 5000, // Corrected the property name to 'port'
});

// List of companies' ticker symbols
const companies = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "TSLA",
  "META",
  "NFLX",
  "NVDA",
  "BRK.A",
  "JPM",
  "V",
  "UNH",
  "HD",
  "PG",
  "DIS",
  "MA",
  "PYPL",
  "ADBE",
  "PFE",
  "CSCO",
  "INTC",
  "PEP",
  "KO",
  "CMCSA",
  "ABT",
  "CVX",
  "T",
  "MRK",
  "WMT",
  "NKE",
  "XOM",
  "LLY",
  "ORCL",
  "BAC",
  "COST",
  "MCD",
  "PM",
  "CRM",
  "IBM",
  "ACN",
  "AMD",
  "AVGO",
  "TXN",
  "QCOM",
  "TMO",
  "UPS",
  "UNP",
  "LIN",
  "SBUX",
  "MDT",
  "CAT",
  "HON",
  "NEE",
  "GS",
  "RTX",
  "SPGI",
  "NOW",
  "BLK",
  "CHTR",
  "AMAT",
  "DHR",
  "INTU",
  "AMGN",
  "ADP",
  "DE",
  "LOW",
  "PLD",
  "MS",
  "ZTS",
  "BA",
  "AXP",
  "LMT",
  "BMY",
  "ISRG",
  "CI",
  "BKNG",
  "GE",
  "FIS",
  "MO",
  "SCHW",
  "TJX",
  "GILD",
  "CVS",
  "TGT",
  "F",
  "MMM",
  "C",
  "DUK",
  "ATVI",
  "ADSK",
  "AEP",
  "WM",
  "ECL",
  "EW",
  "CL",
  "AON",
  "APD",
  "COP",
  "CCI",
  "REGN",
];

// Fetch stock data from Alpha Vantage
async function fetchStockData(symbol) {
  try {
    const response = await axios.get("https://www.alphavantage.co/query", {
      params: {
        function: "GLOBAL_QUOTE",
        symbol,
        apikey: "SBD6BNDNY2E4HWPW", // Replace with your Alpha Vantage API key
      },
    });

    const data = response.data["Global Quote"];
    if (!data || Object.keys(data).length === 0) {
      console.error(`No data found for symbol: ${symbol}`);
      return null;
    }

    return {
      name: symbol, // Replace with a mapping for actual company names if needed
      symbol: data["01. symbol"],
      stock_price: parseFloat(data["03. high"]),
      total_stocks: Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000, // Random between 1000 and 10000
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);
    return null;
  }
}

// Insert data into PostgreSQL
async function insertData(stockData) {
  try {
    const query = `
            INSERT INTO Companies (name, symbol, stock_price, total_stocks)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (symbol)
            DO UPDATE SET
                stock_price = EXCLUDED.stock_price,
                total_stocks = EXCLUDED.total_stocks;
        `;
    const values = [
      stockData.name,
      stockData.symbol,
      stockData.stock_price,
      stockData.total_stocks,
    ];

    await client.query(query, values);
    console.log(`Data inserted/updated for ${stockData.symbol}`);
  } catch (error) {
    console.error(
      `Error inserting data for ${stockData.symbol}:`,
      error.message
    );
  }
}

// Main function
(async () => {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    // Ensure the table exists
    const createTableQuery = `
            CREATE TABLE IF NOT EXISTS Companies (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                symbol VARCHAR(15) UNIQUE NOT NULL,
                stock_price FLOAT NOT NULL,
                total_stocks INT NOT NULL
            );
        `;
    await client.query(createTableQuery);

    // Fetch and insert stock data
    for (const symbol of companies) {
      const stockData = await fetchStockData(symbol);
      if (stockData) {
        await insertData(stockData);
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.end();
    console.log("Database connection closed");
  }
})();
