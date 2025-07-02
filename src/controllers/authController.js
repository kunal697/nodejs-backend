const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readUsers, writeUsers } = require('../utilis/fileUtilis');
const { validateEmail, validatePassword } = require('../utilis/validators');

const JWT_SECRET = process.env.JWT_SECRET || 'bookstore-secret-key-2024';

 const register =  async (req, res) => {
    try {
      const { email, password, name } = req.body;
  
      // Validation
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        });
      }
  
      if (!validateEmail(email)) {
        return res.status(400).json({
          error: 'Please provide a valid email address'
        });
      }
  
      if (!validatePassword(password)) {
        return res.status(400).json({
          error: 'Password must be at least 6 characters long'
        });
      }
  
      // Check if user already exists
      const users = await readUsers();
      const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
  
      if (existingUser) {
        return res.status(409).json({
          error: 'User with this email already exists'
        });
      }
  
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Create new user
      const newUser = {
        id: uuidv4(),
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
      // Save user
      users.push(newUser);
      await writeUsers(users);
  
      // Generate token
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt
        },
        token,
        expiresIn: '24h'
      });
  
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal server error during registration'
      });
    }
}

const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validation
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        });
      }
  
      // Find user
      const users = await readUsers();
      const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
  
      if (!user) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }
  
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }
  
      // Generate token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      // Update last login
      user.lastLogin = new Date().toISOString();
      await writeUsers(users);
  
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastLogin: user.lastLogin
        },
        token,
        expiresIn: '24h'
      });
  
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error during login'
      });
    }
  }


const getProfile =  async (req, res) => {
    try {
      const users = await readUsers();
      const user = users.find(u => u.id === req.user.userId);
  
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }
  
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
}

module.exports = {
    register,
    login,
    getProfile
}