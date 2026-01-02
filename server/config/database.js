const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Support Railway MYSQL_URL or individual variables
const createPoolConfig = () => {
  // If MYSQL_URL is provided (Railway), use it
  if (process.env.MYSQL_URL) {
    return process.env.MYSQL_URL;
  }
  
  // Otherwise, use individual variables (Docker/Local)
  return {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'dairy_management',
    port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  };
};

const pool = mysql.createPool(createPoolConfig());

// Test database connection with retry logic (useful for Railway)
const connectWithRetry = async (retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('✓ Database connection successful');
      return true;
    } catch (err) {
      console.log(`Database connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Failed to connect to database after ' + retries + ' attempts');
};

// Initialize database schema
const initialize = async () => {
  try {
    // First, ensure we can connect with retry logic
    await connectWithRetry();

    // Create database if it doesn't exist (skip for Railway as DB is pre-created)
    if (!process.env.MYSQL_URL && !process.env.RAILWAY_ENVIRONMENT) {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
      });

      await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'dairy_management'}`);
      await connection.end();
    }

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cows (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tag_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100),
        breed VARCHAR(50),
        date_of_birth DATE,
        gender ENUM('male', 'female') NOT NULL,
        weight DECIMAL(10, 2),
        status ENUM('active', 'sick', 'pregnant', 'sold', 'deceased') DEFAULT 'active',
        purchase_date DATE,
        purchase_price DECIMAL(10, 2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS milk_production (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cow_id INT NOT NULL,
        date DATE NOT NULL,
        morning_liters DECIMAL(10, 2) DEFAULT 0,
        afternoon_liters DECIMAL(10, 2) DEFAULT 0,
        evening_liters DECIMAL(10, 2) DEFAULT 0,
        total_liters DECIMAL(10, 2) GENERATED ALWAYS AS (morning_liters + afternoon_liters + evening_liters) STORED,
        quality_score DECIMAL(3, 2),
        notes TEXT,
        recorded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_date (date),
        INDEX idx_cow_id (cow_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS health_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cow_id INT NOT NULL,
        date DATE NOT NULL,
        health_status ENUM('healthy', 'sick', 'recovering', 'critical') DEFAULT 'healthy',
        diagnosis TEXT,
        treatment TEXT,
        veterinarian VARCHAR(100),
        cost DECIMAL(10, 2),
        next_checkup_date DATE,
        notes TEXT,
        recorded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_date (date),
        INDEX idx_cow_id (cow_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS feed_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cow_id INT,
        feed_type VARCHAR(100) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(20) DEFAULT 'kg',
        date DATE NOT NULL,
        cost DECIMAL(10, 2),
        supplier VARCHAR(100),
        notes TEXT,
        recorded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE SET NULL,
        FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_date (date)
      )
    `);

    // Create default admin user if not exists
    const bcrypt = require('bcryptjs');
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@dairy.com', hashedPassword, 'admin']
      );
      console.log('Default admin user created: username=admin, password=admin123');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initialize
};

