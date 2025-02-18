import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import scrapeAndStoreStockData from "./real_time_data_fet.js";
import readline from "readline/promises"; // Use the promises API
import fs from "fs";
import pkg from "pg"; // Import the entire 'pg' package
const { Client } = pkg; // Destructure the 'Client' class from the package
import bcrypt from "bcrypt";
import cors from "cors";
import { error } from "console";
import { stringify } from "querystring";
import { exec } from "child_process";
import PDFDocument from 'pdfkit';
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
let emailid = process.env.EMAILID;
let user_id = process.env.USER_ID;
// Path to the .env file
const envFilePath = ".env";

// Helper function to get the current date in YYYY-MM-DD format
const getCurrentDate = () => new Date().toISOString().split("T")[0];

// Function to update the date in the .env file
const updateEnvDate = async (newDate) => {
  const envContent = fs.readFileSync(envFilePath, "utf-8");
  const updatedContent = envContent.replace(
    /LAST_CHECKED_DATE=.*/,
    `LAST_CHECKED_DATE=${newDate}`
  );
  // console.log(newDate);
  fs.writeFileSync(envFilePath, updatedContent, "utf-8");
  console.log(`Updated LAST_CHECKED_DATE to ${newDate} in .env file.`);
};
const checkDateChange = () => {
  const currentDate = getCurrentDate();
  const lastCheckedDate = process.env.LAST_CHECKED_DATE;

  if (lastCheckedDate !== currentDate) {
    console.log(`Date has changed from ${lastCheckedDate} to ${currentDate}`);
    // Perform your date-change logic here
    console.log("Executing logic for the new date...");
    scrapeAndStoreStockData();
    // Update the .env file with the new date
    updateEnvDate(currentDate);
  } else {
    console.log("Date has not changed. All good!");
  }
};
checkDateChange();
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
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      console.error("First name and last name should only contain alphabets");
      return res.status(400).json({
        error:
          "First name and last name should only contain alphabets (no spaces or special characters)",
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
//api endpoint for fetching username
app.get("/api/username", async (req, res) => {
  try {
    const query = `SELECT first_name FROM Users WHERE email= $1`;
    const result = await con.query(query, [emailid]);
    if (result.rows.length == 0) {
      return res.status(400).json({ error: "User not found" });
    }
    console.log(result.rows);
    res.json(result.rows[0].first_name);
  } catch (err) {
    console.error("Error in fetching username", error);
    res.status(500).json({ error: "username not found!" });
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

    const transaction_date = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
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
  //   return res.status(200).json({ msg: "working fine" });
});

app.get("/api/get_stock", async (req, res) => {
  const get_stock_info = ` 
  SELECT * 
  FROM stocks 
  WHERE user_id=$1
  `;

  try {
    const result = await con.query(get_stock_info, [user_id]);
    //console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//api endpoint to get transaction infromtion
app.get("/api/get_transaction", async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // SQL query to fetch transactions with company details and date filtering
  const get_transaction_query = `
    SELECT 
      t.transaction_id,
      t.user_id,
      t.company_id,
      c.company_name,
      t.transaction_type,
      t.quantity,
      t.total_amount,
      t.transaction_date,
      CASE 
        WHEN t.quantity = 0 THEN t.total_amount
        ELSE t.quantity * t.total_amount
      END AS calculated_amount
    FROM transactions t
    LEFT JOIN companies c ON t.company_id = c.company_id
    WHERE t.user_id = $1
    ${startDate && endDate ? `AND t.transaction_date BETWEEN $2 AND $3` : ''}
    ORDER BY t.transaction_date DESC;
  `;

  try {
    const queryParams = [user_id];
    if (startDate && endDate) {
      queryParams.push(startDate, endDate);
    }

    const result = await con.query(get_transaction_query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error in getting the transaction history:", error);
    res.status(500).json({ message: "Error in fetching the transaction data" });
  }
});

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
// api endpoint for extracting real-time-data for all companies for trade page
app.get("/api/all_companies", async (req, res) => {
  try {
    const query = `
            SELECT *  
            FROM companies
            ORDER BY company_name
        `;

    const result = await con.query(query);
    console.log("Companies data fetched:", result.rows.length, "records");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ error: "Error fetching company data" });
  }
});

//this api is to get particular transaction type
app.get("/api/know_transaction/:type", async (req, res) => {
  try {
    const { type } = req.params;

    const query = `SELECT * FROM transactions WHERE transaction_type=$1 AND user_id=$2`;

    const result = await con.query(query, [type, user_id]);

    console.log("Backend result:", result.rows); // Log the result to debug
    res.json(result.rows); // Send the rows as JSON
  } catch (error) {
    console.error("Error fetching transaction information:", error);
    res.status(404).json({ error: "Error fetching data" });
  }
});

// this api endpoint is used for buying and selling stocks
app.post("/api/trade", async (req, res) => {
  try {
    const { company_name, quantity1, operation } = req.body;
    // console.log("reacher_here");
    console.log(operation, company_name, quantity1);
    // console.log(quantity1);
    const quantity = parseInt(quantity1);
    // Query for user's balance
    const getUserBalance = `
    SELECT total_balance 
    FROM users
    WHERE user_id = $1;
    `;
    
    // Query for company details
    const getCompanyDetails = `
      SELECT company_id, ticker_symbol, stock_price, total_shares
      FROM companies
      WHERE company_name = $1;
    `;
    // Execute the queries
    const userBalance = await con.query(getUserBalance, [user_id]);
    const companyDetails = await con.query(getCompanyDetails, [company_name]);
    const stock_price = parseFloat(companyDetails.rows[0].stock_price);
    const ticker_symbol = companyDetails.rows[0].ticker_symbol;
    let total_shares = parseInt(companyDetails.rows[0].total_shares);
    const company_id = companyDetails.rows[0].company_id;
    let userTotalBalance = parseFloat(userBalance.rows[0].total_balance);
    // aukat pata karni hai
    if (operation === "Buy_stock") {
      // console.log(quantity);
      if (
        quantity * stock_price <= userTotalBalance &&
        total_shares >= quantity
      ) {
        total_shares = total_shares - quantity;
        userTotalBalance = userTotalBalance - quantity * stock_price;
        const updateUserBalance = `
        UPDATE users
        SET total_balance = $1
        WHERE user_id = $2
        `;
        await con.query(updateUserBalance, [userTotalBalance, user_id]);
        const updateCompanyShare = `
        UPDATE companies
        SET total_shares = $1
        WHERE company_id = $2
        `;
        await con.query(updateCompanyShare, [total_shares, company_id]);
        //to update the transaction table
        const transactionQuery = `
        INSERT INTO transactions (user_id,company_id,transaction_type,quantity,total_amount,transaction_date)
        VALUES($1, $2, $3, $4,$5,$6)
        `;
        
        const values = [
          user_id,
          company_id,
          operation,
          quantity,
          quantity * stock_price,
          new Date().toISOString().slice(0, 19).replace("T", " "),
        ];
        console.log(new Date().toISOString().slice(0, 19).replace("T", " "));
        await con.query(transactionQuery, values);
        // console.log(resolt);
        const stock_query = `
        INSERT INTO stocks (user_id, company_id, quantity, company_name, average_price)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, company_id)
        DO UPDATE
        SET 
        quantity = stocks.quantity + $3,
        average_price = ((stocks.average_price * stocks.quantity) + ($3 *   $5)) / (stocks.quantity + $3);
        `;
        // console.log(user_id);
        await con.query(stock_query, [
          user_id,
          company_id,
          quantity,
          company_name,
          stock_price,
        ]);
        console.log("reached here");
        console.log(userTotalBalance);
        res.json(userTotalBalance);
      } else {
        console.log("Insufficient balance");
        res
          .status(404)
          .json({ error: "Insufficient balance to carry transaction" });
      }
    } else if (operation === "Sell_stock") {
      const getTotalStockofUser = ` SELECT quantity
      FROM stocks
      WHERE user_id = $1 AND company_name = $2
      `;
      const resTotalStockofUser = await con.query(getTotalStockofUser, [
        user_id,
        company_name,
      ]);
      let totalStockofUser = parseInt(resTotalStockofUser.rows[0].quantity);
      if (totalStockofUser >= quantity) {
        const reducestockquery = `
        UPDATE stocks
        SET quantity = $1
        WHERE user_id= $2 AND company_name = $3
        `;
        // console.log((totalStockofUser-quantity));
        await con.query(reducestockquery, [
          totalStockofUser - quantity,
          user_id,
          company_name,
        ]);
        userTotalBalance = userTotalBalance + quantity * stock_price;
        const updateUserBalance = `
        UPDATE users
        SET total_balance = $1
        WHERE user_id = $2
        `;
        await con.query(updateUserBalance, [userTotalBalance, user_id]);
        const updateCompanyShare = `
        UPDATE companies
        SET total_shares = $1
        WHERE company_id = $2
        `;
        await con.query(updateCompanyShare, [
          total_shares + quantity,
          company_id,
        ]);
        //to update the transaction table
        const transactionQuery = `
        INSERT INTO Transactions (user_id,company_id,transaction_type,quantity,total_amount,transaction_date)
        VALUES($1, $2, $3, $4,$5,$6)
        `;

        const values = [
          user_id,
          company_id,
          operation,
          quantity,
          quantity * stock_price,
          new Date().toISOString().slice(0, 19).replace("T", " "),
        ];
        await con.query(transactionQuery, values);
        console.log(userTotalBalance);
        res.json(userTotalBalance);
      } else {
        res.status(404).json({ error: "Insufficient Stocks. Please verify" });
      }
    }
  } catch (err) {
    res
      .status(400)
      .json({ error: "Error in fetching the total balance of the user" });
  }
});

//function to extract real-time-news
const scrapeNews = async () => {
  const url = "https://www.google.com/finance/?hl=en";

  // Launch Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the URL
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Scrape news headlines and hyperlinks
    const newsData = await page.evaluate(() => {
      const newsItems = [];
      const elements = document.querySelectorAll(".Yfwt5"); // Adjust selector if necessary

      elements.forEach((element) => {
        const headline = element.textContent.trim();
        console.log(headline);
        const linkElement = element.closest("a"); // Get closest parent `<a>` tag
        const hyperlink = linkElement ? linkElement.href : null;

        if (headline && hyperlink) {
          newsItems.push({ headline, hyperlink });
        }
      });

      return newsItems;
    });

    // Display the extracted data in JSON format on the console
    return newsData;
  } catch (error) {
    console.error("Error scraping the data:", error);
  } finally {
    // Close the browser
    await browser.close();
  }
};

//api for current news
app.get("/api/current_news", async (req, res) => {
  try {
    const news = await scrapeNews();
    // console.log("news extracted successfully");
    res.json(news);
  } catch (err) {
    console.error("Error fetching in real time news:", err);
    res.status(500).json({ error: "Error fetching in real time news" });
  }
});

app.get("/api/real-time-data/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const query = `
            SELECT company_id,stock_price,total_shares FROM Companies WHERE ticker_symbol = $1
        `;
    const result = await con.query(query, [symbol]);
    console.log(
      `Real-time data fetched for ${symbol}:`,
      result.rows.length,
      "records"
    );
    const company_id = parseInt(result.rows[0].company_id);
    const stock_price = parseInt(result.rows[0].stock_price);
    const total_shares = parseInt(result.rows[0].total_shares);
    res.json({
      company_id: company_id,
      stock_price: stock_price,
      total_shares: total_shares,
    });
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
        content: `You are a database expert. Given a user whose user_id is ${user_id} and user's question and database schema, return only the single most relevant table name that would be needed to answer the question. Return just the table name as a string without any additional text or formatting.`,
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
      .map((row) => JSON.stringify(row))
      .join("\n");

    return {
      data: result.rows,
      contentString: contentString,
    };
  } catch (error) {
    console.error(`Error extracting content from ${tableName}:`, error);
    throw error;
  }
};

// Function to generate SQL query with table content context
const generateSQLQuery = async (
  prompt,
  dbStructure,
  tableName,
  tableContent
) => {
  // Create context with schema and table content
  const tableSchema = dbStructure[tableName];
  const schemaContext = `Table ${tableName}:\nColumns: ${tableSchema
    .map((col) => `${col.column}: ${col.type}`)
    .join(", ")}\n\nTable content sample:\n${tableContent.contentString.slice(
    0,
    1000
  )}...`; // Limiting content sample to avoid token limits

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
       You are an SQL expert who can only READ the database. Do not generate any queries related to INSERT, UPDATE, DELETE or other modification queries. You have access to the following database context:\n${schemaContext}\n and user_id is ${user_id} and emailid is ${emailid}.
        Do not entertain queries that request information about other users.
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
const interpretResults = async (
  prompt,
  queryResults,
  query,
  tableName,
  tableContent
) => {
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
    const sqlQuery = await generateSQLQuery(
      prompt,
      dbStructure,
      relevantTable,
      tableContent
    );
    
    // Step 5: Execute the query
    const sqlQueryTrim = sqlQuery.replace(/^```|```$/g, "").trim();
    console.log("Generated SQL Query:", sqlQueryTrim);
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
//api endpoint for calculating profit and loss
app.get("/api/profitloss", async (req, res) => {
  try {
    const query1 = `
        SELECT SUM(quantity * average_price) AS net_investment
        FROM stocks
        WHERE user_id = $1
    `;
    const response1 = await con.query(query1, [user_id]);
    const netinvested = response1.rows[0].net_investment;
    // console.log(netinvested);
    const query2 = `
      SELECT SUM(stock_price * quantity) AS net_recieved
      FROM companies,stocks 
      WHERE stocks.company_id = companies.company_id AND user_id = $1
    `;
    const response2 = await con.query(query2, [user_id]);
    const netrecieved = response2.rows[0].net_recieved;
    if (netrecieved > netinvested) {
      res.json({
        status: "Profit",
        amount: parseFloat((netrecieved - netinvested).toFixed(2)),
      });
    } else {
      res.json({
        status: "Loss",
        amount: parseFloat((netinvested - netrecieved).toFixed(2)),
      });
    }
  } catch (error) {
    console.error({ error: "Error in fetching profit/loss" });
    res.status(500).json({ error: "Error in fetching profit/loss" });
  }
});
//api endpoint for finding profit/loss for particular companies
app.get("/api/particularprofitloss", async (req, res) => {
  try {
    const query1 = `
      SELECT stocks.company_id ,stocks.company_name,stocks.average_price,companies.stock_price,stocks.quantity
      FROM stocks, companies
      WHERE stocks.quantity > 0 AND user_id = $1 AND stocks.company_id = companies.company_id;
    `;
    const response1 = await con.query(query1, [user_id]);
    console.log(response1.rows[0]);
    res.json(response1.rows);
  } catch (error) {
    console.error({
      error: "Error in fetching particular company profit/loss",
    });
    res
      .status(500)
      .json({ error: "Error in fetching particular company profit/loss" });
  }
});
//api endpoint for historical symbol
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

// API endpoint for generating transaction report
app.get("/api/generate-report", async (req, res) => {
  try {
    // Fetch transaction data
    const transactionQuery = `
      SELECT 
        t.transaction_type,
        c.company_name,
        t.quantity,
        t.total_amount as money_involved,
        to_char(t.transaction_date, 'DD/MM/YYYY') as formatted_date
      FROM transactions t
      LEFT JOIN companies c ON t.company_id = c.company_id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC
    `;

    const stockQuery = `
      SELECT 
        s.company_name,
        s.quantity,
        s.average_price    
      FROM stocks s
      WHERE s.user_id = $1 AND s.quantity > 0
    `;

    const [transactionResult, stockResult] = await Promise.all([
      con.query(transactionQuery, [user_id]),
      con.query(stockQuery, [user_id])
    ]);

    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=stock_report.pdf');
    
    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('Stock Trading Report', { align: 'center' });
    doc.moveDown();
    
    // Add transaction table
    doc.fontSize(16).text('Transaction History');
    doc.moveDown();
    
    // Define table layout
    const tableTop = 150;
    let tableRow = tableTop;
    
    // Add table headers
    doc.fontSize(12);
    doc.text('Type', 50, tableRow);
    doc.text('Company', 150, tableRow);
    doc.text('Quantity', 250, tableRow);
    doc.text('Amount', 350, tableRow);
    doc.text('Date', 450, tableRow);
    
    tableRow += 20;

    // Add transaction rows
    transactionResult.rows.forEach(tx => {
      const color = tx.transaction_type === 'Buy_stock' ? '#0000FF' : 
                   tx.transaction_type === 'Sell_stock' ? '#FF0000' : 
                   tx.transaction_type === 'deposited' ? '#00FF00' : '#FFA500';
                   
      const displayType = tx.transaction_type === 'Buy_stock' ? 'Buy' :
                         tx.transaction_type === 'Sell_stock' ? 'Sell' :
                         tx.transaction_type === 'deposited' ? 'Deposit' : 'Withdraw';

      doc.fillColor(color).text(displayType, 50, tableRow);
      doc.fillColor('black').text(tx.company_name || '-', 150, tableRow);
      doc.text(tx.quantity?.toString() || '-', 250, tableRow);
      doc.text(`$${tx.money_involved}`, 350, tableRow);
      doc.text(tx.formatted_date, 450, tableRow);
      
      tableRow += 20;
      
      // Add new page if needed
      if (tableRow > 700) {
        doc.addPage();
        tableRow = 50;
      }
    });

    // Add current holdings
    doc.addPage();
    doc.fontSize(16).text('Current Holdings');
    doc.moveDown();
    
    stockResult.rows.forEach(stock => {
      doc.fontSize(12).text(
        `${stock.company_name}: ${stock.quantity} shares at average price $${stock.average_price}`
      );
      doc.moveDown();
    });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
