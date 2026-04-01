import * as React from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { LayoutGrid, List, Plus, Users, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { ListView } from '../components/list/ListView';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { TaskDetailPanel } from '../components/task/TaskDetailPanel';
import { Task, Project } from '../types';
import { useApp } from '../context/AppContext';
import { getTasksByProject, createTask, deleteTask } from '../api/tasks';
import { getProject, updateProject } from '../api/projects';

export default function ProjectBoard() {
  const { id } = useParams();
  const { currentUser, users, columns, projects, refreshProjects } = useApp();

  const [view, setView]               = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tasks, setTasks]             = useState<Task[]>([]);
  const [project, setProject]         = useState<Project | null>(null);

  // Add Task
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle]     = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>(currentUser?.id ?? '');
  const [selectedColor, setSelectedColor]   = useState('blue');
  const [addError, setAddError]             = useState('');
  const [isAdding, setIsAdding]             = useState(false);

  // Task Detail Panel
  const [detailTask, setDetailTask]   = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId]       = useState<string | null>(null);

  // Filter
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterPriority, setFilterPriority]       = useState<string>('All');
  const [filterAssignee, setFilterAssignee]       = useState<string>('All');

  // Member management
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [tempMembers, setTempMembers]             = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const found = projects.find(p => p.id === id);
    if (found) setProject(found);
    else getProject(id).then(setProject).catch(console.error);
    getTasksByProject(id).then(setTasks).catch(console.error);
  }, [id, projects]);

  const filteredTasks = useMemo(() => {
    if (!project) return [];
    return tasks
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(t => filterPriority === 'All' || t.priority === filterPriority)
      .filter(t => filterAssignee === 'All' || t.assigneeId === filterAssignee);
  }, [tasks, project, searchQuery, filterPriority, filterAssignee]);

  const handleTaskMove = async (taskId: string, newColumnId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, columnId: newColumnId } : t));
    try {
      const { updateTask } = await import('../api/tasks');
      await updateTask(taskId, { columnId: newColumnId });
    } catch (err) {
      console.error(err);
      getTasksByProject(id!).then(setTasks).catch(console.error);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDeleteId(taskId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDeleteId) return;
    try {
      await deleteTask(taskToDeleteId);
      setTasks(prev => prev.filter(t => t.id !== taskToDeleteId));
      if (detailTask?.id === taskToDeleteId) { setIsDetailOpen(false); setDetailTask(null); }
    } catch (err) { console.error(err); }
    setIsDeleteModalOpen(false);
    setTaskToDeleteId(null);
  };

  const handleOpenTaskDetail = (task: Task) => {
    setDetailTask(task);
    setIsDetailOpen(true);
  };

  const handleTaskUpdate = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (detailTask?.id === updated.id) setDetailTask(updated);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) { setAddError('Task title is required'); return; }
    if (!project) return;
    setIsAdding(true);
    try {
      const firstColumn = columns[0];
      const newTask = await createTask({
        title: newTaskTitle,
        projectId: project.id,
        columnId: firstColumn?.id ?? 'col1',
        assigneeId: newTaskAssignee || (currentUser?.id ?? ''),
        description: '',
        priority: 'Medium',
        dueDate: new Date().toISOString(),
        tags: [],
        color: selectedColor,
      });
      setTasks(prev => [newTask, ...prev]);
      setNewTaskTitle('');
      setNewTaskAssignee(currentUser?.id ?? '');
      setSelectedColor('blue');
      setAddError('');
      setIsAddModalOpen(false);
      // open detail panel right away
      handleOpenTaskDetail(newTask);
    } catch (err) { console.error(err); }
    finally { setIsAdding(false); }
  };

  const taskColors = [
    { name: 'blue',   class: 'bg-blue-500' },
    { name: 'green',  class: 'bg-green-500' },
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'orange', class: 'bg-orange-500' },
    { name: 'red',    class: 'bg-red-500' },
    { name: 'pink',   class: 'bg-pink-500' },
    { name: 'yellow', class: 'bg-yellow-400' },
    { name: 'teal',   class: 'bg-teal-500' },
  ];

  if (!project) return null;

  return (
    <div className="flex h-full flex-col space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <span className="text-xl font-bold">{project.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{project.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
              <Users className="h-4 w-4" />
              <span>{project.members.length} Members</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:bg-zinc-900 dark:border-zinc-800">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                view === 'kanban'
                  ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              <LayoutGrid className="h-4 w-4" /> Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                view === 'list'
                  ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              <List className="h-4 w-4" /> List
            </button>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            className="pl-10 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
            value={searchInput}
            onChange={e => {
              setSearchInput(e.target.value);
              if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
              searchDebounceRef.current = setTimeout(() => setSearchQuery(e.target.value), 250);
            }}
          />
        </div>
        <div className="relative flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            className="gap-2 cursor-pointer dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
            onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
          >
            <Filter className="h-4 w-4" />
            Filter {filterPriority !== 'All' || filterAssignee !== 'All' ? '(Active)' : ''}
          </Button>

          {isFilterModalOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:bg-zinc-900 dark:border-zinc-800">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Priority</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Low', 'Medium', 'High'].map(p => (
                      <button
                        key={p}
                        onClick={() => setFilterPriority(p)}
                        className={cn(
                          'rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer',
                          filterPriority === p
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                        )}
                      >{p}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Assignee</label>
                  <select
                    className="w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-xs focus:border-blue-500 focus:outline-none cursor-pointer dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                    value={filterAssignee}
                    onChange={e => setFilterAssignee(e.target.value)}
                  >
                    <option value="All">All Members</option>
                    {project.members.map(mId => {
                      const member = users.find(u => u.id === mId);
                      return <option key={mId} value={mId}>{member?.name}</option>;
                    })}
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-zinc-800">
                  <button
                    onClick={() => { setFilterPriority('All'); setFilterAssignee('All'); }}
                    className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
                  >Reset</button>
                  <button
                    onClick={() => setIsFilterModalOpen(false)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                  >Done</button>
                </div>
              </div>
            </div>
          )}

          {/* Member avatars */}
          <div className="flex -space-x-2">
            {project.members.map(mId => {
              const member = users.find(u => u.id === mId);
              return (
                <img
                  key={mId} src={member?.avatarUrl} alt={member?.name}
                  className="h-8 w-8 rounded-full border-2 border-white bg-gray-100"
                  referrerPolicy="no-referrer" title={member?.name}
                />
              );
            })}
            <button
              onClick={() => { setTempMembers([...project.members]); setIsMemberModalOpen(true); }}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer"
              title="Manage Members"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Board / List ── */}
      <div className="flex-1 min-h-0">
        {view === 'kanban' ? (
          <KanbanBoard
            tasks={filteredTasks}
            columns={columns}
            onTaskMove={handleTaskMove}
            onDeleteTask={handleDeleteTask}
            onOpenTaskDetail={handleOpenTaskDetail}
            onAddTaskClick={() => setIsAddModalOpen(true)}
          />
        ) : (
          <ListView
            tasks={filteredTasks}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleOpenTaskDetail}
          />
        )}
      </div>

      {/* ── Task Detail Panel ── */}
      <TaskDetailPanel
        task={detailTask}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdate={handleTaskUpdate}
        onDelete={handleDeleteTask}
        projectMembers={project.members}
      />

      {/* ── Add Task Modal ── */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Task">
        <form onSubmit={handleAddTask} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Task Title"
              placeholder="e.g. Design new logo"
              value={newTaskTitle}
              onChange={e => { setNewTaskTitle(e.target.value); if (e.target.value) setAddError(''); }}
              error={addError}
              autoFocus
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Assignee</label>
              <select
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none cursor-pointer dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
                value={newTaskAssignee}
                onChange={e => setNewTaskAssignee(e.target.value)}
              >
                {project.members.map(mId => {
                  const member = users.find(u => u.id === mId);
                  return <option key={mId} value={mId}>{member?.name}</option>;
                })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Task Color</label>
              <div className="flex flex-wrap gap-2">
                {taskColors.map(c => (
                  <button
                    key={c.name} type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={cn(
                      'h-8 w-8 rounded-full transition-all hover:scale-110 cursor-pointer', c.class,
                      selectedColor === c.name ? 'ring-2 ring-blue-500 ring-offset-2' : 'opacity-70'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            After creating, you can add description, images, and comments in the detail panel.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isAdding}>Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation ── */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Task">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-zinc-400">Are you sure you want to delete this task? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDeleteTask}>Delete Task</Button>
          </div>
        </div>
      </Modal>

      {/* ── Member Management ── */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Manage Project Members">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-zinc-100">Current Members</h3>
            <div className="space-y-2">
              {tempMembers.map(mId => {
                const member = users.find(u => u.id === mId);
                return (
                  <div key={mId} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={member?.avatarUrl} alt={member?.name} className="h-8 w-8 rounded-full bg-gray-100" referrerPolicy="no-referrer" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{member?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">Member</p>
                      </div>
                    </div>
                    {mId !== currentUser?.id && (
                      <button
                        onClick={() => setTempMembers(prev => prev.filter(uid => uid !== mId))}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer dark:hover:bg-red-900/20"
                      >
                        <Plus className="h-4 w-4 rotate-45" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4 dark:border-zinc-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-zinc-100">Add New Members</h3>
            <div className="space-y-2">
              {users.filter(u => !tempMembers.includes(u.id)).map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full bg-gray-100" referrerPolicy="no-referrer" />
                    <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{user.name}</p>
                  </div>
                  <button
                    onClick={() => setTempMembers(prev => [...prev, user.id])}
                    className="text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors cursor-pointer dark:hover:bg-blue-900/20"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {users.filter(u => !tempMembers.includes(u.id)).length === 0 && (
                <p className="text-center text-sm text-gray-500 italic py-2 dark:text-zinc-500">All users are already members.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsMemberModalOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!id) return;
              try {
                const updated = await updateProject(id, { members: tempMembers });
                setProject(updated);
                await refreshProjects();
              } catch (err) { console.error(err); }
              setIsMemberModalOpen(false);
            }}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
