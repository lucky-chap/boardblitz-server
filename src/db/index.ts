import { env } from "@/common/utils/envConfig";
import { Pool } from "pg";

// Create a new PostgreSQL connection pool
export const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  ssl: {
    rejectUnauthorized: true,
  },
});

// Initial SQL queries for table creation
const createTablesQueries = {
  // Users table to store user information
  users: `
    CREATE TABLE IF NOT EXISTS "user" (
      profile_picture VARCHAR(255),
      banner_picture VARCHAR(255),
        id SERIAL PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        email VARCHAR(128) UNIQUE NOT NULL,
        profile_picture VARCHAR(255) DEFAULT NULL,
        banner_picture VARCHAR(255) DEFAULT NULL,
        password TEXT,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        draws INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Games table to store chess game information
  games: `
    CREATE TABLE IF NOT EXISTS "game" (
        id SERIAL PRIMARY KEY,
        winner VARCHAR(5),
        end_reason VARCHAR(16),
        pgn TEXT,
        white_id INT REFERENCES "user",
        white_name VARCHAR(32),
        black_id INT REFERENCES "user",
        black_name VARCHAR(32),
        started_at TIMESTAMP NOT NULL,
        ended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
};

// Function to initialize database tables
export async function initializeTables() {
  try {
    // Execute each table creation query
    for (const [tableName, query] of Object.entries(createTablesQueries)) {
      await pool.query(query);
      console.log(`Created ${tableName} table if it didn't exist`);
    }
    console.log("All database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database tables:", error);
    throw error;
  }
}

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to PostgreSQL database");
    client.release();
    return true;
  } catch (error) {
    console.error("Error connecting to PostgreSQL database:", error);
    throw error;
  }
}
