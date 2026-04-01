import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { getAllTasks } from '../api/tasks';
import { Task } from '../types';

export default function MyTasks() {
  const { currentUser, projects, users } = useApp();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    getAllTasks().then(setAllTasks).catch(console.error);
  }, [currentUser]);

  // Only tasks assigned to current user
  const myTasks = useMemo(() => {
    return allTasks
      .filter(t => t.assigneeId === currentUser?.id)
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(t => filterPriority === 'All' || t.priority === filterPriority)
      .filter(t => {
        if (filterStatus === 'All') return true;
        if (filterStatus === 'Done') return t.columnId === 'col4';
        if (filterStatus === 'Active') return t.columnId !== 'col4';
        return true;
      });
  }, [allTasks, currentUser, searchQuery, filterPriority, filterStatus]);

  const stats = [
    { label: 'Total', value: allTasks.filter(t => t.assigneeId === currentUser?.id).length, color: 'blue' },
    { label: 'In Progress', value: allTasks.filter(t => t.assigneeId === currentUser?.id && t.columnId === 'col2').length, color: 'yellow' },
    { label: 'Completed', value: allTasks.filter(t => t.assigneeId === currentUser?.id && t.columnId === 'col4').length, color: 'green' },
    { label: 'High Priority', value: allTasks.filter(t => t.assigneeId === currentUser?.id && t.priority === 'High').length, color: 'red' },
  ];

  const columnLabel: Record<string, string> = {
    col1: 'To Do',
    col2: 'In Progress',
    col3: 'Review',
    col4: 'Done',
  };

  const priorityVariant: Record<string, 'danger' | 'warning' | 'default'> = {
    High: 'danger',
    Medium: 'warning',
    Low: 'default',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">My Tasks</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">All tasks assigned to you across every project.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className={cn(
            "rounded-xl border p-4 text-center",
            "border-gray-200 bg-white dark:bg-zinc-900 dark:border-zinc-800"
          )}>
            <p className={`text-2xl font-bold text-${s.color}-600 dark:text-${s.color}-400`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsFilterOpen(v => !v)}
          >
            <Filter className="h-4 w-4" />
            Filter {(filterPriority !== 'All' || filterStatus !== 'All') ? '(Active)' : ''}
          </Button>
          {isFilterOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:bg-zinc-900 dark:border-zinc-800">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Priority</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Low', 'Medium', 'High'].map(p => (
                      <button
                        key={p}
                        onClick={() => setFilterPriority(p)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                          filterPriority === p ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400"
                        )}
                      >{p}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Active', 'Done'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                          filterStatus === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400"
                        )}
                      >{s}</button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 dark:border-zinc-800">
                  <button onClick={() => { setFilterPriority('All'); setFilterStatus('All'); }} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Reset</button>
                  <button onClick={() => setIsFilterOpen(false)} className="text-xs font-bold text-blue-600 cursor-pointer">Done</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      {myTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 py-16 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-gray-300 dark:text-zinc-600 mb-3" />
          <p className="text-gray-500 dark:text-zinc-400 font-medium">No tasks found</p>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">Tasks assigned to you will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {myTasks.map(task => {
            const project = projects.find(p => p.id === task.projectId);
            const isDone = task.columnId === 'col4';
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all",
                  "dark:bg-zinc-900 dark:border-zinc-800",
                  isDone ? "opacity-60" : "hover:border-blue-200 dark:hover:border-blue-900"
                )}
              >
                {/* Color bar */}
                <div className={cn("h-10 w-1 rounded-full shrink-0", `bg-${task.color || 'blue'}-500`)} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate", isDone && "line-through")}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
                    <span className="truncate">{project?.name ?? '—'}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </div>

                {/* Status pill */}
                <span className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  task.columnId === 'col4' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  task.columnId === 'col2' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                  task.columnId === 'col3' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                  "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}>
                  {columnLabel[task.columnId] ?? task.columnId}
                </span>

                {/* Priority badge */}
                <Badge variant={priorityVariant[task.priority] ?? 'default'}>
                  {task.priority}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
