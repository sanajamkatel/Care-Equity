import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB connection (non-blocking)
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
});

// Routes
import hospitalOutcomesRouter from './routes/hospitalOutcomes';
app.use('/api/hospital-outcomes', hospitalOutcomesRouter);

import scoresRouter from './routes/scores';
app.use('/api/scores', scoresRouter);

import adminRouter from './routes/admin';
app.use('/admin', adminRouter);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Care Equity API is running' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
