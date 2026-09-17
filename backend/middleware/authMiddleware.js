import { verifyToken } from '../utils/tokenHelper.js';
import { User } from '../models/User.js';

export const authenticateUser = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);
      
      // Fetch user from MongoDB
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication failed: User no longer exists.' });
      }

      if (user.isBlocked) {
        return res.status(403).json({ success: false, message: 'Your account has been suspended by system administrator.' });
      }

      // Attach user profile to request
      req.user = user;

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied: No authorization token provided.' });
  }
};
