import { AppData } from '../types';

export const mockData: AppData = {
  currentUser: {
    id: 'u1',
    name: 'Somsak Dev',
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Somsak',
    email: 'somsak@example.com'
  },
  users: [
    { id: 'u1', name: 'Somsak Dev', avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Somsak' },
    { id: 'u2', name: 'Jane Designer', avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jane' },
    { id: 'u3', name: 'Bob Manager', avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bob' }
  ],
  projects: [
    {
      id: 'p1',
      name: 'Website Redesign',
      color: 'blue',
      members: ['u1', 'u2', 'u3']
    },
    {
      id: 'p2',
      name: 'Mobile App API',
      color: 'purple',
      members: ['u1', 'u3']
    },
    {
      id: 'p3',
      name: 'Marketing Campaign',
      color: 'green',
      members: ['u2']
    }
  ],
  columns: [
    { id: 'col1', title: 'To Do', order: 1 },
    { id: 'col2', title: 'In Progress', order: 2 },
    { id: 'col3', title: 'Review', order: 3 },
    { id: 'col4', title: 'Done', order: 4 }
  ],
  tasks: [
    {
      id: 't101',
      projectId: 'p1',
      columnId: 'col1',
      title: 'Design Homepage Mockups',
      description: 'Create desktop and mobile mockups for the new homepage.',
      assigneeId: 'u2',
      priority: 'High',
      dueDate: '2026-04-10T23:59:59Z',
      tags: ['Design', 'UI'],
      color: 'blue',
      commentsCount: 0
    },
    {
      id: 't102',
      projectId: 'p1',
      columnId: 'col2',
      title: 'Setup React Project',
      description: 'Initialize Vite + React with Tailwind CSS',
      assigneeId: 'u1',
      priority: 'Medium',
      dueDate: '2026-04-05T23:59:59Z',
      tags: ['Frontend'],
      color: 'green',
      commentsCount: 3
    },
    {
      id: 't103',
      projectId: 'p1',
      columnId: 'col2',
      title: 'Implement Auth Flow',
      description: 'Connect to Firebase Auth and handle login/signup.',
      assigneeId: 'u1',
      priority: 'High',
      dueDate: '2026-04-08T23:59:59Z',
      tags: ['Frontend', 'Security'],
      color: 'purple',
      commentsCount: 1
    },
    {
      id: 't104',
      projectId: 'p2',
      columnId: 'col1',
      title: 'Define API Endpoints',
      description: 'Document all REST endpoints for the mobile app.',
      assigneeId: 'u3',
      priority: 'Medium',
      dueDate: '2026-04-12T23:59:59Z',
      tags: ['Backend', 'Docs'],
      color: 'orange',
      commentsCount: 0
    }
  ],
  comments: [
    {
      id: 'c1',
      taskId: 't102',
      authorId: 'u2',
      text: "Don't forget to install React Router too!",
      createdAt: '2026-03-31T09:00:00Z'
    }
  ]
};
