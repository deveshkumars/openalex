import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
import cors from "cors";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
//   ssl: false // change to { rejectUnauthorized: false } if needed
});

// Basic test endpoint
app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

// Example: get all rows from a table
app.get("/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, title FROM openalex.works LIMIT 10;");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
});

// SQL query handler - accepts SQL queries via POST
app.post("/query", async (req, res) => {
  try {
    const { query, params } = req.body;

    if (!query) {
      return res.status(400).json({ error: "SQL query is required" });
    }

    // Execute the query
    // If params are provided, use parameterized query for safety
    const result = params && Array.isArray(params)
      ? await pool.query(query, params)
      : await pool.query(query);

    res.json({
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      command: result.command
    });
  } catch (err) {
    console.error("SQL Query Error:", err);
    res.status(500).json({
      error: err.message,
      code: err.code
    });
  }
});





// Render uses PORT from the environment
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
