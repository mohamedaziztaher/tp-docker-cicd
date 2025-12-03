require('dotenv').config();
const express = require("express"); // Framework web
const cors = require("cors"); // Gestion CORS
const { Pool } = require("pg"); // Client PostgreSQL
const app = express();
const PORT = process.env.PORT || 3000; // Port configurable

// Database connection configuration
// Support both DB_URL (connection string) and individual variables
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
      rejectUnauthorized: false // Required for Render PostgreSQL
    };
  }
}

const pool = new Pool(poolConfig);

// Test database connection
pool.connect()
  .then(client => {
    console.log('Database connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
  });


// MIDDLEWARE CORS : Autorise les requêtes cross-origin
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://backend',
      'https://tp-docker-cicd-pearl.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remove undefined values
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow localhost on any port for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Allow Vercel preview deployments (any .vercel.app subdomain)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'], // Méthodes HTTP autorisées
  allowedHeaders: ['Content-Type'], // Headers autorisés
  credentials: true // Allow credentials if needed
}));

// ROUTE API PRINCIPALE
app.get("/api", (req, res) => {
  res.json({
    message: "Hello from Backend!",
    timestamp: new Date().toISOString(),
    client: req.get('Origin') || 'unknown',
    success: true
  });
});

// ROUTE DATABASE : Récupérer les données de la base
app.get("/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json({
      message: "Data from Database",
      data: result.rows,
      timestamp: new Date().toISOString(),
      success: true
    });
  } catch (err) {
    res.status(500).json({
      message: "Database error",
      error: err.message,
      success: false
    });
  }
});

// DÉMARRAGE SERVEUR
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`API principal endpoint: http://localhost:${PORT}/api`);
  console.log(`DB endpoint: http://localhost:${PORT}/db`);
});