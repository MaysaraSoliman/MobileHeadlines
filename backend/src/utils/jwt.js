const jwt = require('jsonwebtoken');

const APP_SECRET = process.env.JWT_SECRET || 'appsecret321';

const getToken = (userId) => {
  return jwt.sign({ userId }, APP_SECRET, { expiresIn: '7d' });
};

const getUserIdFromToken = (token) => {
  if (token) {
    const cleanToken = token.replace('Bearer ', '');
    try {
      const { userId } = jwt.verify(cleanToken, APP_SECRET);
      return userId;
    } catch (e) {
      console.warn('Invalid token in subscription connection:', e.message);
      return null;
    }
  }
  return null;
};

const getUserId = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return getUserIdFromToken(authHeader);
  }
  return null;
};

module.exports = {
  APP_SECRET,
  getToken,
  getUserId,
  getUserIdFromToken,
};
