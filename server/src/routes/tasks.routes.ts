import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const tasksRouter = Router();

// Sanitize tags: strings only, max 50 chars each, max 20 tags, strip dangerous chars
function sanitizeTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is string => typeof t === 'string')
    .map(t => t.trim().slice(0, 50))
    .filter(t => t.length > 0)
    .slice(0, 20);
}

function formatTask(t: any) {
  return {
    id: t.id,
    projectId: t.projectId,
    columnId: t.columnId,
    title: t.title,
    description: t.description,
    assigneeId: t.assigneeId,
    priority: t.priority,
    dueDate: t.dueDate.toISOString(),
    tags: t.tags.map((tag: any) => tag.tag),
    color: t.color,
    commentsCount: t._count.comments,
  };
}

const taskInclude = {
  tags: true,
  _count: { select: { comments: true } },
};

// GET /api/tasks — all tasks across user's projects (for Dashboard stats)
tasksRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const tasks = await prisma.task.findMany({
    where: { project: { members: { some: { userId: req.userId } } } },
    include: taskInclude,
  });
  res.json(tasks.map(formatTask));
});

// POST /api/tasks
tasksRouter.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { title, projectId, columnId, assigneeId, description, priority, dueDate, tags, color } = req.body;
  if (!title?.trim()) { res.status(400).json({ error: 'title is required' }); return; }
  if (!projectId || !columnId || !assigneeId) {
    res.status(400).json({ error: 'projectId, columnId, and assigneeId are required' });
    return;
  }

  // Verify membership
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: req.userId! } },
  });
  if (!membership) { res.status(403).json({ error: 'Forbidden' }); return; }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      projectId,
      columnId,
      assigneeId,
      description: description || '',
      priority: priority || 'Medium',
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      color: color || null,
      tags: tags?.length ? { create: sanitizeTags(tags).map((tag) => ({ tag })) } : undefined,
    },
    include: taskInclude,
  });
  res.status(201).json(formatTask(task));
});

// PATCH /api/tasks/:id
tasksRouter.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  // Use select to only fetch fields needed for membership check — avoids loading full member objects
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      project: { select: { members: { select: { userId: true } } } },
    },
  });
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
  const isMember = task.project.members.some((m) => m.userId === req.userId);
  if (!isMember) { res.status(403).json({ error: 'Forbidden' }); return; }

  const { title, columnId, assigneeId, priority, description, dueDate, tags, color } = req.body;
  const updateData: any = {};
  if (title !== undefined) updateData.title = title.trim();
  if (columnId !== undefined) updateData.columnId = columnId;
  if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
  if (priority !== undefined) updateData.priority = priority;
  if (description !== undefined) updateData.description = description;
  if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
  if (color !== undefined) updateData.color = color;

  if (tags !== undefined) {
    const cleanTags = sanitizeTags(tags);
    // Run tag replacement + task update atomically in a single transaction
    const [, updated] = await prisma.$transaction([
      prisma.taskTag.deleteMany({ where: { taskId: task.id } }),
      prisma.task.update({
        where: { id: task.id },
        data: { ...updateData, tags: { create: cleanTags.map((tag) => ({ tag })) } },
        include: taskInclude,
      }),
    ]);
    res.json(formatTask(updated));
    return;
  }

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: updateData,
    include: taskInclude,
  });
  res.json(formatTask(updated));
});

// DELETE /api/tasks/:id
tasksRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      project: { select: { members: { select: { userId: true } } } },
    },
  });
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
  const isMember = task.project.members.some((m) => m.userId === req.userId);
  if (!isMember) { res.status(403).json({ error: 'Forbidden' }); return; }
  await prisma.task.delete({ where: { id: task.id } });
  res.status(204).send();
});
