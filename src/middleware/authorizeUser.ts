import express from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, User } from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const authorizeUser = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};