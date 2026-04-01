import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const [hash1, hash2, hash3] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('jane123', 10),
    bcrypt.hash('bob123', 10),
  ]);

  // Users
  await prisma.user.upsert({
    where: { id: 'u1' },
    update: {},
    create: {
      id: 'u1', username: 'admin', password: hash1,
      name: 'Somsak Dev', email: 'somsak@example.com',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Somsak', role: 'admin',
    },
  });
  await prisma.user.upsert({
    where: { id: 'u2' },
    update: {},
    create: {
      id: 'u2', username: 'jane', password: hash2,
      name: 'Jane Designer', email: 'jane@example.com',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jane', role: 'admin',
    },
  });
  await prisma.user.upsert({
    where: { id: 'u3' },
    update: {},
    create: {
      id: 'u3', username: 'bob', password: hash3,
      name: 'Bob Manager', email: 'bob@example.com',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bob', role: 'admin',
    },
  });

  // Columns
  for (const col of [
    { id: 'col1', title: 'To Do',       order: 1 },
    { id: 'col2', title: 'In Progress', order: 2 },
    { id: 'col3', title: 'Review',      order: 3 },
    { id: 'col4', title: 'Done',        order: 4 },
  ]) {
    await prisma.column.upsert({ where: { id: col.id }, update: {}, create: col });
  }

  // Projects
  await prisma.project.upsert({
    where: { id: 'p1' }, update: {},
    create: {
      id: 'p1', name: 'Website Redesign', color: 'blue', ownerId: 'u1',
      members: { create: [{ userId: 'u1' }, { userId: 'u2' }, { userId: 'u3' }] },
    },
  });
  await prisma.project.upsert({
    where: { id: 'p2' }, update: {},
    create: {
      id: 'p2', name: 'Mobile App API', color: 'purple', ownerId: 'u1',
      members: { create: [{ userId: 'u1' }, { userId: 'u3' }] },
    },
  });
  await prisma.project.upsert({
    where: { id: 'p3' }, update: {},
    create: {
      id: 'p3', name: 'Marketing Campaign', color: 'green', ownerId: 'u2',
      members: { create: [{ userId: 'u2' }] },
    },
  });

  // Tasks
  const tasks = [
    {
      id: 't101', projectId: 'p1', columnId: 'col1', assigneeId: 'u2',
      title: 'Design Homepage Mockups',
      description: 'Create desktop and mobile mockups for the new homepage.',
      priority: 'High', dueDate: new Date('2026-04-10T23:59:59Z'), color: 'blue',
      tags: ['Design', 'UI'],
    },
    {
      id: 't102', projectId: 'p1', columnId: 'col2', assigneeId: 'u1',
      title: 'Setup React Project',
      description: 'Initialize Vite + React with Tailwind CSS',
      priority: 'Medium', dueDate: new Date('2026-04-05T23:59:59Z'), color: 'green',
      tags: ['Frontend'],
    },
    {
      id: 't103', projectId: 'p1', columnId: 'col2', assigneeId: 'u1',
      title: 'Implement Auth Flow',
      description: 'Connect to Firebase Auth and handle login/signup.',
      priority: 'High', dueDate: new Date('2026-04-08T23:59:59Z'), color: 'purple',
      tags: ['Frontend', 'Security'],
    },
    {
      id: 't104', projectId: 'p2', columnId: 'col1', assigneeId: 'u3',
      title: 'Define API Endpoints',
      description: 'Document all REST endpoints for the mobile app.',
      priority: 'Medium', dueDate: new Date('2026-04-12T23:59:59Z'), color: 'orange',
      tags: ['Backend', 'Docs'],
    },
  ];

  for (const t of tasks) {
    const { tags, ...data } = t;
    await prisma.task.upsert({
      where: { id: t.id }, update: {},
      create: {
        ...data,
        tags: { create: tags.map((tag) => ({ tag })) },
      },
    });
  }

  // Comment
  await prisma.comment.upsert({
    where: { id: 'c1' }, update: {},
    create: {
      id: 'c1', taskId: 't102', authorId: 'u2',
      text: "Don't forget to install React Router too!",
      createdAt: new Date('2026-03-31T09:00:00Z'),
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
