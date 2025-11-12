const { Pool } = require('pg');
const Logger = require('../utils/logger');

/**
 * PostgreSQL Database Configuration and Connection Pool
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'connect4_game',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Test database connection
pool.on('connect', () => {
  Logger.success('Database connected successfully');
});

pool.on('error', (err) => {
  Logger.error('Unexpected database error', err);
});

/**
 * Execute a query
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    // Logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    Logger.error('Query execution failed', { text, error: error.message });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);

  // Set a timeout for client checkout
  const timeout = setTimeout(() => {
    Logger.error('Client has been checked out for more than 5 seconds!');
  }, 5000);

  // Monkey patch the query method to log queries
  client.query = (...args) => {
    // Logger.debug('Client query', { query: args[0] });
    return originalQuery(...args);
  };

  // Monkey patch release to clear timeout
  client.release = () => {
    clearTimeout(timeout);
    // Logger.debug('Client released back to pool');
    return originalRelease();
  };

  return client;
};

/**
 * Initialize database tables
 */
const initDatabase = async () => {
  try {
    Logger.info('Initializing database tables...');

    // Create players table
    await query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        total_games INTEGER DEFAULT 0,
        total_wins INTEGER DEFAULT 0,
        total_losses INTEGER DEFAULT 0,
        total_draws INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create games table
    await query(`
      CREATE TABLE IF NOT EXISTS games (
        id UUID PRIMARY KEY,
        player1_id INTEGER REFERENCES players(id),
        player2_id INTEGER REFERENCES players(id),
        winner_id INTEGER REFERENCES players(id),
        status VARCHAR(20) NOT NULL,
        result VARCHAR(20),
        board_state JSONB,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create game_moves table
    await query(`
      CREATE TABLE IF NOT EXISTS game_moves (
        id SERIAL PRIMARY KEY,
        game_id UUID REFERENCES games(id) ON DELETE CASCADE,
        player_id INTEGER REFERENCES players(id),
        column_index INTEGER NOT NULL,
        row_index INTEGER NOT NULL,
        move_number INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
      CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
      CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1_id);
      CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2_id);
      CREATE INDEX IF NOT EXISTS idx_game_moves_game_id ON game_moves(game_id);
    `);

    Logger.success('Database tables initialized successfully');
  } catch (error) {
    Logger.error('Failed to initialize database', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  initDatabase,
};
