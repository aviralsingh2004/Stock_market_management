import pkg from 'pg'; // Import the default export from 'pg'
const { Client } = pkg; // Extract Client from the imported package

import axios from 'axios';

// PostgreSQL database configuration
const dbConfig = {
  host: 'localhost',
  user: 'postgres',
  port: 5000,
  password: 'Aviral@2002', // Replace with your actual password
  database: 'trade'
};

// FMP API Key (Replace with your actual API key from Financial Modeling Prep)
const fmpApiKey = "HE9g9FrdZnOqaQm0sUJa1vfIf6cnKx8D";

// List of company symbols
const companySymbols = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "BRK.B", "META", "NVDA", "JPM", "JNJ",
    "V", "PG", "UNH", "HD", "MA", "XOM", "KO", "PFE", "PEP", "CSCO",
    "MRK", "ABT", "CMCSA", "AVGO", "ADBE", "NFLX", "INTC", "VZ", "DIS", "WMT",
    "TMO", "NKE", "MCD", "BAC", "CRM", "QCOM", "ACN", "COST", "TXN", "WFC",
    "T", "LIN", "MDT", "AMGN", "HON", "IBM", "NEE", "C", "BA", "PM",
    "UNP", "RTX", "SCHW", "LOW", "ORCL", "INTU", "SPGI", "AMAT", "GS", "MS",
    "BMY", "DE", "PYPL", "CAT", "PLD", "MMM", "MO", "AXP", "DUK", "CL",
    "CCI", "ADP", "TGT", "CVX", "APD", "PGR", "SO", "COP", "NOW", "FIS",
    "HUM", "BKNG", "BLK", "ISRG", "ELV", "USB", "EQIX", "LRCX", "REGN", "ZTS",
    "ADI", "GE", "LMT", "KMB", "NSC", "GD", "ITW", "NOC", "OXY", "ECL"
  ];

// Create a new instance of the Client
const client = new Client(dbConfig);

// Connect to PostgreSQL
client.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
    process.exit(1);
  }
  console.log('Connected to PostgreSQL');

  // Create the WORLD_COMPANIES table
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS WORLD_COMPANIES (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(10) NOT NULL,
      date DATE NOT NULL,
      open FLOAT,
      high FLOAT,
      low FLOAT,
      close FLOAT,
      volume BIGINT
    );
  `;

  client.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      process.exit(1);
    }
    console.log('Table created');

    // Fetch and insert data
    fetchDataAndInsert();
  });
});

// Fetch data from Financial Modeling Prep and insert it into the table
async function fetchDataAndInsert() {
  for (const symbol of companySymbols) {
    try {
      const response = await axios.get(
        `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}`,
        {
          params: {
            apikey: fmpApiKey,
          },
        }
      );

      const data = response.data.historical;
      if (!data) {
        console.error(`No historical data found for ${symbol}`);
        continue;
      }

      // Insert historical data into the database
      for (const record of data) {
        const { date, open, high, low, close, volume } = record;

        const insertQuery = `
          INSERT INTO WORLD_COMPANIES (symbol, date, open, high, low, close, volume)
          VALUES ($1, $2, $3, $4, $5, $6, $7);
        `;

        await client.query(insertQuery, [
          symbol,
          date,
          parseFloat(open),
          parseFloat(high),
          parseFloat(low),
          parseFloat(close),
          parseInt(volume)
        ]);
      }

      console.log(`Data for ${symbol} inserted successfully`);
    } catch (err) {
      console.error(`Error fetching or inserting data for ${symbol}:`, err);
    }
  }

  console.log('All data fetched and inserted. Closing connection.');
  client.end();
}
