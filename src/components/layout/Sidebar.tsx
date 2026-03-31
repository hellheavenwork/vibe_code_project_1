import * as React from 'react';
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  CheckSquare,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { mockData } from '../../data/mockData';
import { motion, AnimatePresence } from 'motion/react';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [newProjectName, setNewProjectName] = useState('');
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleUpdate = () => forceUpdate({});
    const handleThemeUpdate = (e: any) => setIsDarkMode(e.detail.isDarkMode);
    
    window.addEventListener('projects-updated', handleUpdate);
    window.addEventListener('theme-updated', handleThemeUpdate as any);
    
    return () => {
      window.removeEventListener('projects-updated', handleUpdate);
      window.removeEventListener('theme-updated', handleThemeUpdate as any);
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    window.dispatchEvent(new CustomEvent('theme-updated', { detail: { isDarkMode: newMode } }));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const colors = ['blue', 'purple', 'green', 'orange', 'pink', 'yellow'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newProject = {
      id: (mockData.projects.length + 1).toString(),
      name: newProjectName.trim(),
      color: randomColor,
      members: [mockData.currentUser.id]
    };

    mockData.projects.push(newProject);
    setNewProjectName('');
    setIsModalOpen(false);
    window.dispatchEvent(new CustomEvent('projects-updated'));
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'My Tasks', icon: CheckSquare, path: '/tasks' },
  ];

  return (
    <>
      <aside
        className={cn(
          'relative flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:bg-zinc-950 dark:border-zinc-800',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            {!isCollapsed && <span className="text-xl font-bold text-gray-900 dark:text-zinc-100">TaskFlow</span>}
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}

          <div className="pt-6 pb-2">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  Projects
                </span>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-gray-400 hover:text-blue-600 dark:text-zinc-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <div className="space-y-1">
              {mockData.projects.map((project) => (
                <NavLink
                  key={project.id}
                  to={`/project/${project.id}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                    )
                  }
                >
                  <div className={cn('h-2 w-2 rounded-full', `bg-${project.color}-500`)} />
                  {!isCollapsed && <span className="truncate">{project.name}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-gray-200 p-4 space-y-2 dark:border-zinc-800">
          <button
            onClick={toggleDarkMode}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            {isDarkMode ? (
              <>
                <Sun className="h-5 w-5 shrink-0 text-yellow-500" />
                {!isCollapsed && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 shrink-0 text-blue-600" />
                {!isCollapsed && <span>Dark Mode</span>}
              </>
            )}
          </button>
          
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
              )
            }
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm hover:text-gray-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Project</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddProject} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300">
                    Project Name
                  </label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Enter project name..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:bg-zinc-900"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
