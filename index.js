import express from "express";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(express.json());

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // change to { rejectUnauthorized: false } if needed
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



// Render uses PORT from the environment
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
