import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import Groq from "groq-sdk";
import dotenv from 'dotenv';
import readline from "readline/promises"; // Use the promises API
import fs from "fs";
import pkg from "pg"; // Import the entire 'pg' package
const { Client } = pkg; // Destructure the 'Client' class from the package
import bcrypt from "bcrypt";
import cors from "cors";
import { error } from "console";
import { stringify } from "querystring";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 4000;
const app = express();
const API_KEY = process.env.GROQ_API_KEY;
// API middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000", // Your React app's URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// app.use(express.static('public'));

// DB connection setup
const con = new Client({
  host: "localhost",
  user: "postgres",
  port: process.env.DB_PORT,
  password: process.env.PASSWORD, // Replace with your actual password
  database: process.env.DATABASE,
});

// Connect to the database
con
  .connect()
  .then(async () => {
    console.log("DB connected");
    //  await initializeDatabase(); // Initialize tables
  })
  .catch((err) => console.error("DB connection error: ", err));
const groq = new Groq({
  apiKey: API_KEY,
});
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
let emailid=process.env.EMAILID;
let user_id=process.env.USER_ID;

app.post("/formPost", async (req, res) => {
  try {
    // console.log("Received login request:", req.body); // Debug log

    const { email, password } = req.body;

    if (!email || !password) {
      console.error("Missing required fields");
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if the user exists in the database
    const checkQuery = "SELECT * FROM USERS WHERE email = $1";
    // console.log("Executing query with email:", email); // Debug log
    const result = await con.query(checkQuery, [email]);

    console.log("Query result:", result.rows.length); // Debug log

    if (result.rows.length === 0) {
      console.error("User does not exist in the database");
      return res
        .status(404)
        .json({ error: "User does not exist. Please sign up first." });
    }

    // User exists; verify the password
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    // console.log("Password match:", passwordMatch); // Debug log

    if (!passwordMatch) {
      console.error("Invalid password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Route to the home page if credentials are valid
    //console.log("User authenticated successfully:", email);
    emailid = email;
    const query = "SELECT user_id FROM USERS WHERE email=$1";
    const uuid = await con.query(query, [emailid]);

    user_id = uuid.rows[0].user_id;
    console.log(user_id);
    // console.log(uuid.rows[0].user_id);
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Detailed error in login:", err); // More detailed error logging
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/signUpPost", async (req, res) => {
  try {
    console.log("Sign-up form submitted:", req.body);

    const { firstName, lastName, email, password } = req.body;

    // Validate input fields
    if (!firstName || !email || !password) {
      console.error("Missing required fields");
      return res.status(400).json({
        error: "All fields (firstName, email, password) are required",
      });
    }

    // Check if the user already exists
    const checkQuery = "SELECT * FROM USERS WHERE email = $1";
    const existingUser = await con.query(checkQuery, [email]);

    if (existingUser.rows.length > 0) {
      console.error("User already exists with this email");
      return res
        .status(409)
        .json({ error: "User already exists. Please log in." });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const total_balance = 0;
    // Insert new user into the USERS table
    const user_id = `user-${Date.now()}`; // Generate a simple unique identifier
    const query = `
    INSERT INTO Users (user_id, first_name, last_name, email, password_hash, total_balance)
    VALUES ($1, $2, $3, $4, $5, $6)
`;

    const values = [
      user_id,
      firstName,
      lastName,
      email,
      hashedPassword,
      total_balance,
    ];

    await con.query(query, values);

    console.log("New user created successfully:", email);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error processing sign-up:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
//api endpoint for finding total-balance
app.get("/api/user/balance", async (req, res) => {
  try {
    const email = emailid;
    if (email == undefined) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const query = `SELECT total_balance FROM Users WHERE email = $1`;
    const result = await con.query(query, [email]);
    if (result.rows.length == 0) {
      return res.status(400).json({ error: "User not found" });
    }
    res.json({ balance: parseFloat(result.rows[0].total_balance) });
  } catch (err) {
    console.error("Error fetching balance:", err);
    res.status(500).json({ error: "Error fetching balance" });
  }
});

// val funds
//api endpoint to update total balance of user via funds/upi payment

app.post("/api/user/total_balance", async (req, res) => {
  try {
    const email = emailid; // Assuming you store email in session
    if (email === undefined) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { val, operation } = req.body;
    if (val == undefined || isNaN(val) || val <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    let query = "SELECT total_balance FROM Users WHERE email = $1";
    console.log(email);
    const result = await con.query(query, [email]);
    if (result.rows.length == 0) {
      return res.status(404).json({ error: "User not found" });
    }
    // if(result.rows[0].total_balance==NaN){
    //     result.rows[0].total_balance=0.0;
    // }
    let netamount;
    if (operation == "add") {
      netamount = parseFloat(result.rows[0].total_balance) + parseFloat(val);
    } else if (operation == "withdraw") {
      if (result.rows[0].total_balance - val < 0) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      netamount = parseFloat(result.rows[0].total_balance) - parseFloat(val);
    }
    await con.query("UPDATE Users SET total_balance = $1 WHERE email = $2", [
      netamount,
      email,
    ]);

    console.log("Balance updated successfully:", netamount);
    query = `INSERT INTO Transactions (user_id,company_id,transaction_type,quantity,total_amount,transaction_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const transaction_type = operation === "add" ? "deposited" : "withdrawn";

    const transaction_date = new Date().toLocaleDateString();
    await con.query(query, [
      user_id,
      null,
      transaction_type,
      0,
      val,
      transaction_date,
    ]);
    console.log(user_id);
    res.json({ success: true, balance: netamount });
    // console.log(query);
  } catch (err) {
    console.error("Error updating balance:", err);
    res.status(500).json({ error: "Error updating balance" });
  }
});

//THIS IS FOR TRADE
app.post("/api/user/trade", (req, res) => {
  return res.status(200).json({ msg: "working fine" });
});

// val this new endpoint for fetching real time company data
function getRandomShares(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
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

      await con.query(query, [
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
    await con.end();
    console.log("Database connection closed.");
  }
}
app.get("/api/real-time-data", async (req, res) => {
  try {
    const query = `
            CREATE TABLE IF NOT EXISTS Companies (
            company_id SERIAL PRIMARY KEY,
            company_name VARCHAR(100) NOT NULL,
            ticker_symbol VARCHAR(10) UNIQUE NOT NULL,
            stock_price NUMERIC(10, 2) NOT NULL,
            total_shares INT NOT NULL
        );
        `;
    const result = await con.query(query);
    console.log("Companies table created successfully");
    const response = await scrapeAndStoreStockData();
    res.json(result.rows);
  } catch (error) {
    console.log("Error running in the function :", error);
    res.status(500).json({ error: "Function running error" });
  }
});

// val this new endpoint after your existing routes
app.get("/api/companies", async (req, res) => {
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

app.get("/api/real-time-data/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const query = `
            SELECT stock_price FROM Companies WHERE ticker_symbol = $1
        `;
    const result = await con.query(query, [symbol]);
    console.log(
      `Real-time data fetched for ${symbol}:`,
      result.rows.length,
      "records"
    );
    const result1 = stringify(result.rows[0]);
    res.json(result1);
  } catch (err) {
    console.error("Error fetching real-time data:", err);
    res.status(500).json({ error: "Error fetching real-time data" });
  }
});
// this is the endpoint for particular company searched using symbol
// Function to get all table names from the database
const getAllTables = async () => {
  const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
    `;
  try {
    const result = await con.query(query);
    return result.rows.map((row) => row.table_name);
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw error;
  }
};

// Function to get structure for all tables
const getTableStructures = async () => {
  const dbStructure = {};
  try {
    const query = `
      SELECT 
        table_name,
        column_name,
        data_type
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name, ordinal_position;
    `;

    const result = await con.query(query);
    result.rows.forEach((row) => {
      if (!dbStructure[row.table_name]) {
        dbStructure[row.table_name] = [];
      }
      dbStructure[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
      });
    });

    return dbStructure;
  } catch (error) {
    console.error("Error fetching table structures:", error);
    throw error;
  }
};

// Function to let the agent decide which table to use
const determineRelevantTable = async (prompt, dbStructure) => {
  const schemaDescription = Object.entries(dbStructure)
    .map(([tableName, columns]) => {
      const columnDesc = columns
        .map((col) => `${col.column}: ${col.type}`)
        .join(", ");
      return `Table ${tableName} has columns: ${columnDesc}`;
    })
    .join("\n");

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a database expert. Given a user's question and database schema, return only the single most relevant table name that would be needed to answer the question. Return just the table name as a string without any additional text or formatting.`,
      },
      {
        role: "user",
        content: `Schema:\n${schemaDescription}\n\nQuestion: ${prompt}\n\nReturn only the most relevant table name.`,
      },
    ],
    model: "llama3-70b-8192",
    temperature: 0.1,
    max_tokens: 50,
  });

  return completion.choices[0]?.message?.content.trim();
};

// Function to extract all content from the selected table
const extractTableContent = async (tableName) => {
  try {
    // Get all data from the table
    const query = `SELECT * FROM ${tableName};`;
    const result = await con.query(query);
    
    // Convert the table content to a formatted string
    const contentString = result.rows
      .map(row => JSON.stringify(row))
      .join('\n');
    
    return {
      data: result.rows,
      contentString: contentString
    };
  } catch (error) {
    console.error(`Error extracting content from ${tableName}:`, error);
    throw error;
  }
};

// Function to generate SQL query with table content context
const generateSQLQuery = async (prompt, dbStructure, tableName, tableContent) => {
  // Create context with schema and table content
  const tableSchema = dbStructure[tableName];
  const schemaContext = `Table ${tableName}:\nColumns: ${tableSchema
    .map((col) => `${col.column}: ${col.type}`)
    .join(", ")}\n\nTable content sample:\n${tableContent.contentString.slice(0, 1000)}...`; // Limiting content sample to avoid token limits

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an SQL expert who can only READ the database. Do not generate any queries related to INSERT, UPDATE, DELETE or other modification queries. You have access to the following database context:\n${schemaContext}\n
                Return only the SQL query without any explanation.
                Generate a SQL query that answers the user's question using the provided table.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama3-70b-8192",
    temperature: 0.2,
    max_tokens: 512,
  });

  return completion.choices[0]?.message?.content.trim();
};

// Function to interpret query results
const interpretResults = async (prompt, queryResults, query, tableName, tableContent) => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an expert at interpreting database results. Provide a clear, natural language answer to the user's question. Include relevant context from the data but be concise.`,
      },
      {
        role: "user",
        content: `Original question: ${prompt}\n
                 Query executed: ${query}\n
                 Table used: ${tableName}\n
                 Results: ${JSON.stringify(queryResults)}\n
                 Please provide a clear answer to the original question based on these results.`,
      },
    ],
    model: "llama3-70b-8192",
    temperature: 0.3,
    max_tokens: 150,
  });

  return completion.choices[0]?.message?.content;
};

