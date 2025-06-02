import express, {Request, Response, NextFunction} from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/helloworld?authSource=admin';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB successfully');
  } catch (error: any) {
    logger.error('MongoDB connection failed', { error: error.message });
    process.exit(1);
  }
};

// Simple User schema for demonstration
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
  logger.info('Hello World endpoint accessed');
  res.json({ 
    message: 'Hello World!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      logger.warn('Invalid user creation attempt', { body: req.body });
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const user = new User({ name, email });
    await user.save();
    
    logger.info('New user created', { userId: user._id, name, email });
    res.status(201).json(user);
  } catch (error: any) {
    logger.error('Error creating user', { error: error.message, body: req.body });
    
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    logger.info('Users retrieved', { count: users.length });
    res.json(users);
  } catch (error: any) {
    logger.error('Error retrieving users', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { 
    error: error.message, 
    stack: error.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 - Route not found', { url: req.url, method: req.method });
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    logger.info('Server started successfully', { 
      port: PORT, 
      environment: process.env.NODE_ENV || 'development'
    });
  });
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

startServer().catch(error => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});
