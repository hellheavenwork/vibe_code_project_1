import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const commentsRouter = Router();

// Shared helper: verify requester is a member of the task's project
async function verifyTaskAccess(taskId: string, userId: string): Promise<boolean> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { project: { select: { members: { select: { userId: true } } } } },
  });
  if (!task) return false;
  return task.project.members.some((m) => m.userId === userId);
}

// GET /api/tasks/:taskId/comments
commentsRouter.get('/:taskId/comments', requireAuth, async (req: AuthRequest, res: Response) => {
  const hasAccess = await verifyTaskAccess(req.params.taskId, req.userId!);
  if (!hasAccess) { res.status(403).json({ error: 'Forbidden' }); return; }

  const comments = await prisma.comment.findMany({
    where: { taskId: req.params.taskId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(
    comments.map((c) => ({
      id: c.id,
      taskId: c.taskId,
      authorId: c.authorId,
      text: c.text,
      createdAt: c.createdAt.toISOString(),
    }))
  );
});

// POST /api/tasks/:taskId/comments
commentsRouter.post('/:taskId/comments', requireAuth, async (req: AuthRequest, res: Response) => {
  const { text } = req.body;
  if (!text?.trim()) { res.status(400).json({ error: 'text is required' }); return; }
  if (text.trim().length > 2000) { res.status(400).json({ error: 'Comment must be under 2000 characters' }); return; }

  const hasAccess = await verifyTaskAccess(req.params.taskId, req.userId!);
  if (!hasAccess) { res.status(403).json({ error: 'Forbidden' }); return; }

  const comment = await prisma.comment.create({
    data: { text: text.trim(), taskId: req.params.taskId, authorId: req.userId! },
  });
  res.status(201).json({
    id: comment.id,
    taskId: comment.taskId,
    authorId: comment.authorId,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
  });
});

// DELETE /api/tasks/:taskId/comments/:commentId
commentsRouter.delete('/:taskId/comments/:commentId', requireAuth, async (req: AuthRequest, res: Response) => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.commentId } });
  if (!comment) { res.status(404).json({ error: 'Comment not found' }); return; }

  // Only the author (or an admin) can delete a comment
  if (comment.authorId !== req.userId) {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { role: true },
    });
    if (currentUser?.role !== 'admin') {
      res.status(403).json({ error: 'Only the author can delete a comment' });
      return;
    }
  }

  await prisma.comment.delete({ where: { id: comment.id } });
  res.status(204).send();
});
