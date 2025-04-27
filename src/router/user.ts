import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { AuthenticatedRequest, createUser, findUserByEmail, getPublicUsers, updateUserProfilePicture, updateUserVisibility } from '../models/user';
import { authorizeUser } from '../middleware/authorizeUser';
import multer from 'multer';
import { uploadImageToBucket } from '../utils/s3';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: 'Username, email, and password are required' });
    return;
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({
      username,
      email,
      profilePicture: null,
      isPublic: true,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, username: newUser.username, email: newUser.email } });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isPublic: user.isPublic
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/me', authorizeUser, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/profile-picture', authorizeUser, upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No image uploaded' });
    return;
  }

  try {
    const url = await uploadImageToBucket(req.file, 'profile-picks');

    const userId = (req as AuthenticatedRequest).user.id;
    await updateUserProfilePicture(userId, url);
    res.json({ message: 'Profile picture updated successfully', profilePicture: url });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/toggle-visibility', authorizeUser, async (req, res) => {
  const { isPublic } = req.body;

  if (typeof isPublic !== 'boolean') {
    res.status(400).json({ message: 'isPublic must be a boolean' });
    return;
  }

  try {
    const userId = (req as AuthenticatedRequest).user.id;
    await updateUserVisibility(userId, isPublic);
    res.json({ message: `User visibility updated to ${isPublic ? 'public' : 'private'}` });
  } catch (err) {
    console.error('Error updating user visibility:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/public-users', authorizeUser, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string | undefined;

  if (page < 1 || limit < 1) {
    res.status(400).json({ message: 'Page and limit must be positive integers' });
    return;
  }

  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const users = await getPublicUsers(page, limit, search, userId);
    res.json({ page, limit, users });
  } catch (err) {
    console.error('Error fetching public users:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
export default router;