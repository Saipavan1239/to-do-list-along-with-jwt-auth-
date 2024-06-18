import jwt from 'jsonwebtoken';
import User from '../schema/userSchema.js';

export const verifyToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send('Access Denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    if (!req.user) {
      return res.status(401).send('Access Denied. User not found.');
    }
    next();
  } catch (error) {
    console.error('Invalid token:', error.message);
    res.status(400).send('Invalid token');
  }
};

export const authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send('Access Denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    if (!req.user) {
      return res.status(401).send('Access Denied. User not found.');
    }
    next();
  } catch (error) {
    console.error('Invalid token:', error.message);
    res.status(400).send('Invalid token');
  }
};
