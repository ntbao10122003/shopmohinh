import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import apiRoutes from './routes/index.js';
import AppError from './utils/appError.js';
import { protectOptional } from './middleware/authMiddleware.js';
import { ensureCartToken } from './middleware/cartToken.js';

// Configure environment variables
dotenv.config();

// Create __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

 app.use(protectOptional);
  app.use(ensureCartToken);

// Enable CORS
app.use(cors({ origin: '*' }));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serving static files
app.use('/public', express.static(path.join(__dirname, '../../public')));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running', version: 'v1' });});

// API routes
app.use('/api', apiRoutes);

// Handle 404 - Route not found
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Server setup
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Start server
let server;
connectDB(MONGO_URI)
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📁 Public directory: ${path.join(__dirname, '../../public')}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
