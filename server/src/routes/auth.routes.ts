import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { prisma } from '../prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

const MIN_PASSWORD_LENGTH = 8;

// ── Cookie helper ───────────────────────────────────────────────────────────
const COOKIE_OPTIONS = {
  httpOnly: true,                                   // not accessible via JS — prevents XSS token theft
  secure: process.env.NODE_ENV === 'production',    // HTTPS-only in production
  sameSite: 'lax' as const,                        // CSRF protection
  maxAge: 24 * 60 * 60 * 1000,                     // 24 hours in ms
  path: '/',
};

function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  } as jwt.SignOptions);
}

function publicUser(u: { id: string; name: string; email: string | null; avatarUrl: string; role: string }) {
  return { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl, role: u.role };
}

// ── Rate limiters ───────────────────────────────────────────────────────────
// Login: max 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true, // only count failed attempts
});

// Register: max 5 registrations per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many registration attempts. Please try again later.' },
});

// ── Login ──────────────────────────────────────────────────────────────────
authRouter.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }
  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { username: username.trim() } });

  // Always run bcrypt even when user not found — prevents timing-based username enumeration
  const dummyHash = '$2b$10$invalidhashfortimingprotectiononly000000000000000000000';
  const isValid = await bcrypt.compare(password, user?.password ?? dummyHash);

  if (!user || !isValid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken(user.id);
  res.cookie('authToken', token, COOKIE_OPTIONS);
  res.json({ token, user: publicUser(user) }); // token also in body for backwards compat
});

// ── Register ───────────────────────────────────────────────────────────────
authRouter.post('/register', registerLimiter, async (req: Request, res: Response) => {
  const { username, password, name, email } = req.body;

  if (!username?.trim() || !password || !name?.trim()) {
    res.status(400).json({ error: 'username, password and name are required' });
    return;
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    return;
  }
  // Basic username format validation
  if (!/^[a-z0-9_]{3,30}$/.test(username.trim())) {
    res.status(400).json({ error: 'Username must be 3–30 characters: lowercase letters, numbers, underscores only' });
    return;
  }

  const takenUsername = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (takenUsername) {
    res.status(400).json({ error: 'Username is already taken' });
    return;
  }

  if (email?.trim()) {
    const takenEmail = await prisma.user.findFirst({ where: { email: email.trim() } });
    if (takenEmail) {
      res.status(400).json({ error: 'Email is already in use' });
      return;
    }
  }

  const hashed    = await bcrypt.hash(password, 12); // rounds: 12 is OWASP recommended
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}`;

  const user = await prisma.user.create({
    data: {
      username: username.trim(),
      password: hashed,
      name: name.trim(),
      email: email?.trim() || null,
      avatarUrl,
      role: 'member', // default to least-privilege role; promote to admin manually
    },
  });

  const token = signToken(user.id);
  res.cookie('authToken', token, COOKIE_OPTIONS);
  res.status(201).json({ token, user: publicUser(user) });
});

// ── Me ─────────────────────────────────────────────────────────────────────
authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(publicUser(user));
});

// ── Logout ─────────────────────────────────────────────────────────────────
authRouter.post('/logout', requireAuth, (_req: AuthRequest, res: Response) => {
  res.clearCookie('authToken', { path: '/' });
  res.json({ message: 'Logged out' });
});
