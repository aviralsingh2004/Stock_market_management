import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pkg from 'pg'; // Import the entire 'pg' package
const { Client } = pkg; // Destructure the 'Client' class from the package
import bcrypt from 'bcrypt';
import cors from 'cors';


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
        await initializeDatabase(); // Initialize tables
    })
    .catch((err) => console.error("DB connection error: ", err));

// Function to initialize database tables
async function initializeDatabase() {
    try {
        const sqlFilePath = path.join(__dirname, 'db', 'tables.sql');
        const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
        await con.query(sqlCommands);
        console.log("Tables initialized successfully");
    } catch (err) {
        console.error("Error initializing tables:", err);
    }
}

// Routes
app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

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


// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});