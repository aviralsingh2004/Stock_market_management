import Groq from "groq-sdk";
import readline from "readline/promises"; // Use the promises API
import { stdin as input, stdout as output } from "process";
import pkg from "pg"; // Import the entire 'pg' package
const { Client } = pkg;
import { stringify } from "querystring";
// Directly insert your Groq API key
const API_KEY = ""; // Replace with your actual Groq API key

if (!API_KEY) {
  console.error("Error: Groq API key is not defined.");
  process.exit(1);
}
//DB connection setup
const con = new Client({
  host: "localhost",
  user: "postgres",
  port: 5000,
  password: "Aviral@2002", // Replace with your actual password
  database: "secrets",
});
con
  .connect()
  .then(async () => {
    console.log("DB connected");
  })
  .catch((err) => console.error("DB connection error:", err));
// Initialize the Groq client with the API key
const groq = new Groq({
  apiKey: API_KEY,
});

// Function to collect the user's prompt dynamically (using readline/promises)
const getUserPrompt = async () => {
  const rl = readline.createInterface({ input, output });
  const prompt = await rl.question("Enter your database question: ");
  rl.close();
  return prompt;
};

// Function to interact with the Groq API
const getGroqChatCompletion = async (userPrompt) => {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an SQL expert. Your task is only to generate valid SQL queries that perform Read operations on the table named 'employee' in CRUD language and do nothing else without any explanation or additional information. If something is asked that is out of context (not related to generating an SQL query for the 'employee' table), simply respond with 'Ask something about your Database.' and do not perform any other operation.",
      },
      {
        role: "user",
        content: userPrompt + " Return only the response without explanation.",
      },
    ],
    model: "llama3-70b-8192", // Replace with the appropriate model, if necessary
    temperature: 0.2,
    max_tokens: 512,
    top_p: 1,
    stop: null,
    stream: false,
  });
};

// Main function to start the SQL assistant
export const main = async () => {
  const prompt = await getUserPrompt(); // Collect user input dynamically
  let sqlCommand;
  if (prompt.toLowerCase() === "exit") {
    console.log("Exiting the SQL assistant. Goodbye!");
    return;
  }

  try {
    const chatCompletion = await getGroqChatCompletion(prompt);
    console.log("\nGenerated SQL Query:");
    const response = chatCompletion.choices[0]?.message?.content || "";
    sqlCommand = response.replace(/^```|```$/g, "").trim();
    console.log(sqlCommand);
    const query_res = await con.query(sqlCommand);
    const string_res = JSON.stringify(query_res.rows);
    console.log(string_res);
    const new_response_from_llm = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert in interpreting database outputs. When provided with a string representation of a JSON response, your task is to elaborate on it briefly in 2-3 sentences, explaining what the response means in simple and clear terms.",
        },
        {
          role: "user",
          content:
            string_res +
            " Interpret and explain this database output in 2-3 sentences.",
        },
      ],
      model: "llama3-70b-8192", // Replace with the appropriate model, if necessary
      temperature: 0.2,
      max_tokens: 150, // Limit output to ensure a concise response
      top_p: 1,
      stop: null,
      stream: false,
    });
    console.log(new_response_from_llm.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error while generating SQL query:", error.message);
  }
};

// Start the program
main();
