import * as React from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckSquare,
  Sun,
  Moon,
  Pencil,
  Trash2,
  Users,
  Globe,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';
import { createProject, updateProject, deleteProject } from '../../api/projects';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const Sidebar = () => {
  const { projects, refreshProjects } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [newProjectName, setNewProjectName] = useState('');
  const [projectNameError, setProjectNameError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit project state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{ id: string; name: string } | null>(null);
  const [editNameError, setEditNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete project state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    window.dispatchEvent(new CustomEvent('theme-updated', { detail: { isDarkMode: newMode } }));
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) { setProjectNameError('Project name is required'); return; }
    setIsCreating(true);
    try {
      await createProject({ name: newProjectName.trim() });
      await refreshProjects();
      setNewProjectName('');
      setProjectNameError('');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.name.trim()) { setEditNameError('Project name is required'); return; }
    setIsSaving(true);
    try {
      await updateProject(editingProject.id, { name: editingProject.name.trim() });
      await refreshProjects();
      setIsEditModalOpen(false);
      setEditingProject(null);
      setEditNameError('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProjectId) return;
    setIsDeleting(true);
    try {
      await deleteProject(deletingProjectId);
      await refreshProjects();
      setIsDeleteModalOpen(false);
      setDeletingProjectId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const navItems = [
    { name: 'Dashboard',    icon: LayoutDashboard, path: '/app' },
    { name: 'My Tasks',     icon: CheckSquare,     path: '/app/tasks' },
    { name: 'Users',        icon: Users,           path: '/app/users' },
    { name: 'Landing Page', icon: Globe,           path: '/' },
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
              {projects.map((project) => (
                <div key={project.id} className="group relative flex items-center">
                  <NavLink
                    to={`/app/project/${project.id}`}
                    className={({ isActive }) =>
                      cn(
                        'flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                      )
                    }
                  >
                    <div className={cn('h-2 w-2 shrink-0 rounded-full', `bg-${project.color}-500`)} />
                    {!isCollapsed && <span className="truncate">{project.name}</span>}
                  </NavLink>

                  {!isCollapsed && (
                    <div className="absolute right-1 hidden items-center gap-0.5 group-hover:flex">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingProject({ id: project.id, name: project.name });
                          setIsEditModalOpen(true);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors dark:hover:bg-zinc-800 dark:hover:text-blue-400 cursor-pointer"
                        title="Rename project"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setDeletingProjectId(project.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors dark:hover:bg-red-900/20 dark:hover:text-red-400 cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
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
            to="/app/settings"
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

      {createPortal(
        <>
          {/* Create Project Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setNewProjectName(''); setProjectNameError(''); }}
            title="Create New Project"
          >
            <form onSubmit={handleAddProject} className="space-y-6">
              <Input
                label="Project Name"
                placeholder="e.g. Website Redesign"
                value={newProjectName}
                onChange={(e) => { setNewProjectName(e.target.value); if (e.target.value) setProjectNameError(''); }}
                error={projectNameError}
                autoFocus
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => { setIsModalOpen(false); setNewProjectName(''); setProjectNameError(''); }}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isCreating}>Create Project</Button>
              </div>
            </form>
          </Modal>

          {/* Edit Project Modal */}
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => { setIsEditModalOpen(false); setEditingProject(null); setEditNameError(''); }}
            title="Rename Project"
          >
            <form onSubmit={handleEditProject} className="space-y-6">
              <Input
                label="Project Name"
                value={editingProject?.name ?? ''}
                onChange={(e) => {
                  setEditingProject(prev => prev ? { ...prev, name: e.target.value } : prev);
                  if (e.target.value) setEditNameError('');
                }}
                error={editNameError}
                autoFocus
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => { setIsEditModalOpen(false); setEditingProject(null); setEditNameError(''); }}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>Save Changes</Button>
              </div>
            </form>
          </Modal>

          {/* Delete Project Modal */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => { setIsDeleteModalOpen(false); setDeletingProjectId(null); }}
            title="Delete Project"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Are you sure you want to delete this project? All tasks inside will be permanently removed.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { setIsDeleteModalOpen(false); setDeletingProjectId(null); }}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteProject} isLoading={isDeleting}>
                  Delete Project
                </Button>
              </div>
            </div>
          </Modal>
        </>,
        document.body
      )}
    </>
  );
};
