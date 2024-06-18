import express from 'express';
import mongoose from 'mongoose';
import connectDB from './database/connect.js';
import cors from 'cors';

import dotenv from 'dotenv';
import taskRouter from './routes/task.js';
import authRouter from './routes/auth.js'; // New router for authentication
import { authenticateToken } from './middleware/authMiddleware.js'; // JWT middleware

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB(process.env.MONGO_URL);

// Mount routers
app.use('/auth', authRouter); // Authentication routes
app.use('/tasks', authenticateToken, taskRouter); // Protect task routes with JWT

// Default route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
