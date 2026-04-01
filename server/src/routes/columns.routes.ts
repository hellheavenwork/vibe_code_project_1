import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const columnsRouter = Router();

columnsRouter.get('/', requireAuth, async (_req: AuthRequest, res: Response) => {
  const columns = await prisma.column.findMany({ orderBy: { order: 'asc' } });
  res.json(columns);
});
