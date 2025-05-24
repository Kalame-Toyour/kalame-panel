/* eslint-disable no-console */
/* eslint-disable import/no-mutable-exports */
import mysql from 'mysql2/promise';
import { Env } from './Env';

let pool: mysql.Pool | null = null;

const POOL_CONFIG = {
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  maxIdle: 10,
  idleTimeout: 60000,
};

async function createPool() {
  if (!pool) {
    try {
      pool = await mysql.createPool({
        uri: Env.DATABASE_URL,
        ...POOL_CONFIG,
      });
    } catch (error) {
      console.error('Failed to create connection pool:', error);
      throw error;
    }
    process.on('uncaughtException', (err) => {
      console.error('Unexpected error:', err);
      closePool().finally(() => process.exit(1));
    });
  }
  return pool;
}

async function closePool() {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      console.log('Connection pool closed successfully');
    } catch (error) {
      console.error('Error closing connection pool:', error);
      throw error;
    }
  }
}

async function getPoolStatus() {
  if (pool) {
    try {
      const [rows] = await pool.query('SHOW STATUS WHERE Variable_name = "Threads_connected"');
      return rows;
    } catch (error) {
      console.error('Error getting pool status:', error);
      return null;
    }
  }
  return null;
}

async function checkPoolHealth() {
  if (pool) {
    try {
      await pool.query('SELECT 1');
    } catch (error) {
      console.error('Pool health check failed, resetting pool:', error);
      await closePool();
      await createPool();
    }
  }
}

export { createPool, closePool, getPoolStatus, checkPoolHealth };

export const getPool = async () => {
  if (!pool) {
    await createPool();
  }
  return pool!;
};

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});
