const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      
      token = req.headers.authorization.split(' ')[1];

      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true 
        }
      });

      if (!req.user) {
        return res.status(401).json({ error: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Auth Error:', error);
      return res.status(401).json({ error: 'Not authorized, token invalid' });
    }
  } else {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};
