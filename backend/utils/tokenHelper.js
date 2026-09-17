import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_jwt_production_key_multivendor_ecommerce_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_production_key_multivendor_ecommerce_2026');
};
