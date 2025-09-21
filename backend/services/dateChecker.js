import fs from "fs";
import scrapeAndStoreStockData from "./dataFetcher.js";

// Path to the .env file
const envFilePath = ".env";

// Helper function to get the current date in YYYY-MM-DD format
export const getCurrentDate = () => new Date().toISOString().split("T")[0];

// Function to update the date in the .env file
export const updateEnvDate = async (newDate) => {
  try {
    const envContent = fs.readFileSync(envFilePath, "utf-8");
    const updatedContent = envContent.replace(
      /LAST_CHECKED_DATE=.*/,
      `LAST_CHECKED_DATE=${newDate}`
    );
    
    fs.writeFileSync(envFilePath, updatedContent, "utf-8");
    console.log(`Updated LAST_CHECKED_DATE to ${newDate} in .env file.`);
  } catch (error) {
    console.error("Error updating .env file:", error);
    throw error;
  }
};

// Function to check if date has changed and trigger data update
export const checkDateChange = async () => {
  try {
    const currentDate = getCurrentDate();
    const lastCheckedDate = process.env.LAST_CHECKED_DATE;

    if (lastCheckedDate !== currentDate) {
      console.log(`Date has changed from ${lastCheckedDate} to ${currentDate}`);
      console.log("Executing logic for the new date...");
      
      // Trigger data update
      await scrapeAndStoreStockData();
      
      // Update the .env file with the new date
      await updateEnvDate(currentDate);
      
      return true; // Date changed
    } else {
      console.log("Date has not changed. All good!");
      return false; // Date hasn't changed
    }
  } catch (error) {
    console.error("Error checking date change:", error);
    throw error;
  }
};

export default {
  getCurrentDate,
  updateEnvDate,
  checkDateChange
};