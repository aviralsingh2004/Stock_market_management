import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import fs from 'fs';
import pkg from 'pg'; // Import the entire 'pg' package
const { Client } = pkg; // Destructure the 'Client' class from the package
import bcrypt from 'bcrypt';
import cors from 'cors';
import { error } from 'console';
import { stringify } from 'querystring';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 4000;

const app = express();

// API middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000', // Your React app's URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// app.use(express.static('public'));

// DB connection setup
const con = new Client({
    host: "localhost",
    user: "postgres",
    port: 5000,
    password: "Aviral@2002", // Replace with your actual password
    database: "trade"
});

// Connect to the database
con.connect()
    .then(async () => {
        console.log("DB connected");
        //  await initializeDatabase(); // Initialize tables
    })
    .catch((err) => console.error("DB connection error: ", err));

// Function to initialize database tables
//console.log("reached here")
//  async function initializeDatabase() {
//      try {
//          const sqlFilePath = path.join(__dirname, 'db', 'tables.sql');
//          const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
//          await con.query(sqlCommands);
//          console.log("Tables initialized successfully");
//      } catch (err) {
//         console.error("Error initializing tables:",err);
//     }
//  }

//  console.log("reached here")

// // Routes
// app.get('/form', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.get('/signup', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'signup.html'));
// });

