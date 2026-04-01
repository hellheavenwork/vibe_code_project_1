import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Project, Column } from '../types';
import * as usersApi from '../api/users';
import * as projectsApi from '../api/projects';
import * as columnsApi from '../api/columns';

interface AppContextValue {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  columns: Column[];
  isLoading: boolean;
  refreshProjects: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  setCurrentUser: (u: User) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers]             = useState<User[]>([]);
  const [projects, setProjects]       = useState<Project[]>([]);
  const [columns, setColumns]         = useState<Column[]>([]);
  const [isLoading, setIsLoading]     = useState(true);

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    if (!isAuthenticated) { setIsLoading(false); return; }

    Promise.all([
      usersApi.getMe(),
      usersApi.getUsers(),
      projectsApi.getProjects(),
      columnsApi.getColumns(),
    ]).then(([me, allUsers, allProjects, allColumns]) => {
      setCurrentUser(me);
      setUsers(allUsers);
      setProjects(allProjects);
      setColumns(allColumns);
    }).catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const refreshProjects = async () => {
    const updated = await projectsApi.getProjects();
    setProjects(updated);
  };

  const refreshUsers = async () => {
    const updated = await usersApi.getUsers();
    setUsers(updated);
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, projects, columns, isLoading,
      refreshProjects, refreshUsers, setCurrentUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
