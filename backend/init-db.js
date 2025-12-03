require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
let poolConfig;

if (process.env.DB_URL) {
  // Use connection string if provided (e.g., from Render)
  poolConfig = {
    connectionString: process.env.DB_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render PostgreSQL
    }
  };
} else {
  // Use individual environment variables
  const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('render.com');
  poolConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "secret",
    database: process.env.DB_NAME || "mydb",
  };

  // Add SSL configuration for Render PostgreSQL
  if (isProduction || process.env.DB_SSL === 'true') {
    poolConfig.ssl = {
      rejectUnauthorized: false
    };
  }
}

const pool = new Pool(poolConfig);

// SQL initialization script
const initSQL = `
CREATE TABLE IF NOT EXISTS users (
 id SERIAL PRIMARY KEY ,
 name VARCHAR (100) NOT NULL ,
 email VARCHAR (100) UNIQUE NOT NULL
) ;

-- Only insert if table is empty
INSERT INTO users ( name , email ) 
SELECT 'Alice', 'alice@example.com'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'alice@example.com');

INSERT INTO users ( name , email ) 
SELECT 'Bob', 'bob@example.com'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bob@example.com');
`;

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Connecting to database...');
    
    // Execute the initialization script
    await client.query(initSQL);
    
    console.log('✅ Database initialized successfully!');
    console.log('✅ Created users table');
    console.log('✅ Inserted sample data (Alice and Bob)');
    
    // Verify the data
    const result = await client.query('SELECT * FROM users');
    console.log('\n📊 Current users in database:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase();

