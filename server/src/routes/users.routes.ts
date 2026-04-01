import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const usersRouter = Router();

function safeUser(u: {
  id: string; username: string; name: string;
  email: string | null; avatarUrl: string; role: string; createdAt: Date;
}) {
  return {
    id: u.id, username: u.username, name: u.name,
    email: u.email, avatarUrl: u.avatarUrl, role: u.role,
    createdAt: u.createdAt.toISOString(),
  };
}

// ── GET all users (authenticated users only) ───────────────────────────────
usersRouter.get('/', requireAuth, async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(users.map(safeUser));
});

// ── GET me ─────────────────────────────────────────────────────────────────
usersRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(safeUser(user));
});

// ── PATCH me (self-update — name, email, avatarUrl only) ───────────────────
usersRouter.patch('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, email, avatarUrl } = req.body;
  if (email) {
    const existing = await prisma.user.findFirst({ where: { email, NOT: { id: req.userId } } });
    if (existing) { res.status(400).json({ error: 'Email already in use' }); return; }
  }
  const updated = await prisma.user.update({
    where: { id: req.userId! },
    data: {
      ...(name && { name }),
      ...(email !== undefined && { email: email || null }),
      ...(avatarUrl && { avatarUrl }),
    },
  });
  res.json(safeUser(updated));
});

// ── PATCH any user (admin only) ────────────────────────────────────────────
usersRouter.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Only admins can modify other users
  const currentUser = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { role: true },
  });
  if (currentUser?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  const { name, email, role, password } = req.body;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  if (email && email !== user.email) {
    const taken = await prisma.user.findFirst({ where: { email, NOT: { id } } });
    if (taken) { res.status(400).json({ error: 'Email already in use' }); return; }
  }

  if (role && !['admin', 'member'].includes(role)) {
    res.status(400).json({ error: 'role must be admin or member' }); return;
  }

  const updateData: Record<string, unknown> = {};
  if (name)                updateData.name     = name.trim();
  if (email !== undefined) updateData.email    = email?.trim() || null;
  if (role)                updateData.role     = role;
  if (password) {
    if (password.length < 8) { res.status(400).json({ error: 'Password must be at least 8 characters' }); return; }
    updateData.password = await bcrypt.hash(password, 12);
  }

  const updated = await prisma.user.update({ where: { id }, data: updateData });
  res.json(safeUser(updated));
});

// ── DELETE user (admin only) ───────────────────────────────────────────────
usersRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Only admins can delete users
  const currentUser = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { role: true },
  });
  if (currentUser?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  if (id === req.userId) {
    res.status(400).json({ error: 'You cannot delete your own account' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  await prisma.user.delete({ where: { id } });
  res.status(204).send();
});
