import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  LayoutGrid, 
  List, 
  Plus, 
  Users, 
  Search, 
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { mockData } from '../data/mockData';
import { cn } from '../lib/utils';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { ListView } from '../components/list/ListView';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Task } from '../types';

export default function ProjectBoard() {
  const { id } = useParams();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>(mockData.tasks);
  
  // Add Task State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>(mockData.currentUser.id);
  const [selectedColor, setSelectedColor] = useState('blue');
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  // Filter State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterAssignee, setFilterAssignee] = useState<string>('All');

  // Edit Task State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Member Management State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [projectMembers, setProjectMembers] = useState<string[]>([]);
  const [tempMembers, setTempMembers] = useState<string[]>([]);

  const project = useMemo(() => {
    const p = mockData.projects.find(p => p.id === id) || mockData.projects[0];
    return { ...p, members: projectMembers };
  }, [id, projectMembers]);

  useEffect(() => {
    const p = mockData.projects.find(p => p.id === id) || mockData.projects[0];
    setProjectMembers(p.members);
  }, [id]);
  
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => t.projectId === project.id)
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(t => filterPriority === 'All' || t.priority === filterPriority)
      .filter(t => filterAssignee === 'All' || t.assigneeId === filterAssignee);
  }, [tasks, project.id, searchQuery, filterPriority, filterAssignee]);

  const handleTaskMove = (taskId: string, newColumnId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, columnId: newColumnId } : t
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDeleteId(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToEdit) return;

    setTasks(prev => prev.map(t => t.id === taskToEdit.id ? taskToEdit : t));
    
    // Persist to mockData
    const taskIndex = mockData.tasks.findIndex(t => t.id === taskToEdit.id);
    if (taskIndex !== -1) {
      mockData.tasks[taskIndex] = { ...taskToEdit };
    }

    setIsEditModalOpen(false);
    setTaskToEdit(null);
  };

  const confirmDeleteTask = () => {
    if (taskToDeleteId) {
      setTasks(prev => prev.filter(t => t.id !== taskToDeleteId));
      
      // Persist to mockData
      mockData.tasks = mockData.tasks.filter(t => t.id !== taskToDeleteId);
      
      setIsDeleteModalOpen(false);
      setTaskToDeleteId(null);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setAddError('Task title is required');
      return;
    }

    setIsAdding(true);
    // Simulate API delay
    setTimeout(() => {
      const newTask: Task = {
        id: `t${Date.now()}`,
        projectId: project.id,
        columnId: 'col1',
        title: newTaskTitle,
        description: '',
        assigneeId: newTaskAssignee,
        priority: 'Medium',
        dueDate: new Date().toISOString(),
        tags: [],
        color: selectedColor,
        commentsCount: 0
      };

      setTasks(prev => [newTask, ...prev]);
      
      // Persist to mockData
      mockData.tasks.push(newTask);

      setNewTaskTitle('');
      setNewTaskAssignee(mockData.currentUser.id);
      setSelectedColor('blue');
      setAddError('');
      setIsAdding(false);
      setIsAddModalOpen(false);
    }, 800);
  };

  const taskColors = [
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'green', class: 'bg-green-500' },
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'orange', class: 'bg-orange-500' },
    { name: 'red', class: 'bg-red-500' },
    { name: 'pink', class: 'bg-pink-500' },
    { name: 'yellow', class: 'bg-yellow-400' },
    { name: 'teal', class: 'bg-teal-500' },
  ];

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white`}>
            <span className="text-xl font-bold">{project.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{project.members.length} Members</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                view === 'kanban' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                view === 'list' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 cursor-pointer"
            onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
          >
            <Filter className="h-4 w-4" />
            Filter {filterPriority !== 'All' || filterAssignee !== 'All' ? '(Active)' : ''}
          </Button>

          {isFilterModalOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Priority</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Low', 'Medium', 'High'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setFilterPriority(p)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                          filterPriority === p 
                            ? "bg-blue-600 text-white" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Assignee</label>
                  <select
                    className="w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-xs focus:border-blue-500 focus:outline-none cursor-pointer"
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                  >
                    <option value="All">All Members</option>
                    {project.members.map((mId) => {
                      const member = mockData.users.find(u => u.id === mId);
                      return (
                        <option key={mId} value={mId}>{member?.name}</option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <button
                    onClick={() => {
                      setFilterPriority('All');
                      setFilterAssignee('All');
                    }}
                    className="text-xs font-medium text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsFilterModalOpen(false)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex -space-x-2">
            {project.members.map((mId) => {
              const member = mockData.users.find(u => u.id === mId);
              return (
                <img
                  key={mId}
                  src={member?.avatarUrl}
                  alt={member?.name}
                  className="h-8 w-8 rounded-full border-2 border-white bg-gray-100"
                  referrerPolicy="no-referrer"
                  title={member?.name}
                />
              );
            })}
            <button 
              onClick={() => {
                setTempMembers([...projectMembers]);
                setIsMemberModalOpen(true);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer"
              title="Manage Members"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {view === 'kanban' ? (
          <KanbanBoard 
            tasks={filteredTasks} 
            columns={mockData.columns} 
            onTaskMove={handleTaskMove}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onAddTaskClick={() => setIsAddModalOpen(true)}
          />
        ) : (
          <ListView 
            tasks={filteredTasks} 
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        )}
      </div>

      {/* Add Task Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleAddTask} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Task Title"
              placeholder="e.g. Design new logo"
              value={newTaskTitle}
              onChange={(e) => {
                setNewTaskTitle(e.target.value);
                if (e.target.value) setAddError('');
              }}
              error={addError}
              autoFocus
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Assignee</label>
              <select
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none cursor-pointer"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
              >
                {project.members.map((mId) => {
                  const member = mockData.users.find(u => u.id === mId);
                  return (
                    <option key={mId} value={mId}>{member?.name}</option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Task Color
              </label>
              <div className="flex flex-wrap gap-2">
                {taskColors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all hover:scale-110",
                      color.class,
                      selectedColor === color.name ? "ring-2 ring-blue-500 ring-offset-2" : "opacity-70"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isAdding}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
      >
        {taskToEdit && (
          <form onSubmit={handleUpdateTask} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Task Title"
                value={taskToEdit.title}
                onChange={(e) => setTaskToEdit({ ...taskToEdit, title: e.target.value })}
                autoFocus
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <div className="flex gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant={taskToEdit.priority === p ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setTaskToEdit({ ...taskToEdit, priority: p })}
                      className="cursor-pointer"
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Assignee</label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none cursor-pointer"
                  value={taskToEdit.assigneeId}
                  onChange={(e) => setTaskToEdit({ ...taskToEdit, assigneeId: e.target.value })}
                >
                  {project.members.map((mId) => {
                    const member = mockData.users.find(u => u.id === mId);
                    return (
                      <option key={mId} value={mId}>{member?.name}</option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Task Color</label>
                <div className="flex flex-wrap gap-2">
                  {taskColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setTaskToEdit({ ...taskToEdit, color: color.name })}
                      className={cn(
                        "h-8 w-8 rounded-full transition-all hover:scale-110 cursor-pointer",
                        color.class,
                        taskToEdit.color === color.name ? "ring-2 ring-blue-500 ring-offset-2" : "opacity-70"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteTask}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Member Management Modal */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title="Manage Project Members"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Current Members</h3>
            <div className="space-y-2">
              {tempMembers.map((mId) => {
                const member = mockData.users.find(u => u.id === mId);
                return (
                  <div key={mId} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src={member?.avatarUrl}
                        alt={member?.name}
                        className="h-8 w-8 rounded-full bg-gray-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member?.name}</p>
                        <p className="text-xs text-gray-500">Member</p>
                      </div>
                    </div>
                    {mId !== mockData.currentUser.id && (
                      <button 
                        onClick={() => setTempMembers(prev => prev.filter(id => id !== mId))}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove Member"
                      >
                        <Plus className="h-4 w-4 rotate-45" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Add New Members</h3>
            <div className="space-y-2">
              {mockData.users
                .filter(u => !tempMembers.includes(u.id))
                .map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-8 w-8 rounded-full bg-gray-100"
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    </div>
                    <button 
                      onClick={() => setTempMembers(prev => [...prev, user.id])}
                      className="text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors cursor-pointer"
                      title="Add Member"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              {mockData.users.filter(u => !tempMembers.includes(u.id)).length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-2">All users are already members.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setProjectMembers(tempMembers);
              
              // Persist to mockData
              const projectIndex = mockData.projects.findIndex(p => p.id === id);
              if (projectIndex !== -1) {
                mockData.projects[projectIndex].members = [...tempMembers];
              }
              
              setIsMemberModalOpen(false);
            }}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

