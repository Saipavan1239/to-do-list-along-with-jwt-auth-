import express from 'express';
import User from '../schema/userSchema.js'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log('Registering user:', username);  // Log the username
  
    try {
      console.log('Registering user:', username);  // Log the username
      const existingUser = await User.findOne({ username });
      console.log('Existing user:', existingUser);
  
      if (existingUser) {
        console.log('User already exists');
        return res.status(400).send('User already exists');
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = new User({ username, password: hashedPassword });
      const savedUser = await newUser.save();
      
      console.log('Saved User:', savedUser);
      res.status(201).send('User registered');
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).send('Failed to register user');
    }
  });
  

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('Invalid username or password');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid username or password');

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.header('Authorization', `Bearer ${token}`).send({ token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send('Failed to login');
  }
});

export default router;
