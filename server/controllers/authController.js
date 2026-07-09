import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { createToken, serializeUser } from '../utils/tokens.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Name, email and a password of at least 6 characters are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account already exists with this email.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'user',
    });

    res.status(201).json({
      token: createToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      token: createToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  res.json({ user: serializeUser(req.user) });
}