// AI Inference API endpoint
app.post("/api/processPrompt", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Step 1: Get database schema
    const dbStructure = await getTableStructures();
    
    // Step 2: Determine the relevant table
    const relevantTable = await determineRelevantTable(prompt, dbStructure);
    
    // Step 3: Extract content from the relevant table
    const tableContent = await extractTableContent(relevantTable);
    
    // Step 4: Generate SQL query with context
    const sqlQuery = await generateSQLQuery(prompt, dbStructure, relevantTable, tableContent);
    console.log("Generated SQL Query:", sqlQuery);
    
    // Step 5: Execute the query
    const sqlQueryTrim = sqlQuery.replace(/^```|```$/g, "").trim();
    const queryResult = await con.query(sqlQueryTrim);
    
    // Step 6: Interpret results with full context
    const interpretation = await interpretResults(
      prompt,
      queryResult.rows,
      sqlQuery,
      relevantTable,
      tableContent
    );

    // Send response
    res.json({
      response: interpretation,
      query: sqlQuery,
      relevantTable: relevantTable,
      rawResults: queryResult.rows,
    });
  } catch (err) {
    console.error("Error processing prompt:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/historical/:symbol", async (req, res) => {
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
    console.log(
      `Historical data fetched for ${symbol}:`,
      result.rows.length,
      "records"
    );
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
