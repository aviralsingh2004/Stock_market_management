// const puppeteer = require('puppeteer');
// const { Client } = require('pg');
import pkg from "pg";
const { Client } = pkg;
import puppeteer from "puppeteer";
// PostgreSQL configuration
const dbConfig = {
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "yash2002@annu", // Replace with your actual password
  database: "stock_trade",
};

// Function to get random number for total shares
// Utility function to generate random shares
function getRandomShares(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Named function for scraping and storing stock data
async function scrapeAndStoreStockData() {
  // List of stock symbols you want to scrape
  const stockSymbols = {
    AAPL: "NASDAQ",
    MSFT: "NASDAQ",
    GOOGL: "NASDAQ",
    AMZN: "NASDAQ",
    TSLA: "NASDAQ",
    "BRK.B": "NYSE",
    META: "NASDAQ",
    NVDA: "NASDAQ",
    JPM: "NYSE",
    JNJ: "NYSE",
    V: "NYSE",
    PG: "NYSE",
    UNH: "NYSE",
    HD: "NYSE",
    MA: "NYSE",
    XOM: "NYSE",
    KO: "NYSE",
    PFE: "NYSE",
    PEP: "NASDAQ",
    CSCO: "NASDAQ",
    MRK: "NYSE",
    ABT: "NYSE",
    CMCSA: "NASDAQ",
    AVGO: "NASDAQ",
    ADBE: "NASDAQ",
    NFLX: "NASDAQ",
    INTC: "NASDAQ",
    VZ: "NYSE",
    DIS: "NYSE",
    WMT: "NYSE",
    TMO: "NYSE",
    NKE: "NYSE",
    MCD: "NYSE",
    BAC: "NYSE",
    CRM: "NYSE",
    QCOM: "NASDAQ",
    ACN: "NYSE",
    COST: "NASDAQ",
    TXN: "NASDAQ",
    WFC: "NYSE",
    T: "NYSE",
    LIN: "NYSE",
    MDT: "NYSE",
    AMGN: "NASDAQ",
    HON: "NASDAQ",
    IBM: "NYSE",
    NEE: "NYSE",
    C: "NYSE",
    BA: "NYSE",
    PM: "NYSE",
    UNP: "NYSE",
    RTX: "NYSE",
    SCHW: "NYSE",
    LOW: "NYSE",
    ORCL: "NYSE",
    INTU: "NASDAQ",
    SPGI: "NYSE",
    AMAT: "NASDAQ",
    GS: "NYSE",
    MS: "NYSE",
    BMY: "NYSE",
    DE: "NYSE",
    PYPL: "NASDAQ",
    CAT: "NYSE",
    PLD: "NYSE",
    MMM: "NYSE",
    MO: "NYSE",
    AXP: "NYSE",
    DUK: "NYSE",
    CL: "NYSE",
    CCI: "NYSE",
    ADP: "NASDAQ",
    TGT: "NYSE",
    CVX: "NYSE",
    APD: "NYSE",
    PGR: "NYSE",
    SO: "NYSE",
    COP: "NYSE",
    NOW: "NYSE",
    FIS: "NYSE",
    HUM: "NYSE",
    BKNG: "NASDAQ",
    BLK: "NYSE",
    ISRG: "NASDAQ",
    ELV: "NYSE",
    USB: "NYSE",
    EQIX: "NASDAQ",
    LRCX: "NASDAQ",
    REGN: "NASDAQ",
    ZTS: "NYSE",
    ADI: "NASDAQ",
    GE: "NYSE",
    LMT: "NYSE",
    KMB: "NYSE",
    NSC: "NYSE",
    GD: "NYSE",
    ITW: "NYSE",
    NOC: "NYSE",
    OXY: "NYSE",
    ECL: "NYSE",
  };

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const stockData = [];

  for (const [symbol, exchange] of Object.entries(stockSymbols)) {
    try {
      const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;
      console.log(`Fetching data for ${symbol} from ${url}`);

      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Extract stock data
      const data = await page.evaluate(() => {
        const name = document.querySelector(".zzDege")?.textContent || "N/A";
        const price =
          document
            .querySelector(".YMlKec.fxKbKc")
            ?.textContent.replace(/[$,]/g, "") || "0";
        return { name, price };
      });

      stockData.push({ symbol, exchange, ...data });
      console.log(`Scraped ${symbol}:`, data);
    } catch (error) {
      console.error(`Failed to scrape ${symbol}:`, error.message);
    }
  }

  await browser.close();

  const client = new Client(dbConfig);
  await client.connect();

  try {
    for (const stock of stockData) {
      const company_name = stock.name;
      const ticker_symbol = stock.symbol;
      let stock_price = parseFloat(stock.price);
      const total_shares = getRandomShares(1000, 10000);

      const query = `
        INSERT INTO Companies (company_name, ticker_symbol, stock_price, total_shares)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (ticker_symbol) 
        DO UPDATE SET stock_price = EXCLUDED.stock_price, total_shares = EXCLUDED.total_shares;
      `;

      await client.query(query, [
        company_name,
        ticker_symbol,
        stock_price,
        total_shares,
      ]);
      console.log(`Inserted/Updated ${company_name} (${ticker_symbol})`);
    }
  } catch (error) {
    console.error("Database operation failed:", error.message);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

// Export the named function for reuse in other files
scrapeAndStoreStockData();