app.post('/formPost', async (req, res) => {
    try {
        console.log("Received login request:", req.body); // Debug log

        const { email, password } = req.body;

        if (!email || !password) {
            console.error("Missing required fields");
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Check if the user exists in the database
        const checkQuery = "SELECT * FROM USERS WHERE email = $1";
        console.log("Executing query with email:", email); // Debug log
        const result = await con.query(checkQuery, [email]);

        console.log("Query result:", result.rows.length); // Debug log

        if (result.rows.length === 0) {
            console.error("User does not exist in the database");
            return res.status(404).json({ error: "User does not exist. Please sign up first." });
        }

        // User exists; verify the password
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        console.log("Password match:", passwordMatch); // Debug log

        if (!passwordMatch) {
            console.error("Invalid password");
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Route to the home page if credentials are valid
        console.log("User authenticated successfully:", email);
        res.status(200).json({ message: "Login successful" });

    } catch (err) {
        console.error("Detailed error in login:", err); // More detailed error logging
        res.status(500).json({ error: "Internal server error" });
    }
});



 

app.post('/signUpPost', async (req, res) => {
    try {
        console.log("Sign-up form submitted:", req.body);

        const { firstName, lastName, email, password } = req.body;

        // Validate input fields
        if (!firstName || !email || !password) {
            console.error("Missing required fields");
            return res.status(400).json({ error: "All fields (firstName, email, password) are required" });
        }

        // Check if the user already exists
        const checkQuery = "SELECT * FROM USERS WHERE email = $1";
        const existingUser = await con.query(checkQuery, [email]);

        if (existingUser.rows.length > 0) {
            console.error("User already exists with this email");
            return res.status(409).json({ error: "User already exists. Please log in." });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into the USERS table
        const uuid = `user-${Date.now()}`; // Generate a simple unique identifier
        const insertQuery = `
            INSERT INTO USERS (uuid, first_name, last_name, email, password_hash)
            VALUES ($1, $2, $3, $4, $5)
        `;
        const values = [uuid, firstName, lastName, email, hashedPassword];

        await con.query(insertQuery, values);

        console.log("New user created successfully:", email);
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error processing sign-up:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Add this new endpoint for fetching real time company data
function getRandomShares(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
async function scrapeAndStoreStockData() {
    // List of stock symbols you want to scrape
    const stockSymbols = {
      AAPL: "NASDAQ",MSFT: "NASDAQ", GOOGL: "NASDAQ", AMZN: "NASDAQ", TSLA: "NASDAQ",
      "BRK.B": "NYSE", META: "NASDAQ", NVDA: "NASDAQ", JPM: "NYSE", JNJ: "NYSE",
      V: "NYSE", PG: "NYSE", UNH: "NYSE", HD: "NYSE", MA: "NYSE", XOM: "NYSE",
      KO: "NYSE", PFE: "NYSE", PEP: "NASDAQ", CSCO: "NASDAQ", MRK: "NYSE",
      ABT: "NYSE", CMCSA: "NASDAQ", AVGO: "NASDAQ", ADBE: "NASDAQ", NFLX: "NASDAQ",
      INTC: "NASDAQ", VZ: "NYSE", DIS: "NYSE", WMT: "NYSE", TMO: "NYSE",
      NKE: "NYSE", MCD: "NYSE", BAC: "NYSE", CRM: "NYSE", QCOM: "NASDAQ",
      ACN: "NYSE", COST: "NASDAQ", TXN: "NASDAQ", WFC: "NYSE", T: "NYSE",
      LIN: "NYSE", MDT: "NYSE", AMGN: "NASDAQ", HON: "NASDAQ", IBM: "NYSE",
      NEE: "NYSE", C: "NYSE", BA: "NYSE", PM: "NYSE", UNP: "NYSE", RTX: "NYSE",
      SCHW: "NYSE", LOW: "NYSE", ORCL: "NYSE", INTU: "NASDAQ", SPGI: "NYSE",
      AMAT: "NASDAQ", GS: "NYSE", MS: "NYSE", BMY: "NYSE", DE: "NYSE", PYPL: "NASDAQ",
      CAT: "NYSE", PLD: "NYSE", MMM: "NYSE", MO: "NYSE", AXP: "NYSE", DUK: "NYSE",
      CL: "NYSE", CCI: "NYSE", ADP: "NASDAQ", TGT: "NYSE", CVX: "NYSE", APD: "NYSE",
      PGR: "NYSE", SO: "NYSE", COP: "NYSE", NOW: "NYSE", FIS: "NYSE", HUM: "NYSE",
      BKNG: "NASDAQ", BLK: "NYSE", ISRG: "NASDAQ", ELV: "NYSE", USB: "NYSE",
      EQIX: "NASDAQ", LRCX: "NASDAQ", REGN: "NASDAQ", ZTS: "NYSE", ADI: "NASDAQ",
      GE: "NYSE", LMT: "NYSE", KMB: "NYSE", NSC: "NYSE", GD: "NYSE", ITW: "NYSE",
      NOC: "NYSE", OXY: "NYSE", ECL: "NYSE",
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
          const price = document.querySelector(".YMlKec.fxKbKc")
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
  
    // const client = new Client(dbConfig);
    // await client.connect();
  
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
  
        await con.query(query, [company_name, ticker_symbol, stock_price, total_shares]);
        console.log(`Inserted/Updated ${company_name} (${ticker_symbol})`);
      }
    } catch (error) {
      console.error('Database operation failed:', error.message);
    } finally {
      await con.end();
      console.log('Database connection closed.');
    }
}
app.get('/api/real-time-data', async (req, res) => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS Companies (
            company_id SERIAL PRIMARY KEY,
            company_name VARCHAR(100) NOT NULL,
            ticker_symbol VARCHAR(10) UNIQUE NOT NULL,
            stock_price NUMERIC(10, 2) NOT NULL,
            total_shares INT NOT NULL
        );
        `
        const result = await con.query(query);
        console.log("Companies table created successfully");
        const response = await scrapeAndStoreStockData();
        res.json(result.rows);
    } catch (error) {
        console.log("Error running in the function :",error);
        res.status(500).json({error: "Function running error"});
    }
});

// Add this new endpoint after your existing routes
app.get('/api/companies', async (req, res) => {
    try {
        const query = `
            SELECT symbol, date, open, high, low, close, volume 
            FROM market_data 
            WHERE date = (SELECT MAX(date) FROM market_data)
            ORDER BY symbol
        `;
        
        const result = await con.query(query);
        console.log("Companies data fetched:", result.rows.length, "records");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching companies:", err);
        res.status(500).json({ error: "Error fetching company data" });
    }
});

app.get('/api/real-time-data/:symbol',async (req,res)=>{
    try{
        const { symbol } = req.params;
        const query = `
            SELECT stock_price FROM Companies WHERE ticker_symbol = $1
        `;
        const result = await con.query(query, [symbol]);
        console.log(`Real-time data fetched for ${symbol}:`, result.rows.length, "records");
        const result1 = stringify(result.rows[0]);
        res.json(result1);
    } catch(err){
        console.error("Error fetching real-time data:", err);
        res.status(500).json({ error: "Error fetching real-time data" });
    }
});
// this is the endpoint for particular company searched using symbol
app.get('/api/historical/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const query = `
            SELECT date, open, high, low, close, volume 
            FROM market_data 
            WHERE symbol = $1 
            ORDER BY date DESC 
            LIMIT 30
        `;
        
        const result = await con.query(query, [symbol]);
        console.log(`Historical data fetched for ${symbol}:`, result.rows.length, "records");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching historical data:", err);
        res.status(500).json({ error: "Error fetching historical data" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});