const jwt = require('jsonwebtoken');

const APP_SECRET = process.env.JWT_SECRET || 'appsecret321';

const getToken = (userId) => {
  return jwt.sign({ userId }, APP_SECRET, { expiresIn: '7d' });
};

const getUserId = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token found');
    }
    const { userId } = jwt.verify(token, APP_SECRET);
    return userId;
  }
  return null; // Or throw error if auth is required for everything
};

module.exports = {
  APP_SECRET,
  getToken,
  getUserId,
};
