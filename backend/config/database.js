import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pkg;

// Database configuration
const dbConfig = {
  host: "localhost",
  user: "postgres",
  port: process.env.DB_PORT,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
};

// Create a single database connection instance
let dbClient = null;

// Function to initialize database connection
export const initializeDatabase = async () => {
  try {
    dbClient = new Client(dbConfig);
    await dbClient.connect();
    console.log("Database connected successfully");
    return dbClient;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

// Function to get database client
export const getDbClient = () => {
  if (!dbClient) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return dbClient;
};

// Function to close database connection
export const closeDatabaseConnection = async () => {
  if (dbClient) {
    await dbClient.end();
    dbClient = null;
    console.log("Database connection closed");
  }
};

export default { initializeDatabase, getDbClient, closeDatabaseConnection };