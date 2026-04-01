import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const projectsRouter = Router();

const COLORS = ['blue', 'purple', 'green', 'orange', 'pink', 'yellow'];

function formatProject(p: any) {
  return {
    id: p.id,
    name: p.name,
    color: p.color,
    members: p.members.map((m: any) => m.userId),
  };
}

// GET /api/projects — all projects where current user is a member
projectsRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: req.userId } } },
    include: { members: true },
  });
  res.json(projects.map(formatProject));
});

// POST /api/projects — create project
projectsRouter.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, color } = req.body;
  if (!name?.trim()) { res.status(400).json({ error: 'name is required' }); return; }
  const projectColor = color || COLORS[Math.floor(Math.random() * COLORS.length)];
  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      color: projectColor,
      ownerId: req.userId!,
      members: { create: [{ userId: req.userId! }] },
    },
    include: { members: true },
  });
  res.status(201).json(formatProject(project));
});

// GET /api/projects/:id
projectsRouter.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { members: true },
  });
  if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
  const isMember = project.members.some((m) => m.userId === req.userId);
  if (!isMember) { res.status(403).json({ error: 'Forbidden' }); return; }
  res.json(formatProject(project));
});

// GET /api/projects/:id/tasks
projectsRouter.get('/:id/tasks', requireAuth, async (req: AuthRequest, res: Response) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { members: true },
  });
  if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
  const isMember = project.members.some((m) => m.userId === req.userId);
  if (!isMember) { res.status(403).json({ error: 'Forbidden' }); return; }

  const tasks = await prisma.task.findMany({
    where: { projectId: req.params.id },
    include: { tags: true, _count: { select: { comments: true } } },
  });
  res.json(tasks.map(formatTask));
});

// PATCH /api/projects/:id
projectsRouter.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { members: true },
  });
  if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
  const isMember = project.members.some((m) => m.userId === req.userId);
  if (!isMember) { res.status(403).json({ error: 'Forbidden' }); return; }

  const { name, color, members } = req.body;
  const updateData: any = {};
  if (name) updateData.name = name.trim();
  if (color) updateData.color = color;

  if (members !== undefined) {
    // Replace membership list atomically, always keep the current user
    const newMembers = Array.from(new Set([...(members as string[]), req.userId!]));
    await prisma.$transaction([
      prisma.projectMember.deleteMany({ where: { projectId: project.id } }),
      prisma.projectMember.createMany({
        data: newMembers.map((userId) => ({ projectId: project.id, userId })),
      }),
    ]);
  }

  const updated = await prisma.project.update({
    where: { id: project.id },
    data: updateData,
    include: { members: true },
  });
  res.json(formatProject(updated));
});

// DELETE /api/projects/:id
projectsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
  if (project.ownerId !== req.userId) { res.status(403).json({ error: 'Only the owner can delete a project' }); return; }
  await prisma.project.delete({ where: { id: project.id } });
  res.status(204).send();
});

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
