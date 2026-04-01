export type Priority = 'Low' | 'Medium' | 'High';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  email?: string;
  username?: string;
  role?: string;       // 'admin' | 'member'
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  members: string[];
}

export interface Column {
  id: string;
  title: string;
  order: number;
}

export interface Task {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: Priority;
  dueDate: string;
  tags: string[];
  color?: string;
  commentsCount: number;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface AppData {
  currentUser: User;
  users: User[];
  projects: Project[];
  columns: Column[];
  tasks: Task[];
  comments: Comment[];
}
