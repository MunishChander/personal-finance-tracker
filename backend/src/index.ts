/**
 * Backend API Server Entry Point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import assetsRouter from './routes/assets';
import { logger } from './utils/logger';
import { testConnection } from './utils/db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '30000', 10); // 30 seconds default

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: CORS_ORIGIN })); // CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded body parser

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(REQUEST_TIMEOUT, () => {
    logger.error('Request timeout', { 
      method: req.method, 
      url: req.url,
      timeout: REQUEST_TIMEOUT 
    });
    res.status(408).json({ 
      success: false, 
      error: 'Request timeout: The request took too long to process' 
    });
  });
  next();
});

// Health check endpoint
app.get('/health', async (_req, res) => {
  const dbConnected = await testConnection();
  res.status(dbConnected ? 200 : 503).json({ 
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString() 
  });
});

// API routes
app.use('/api/assets', assetsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { 
    method: req.method, 
    url: req.url,
    body: req.body 
  }, err);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// Start server
app.listen(PORT, async () => {
  logger.info('Server starting', { 
    port: PORT, 
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: CORS_ORIGIN 
  });
  
  // Test database connection on startup
  const dbConnected = await testConnection();
  if (dbConnected) {
    logger.info('Database connection verified');
  } else {
    logger.error('Database connection failed on startup');
  }
});

export default app;
