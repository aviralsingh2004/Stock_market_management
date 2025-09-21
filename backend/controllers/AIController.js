import Groq from "groq-sdk";
import { getDbClient } from "../config/database.js";

class AIController {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  get db() {
    if (!this._db) {
      this._db = getDbClient();
    }
    return this._db;
  }

  // Process AI prompt/query
  async processPrompt(req, res) {
    try {
      const { prompt } = req.body;
      const userId = req.session?.user?.userId;
      const email = req.session?.user?.email;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!prompt || prompt.trim() === "") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Get database structure for AI context
      const dbStructure = await this.getTableStructures();
      
      // Determine which table is most relevant for the query
      const relevantTable = await this.determineRelevantTable(prompt, dbStructure, userId, email);
      
      if (!relevantTable) {
        return res.status(400).json({ 
          error: "Could not determine relevant data for your query" 
        });
      }

      // Extract table content for context
      const tableContent = await this.extractTableContent(relevantTable);
      
      // Generate SQL query
      const sqlQuery = await this.generateSQLQuery(
        prompt, 
        dbStructure, 
        relevantTable, 
        tableContent,
        userId,
        email
      );

      // Execute the query
      const cleanedQuery = this.cleanSQLQuery(sqlQuery);
      console.log("Original SQL query:", sqlQuery);
      console.log("Cleaned SQL query:", cleanedQuery);
      const queryResults = await this.db.query(cleanedQuery);
      
      // Interpret results with AI
      const interpretation = await this.interpretResults(
        prompt,
        queryResults.rows,
        sqlQuery,
        relevantTable,
        tableContent
      );

      res.status(200).json({
        query: prompt,
        sql_executed: sqlQuery,
        raw_results: queryResults.rows,
        interpretation: interpretation,
        table_used: relevantTable
      });

    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({ 
        error: "Error processing your query",
        details: error.message 
      });
    }
  }

  // Clean SQL query by removing markdown code blocks and extra formatting
  cleanSQLQuery(sqlQuery) {
    if (!sqlQuery) return '';
    
    // Remove markdown code blocks
    let cleaned = sqlQuery.replace(/```sql/gi, '').replace(/```/g, '');
    
    // Remove leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // Remove any extra line breaks at the beginning or end
    cleaned = cleaned.replace(/^\n+|\n+$/g, '');
    
    // If there are multiple lines, join them properly
    cleaned = cleaned.replace(/\n\s*\n/g, '\n').trim();
    
    return cleaned;
  }

  // Get database table structures
  async getTableStructures() {
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

      const result = await this.db.query(query);
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
      throw new Error(`Error fetching table structures: ${error.message}`);
    }
  }

  // Determine which table is most relevant for the query
  async determineRelevantTable(prompt, dbStructure, userId, email) {
    const schemaDescription = Object.entries(dbStructure)
      .map(([tableName, columns]) => {
        const columnDesc = columns
          .map((col) => `${col.column}: ${col.type}`)
          .join(", ");
        return `Table ${tableName} has columns: ${columnDesc}`;
      })
      .join("\\n");

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a database expert. Given a user whose user_id is ${userId} and user's question and database schema, return only the single most relevant table name that would be needed to answer the question. Return just the table name as a string without any additional text or formatting.`,
          },
          {
            role: "user",
            content: `Schema:\\n${schemaDescription}\\n\\nQuestion: ${prompt}\\n\\nReturn only the most relevant table name.`,
          },
        ],
        model: "groq/compound-mini",
        temperature: 0.1,
        max_tokens: 50,
      });

      return completion.choices[0]?.message?.content.trim();
    } catch (error) {
      throw new Error(`Error determining relevant table: ${error.message}`);
    }
  }

  // Extract content from specified table
  async extractTableContent(tableName) {
    try {
      const query = `SELECT * FROM ${tableName} LIMIT 100;`;
      const result = await this.db.query(query);

      const contentString = result.rows
        .map((row) => JSON.stringify(row))
        .join("\\n");

      return {
        data: result.rows,
        contentString: contentString,
      };
    } catch (error) {
      throw new Error(`Error extracting content from ${tableName}: ${error.message}`);
    }
  }

  // Generate SQL query with AI
  async generateSQLQuery(prompt, dbStructure, tableName, tableContent, userId, email) {
    const tableSchema = dbStructure[tableName];
    const schemaContext = `Table ${tableName}:\\nColumns: ${tableSchema
      .map((col) => `${col.column}: ${col.type}`)
      .join(", ")}\\n\\nTable content sample:\\n${tableContent.contentString.slice(
      0,
      1000
    )}...`;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
            You are an SQL expert who can only READ the database. Do not generate any queries related to INSERT, UPDATE, DELETE or other modification queries. You have access to the following database context:\\n${schemaContext}\\n and user_id is ${userId} and emailid is ${email}.
            Do not entertain queries that request information about other users.
            Return ONLY the raw SQL query without any markdown formatting, code blocks, explanations, or additional text.
            Do not use \`\`\`sql or \`\`\` in your response.
            Generate a SQL query that answers the user's question using the provided table.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "groq/compound-mini",
        temperature: 0.2,
        max_tokens: 512,
      });

      return completion.choices[0]?.message?.content.trim();
    } catch (error) {
      throw new Error(`Error generating SQL query: ${error.message}`);
    }
  }

  // Interpret query results with AI
  async interpretResults(prompt, queryResults, query, tableName, tableContent) {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert at interpreting database results. Provide a clear, natural language answer to the user's question. Include relevant context from the data but be concise.`,
          },
          {
            role: "user",
            content: `Original question: ${prompt}\\n
                     Query executed: ${query}\\n
                     Table used: ${tableName}\\n
                     Results: ${JSON.stringify(queryResults)}\\n
                     Please provide a clear answer to the original question based on these results.`,
          },
        ],
        model: "groq/compound-mini",
        temperature: 0.3,
        max_tokens: 150,
      });

      return completion.choices[0]?.message?.content;
    } catch (error) {
      throw new Error(`Error interpreting results: ${error.message}`);
    }
  }
}

export default AIController;