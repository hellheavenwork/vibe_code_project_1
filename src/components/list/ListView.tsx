import { Task } from '../../types';
import { formatDate, cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { mockData } from '../../data/mockData';
import { MessageSquare, Calendar, User, Trash2, MoreVertical } from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export const ListView = ({ tasks, onDeleteTask, onEditTask }: ListViewProps) => {
  const priorityColors = {
    Low: 'info',
    Medium: 'warning',
    High: 'danger',
  } as const;

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-400',
    teal: 'bg-teal-500',
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-zinc-900 dark:border-zinc-800">
      <table className="w-full border-collapse text-left">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-zinc-800/50 dark:text-zinc-400">
          <tr>
            <th className="px-6 py-4">Task Name</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Priority</th>
            <th className="px-6 py-4">Assignee</th>
            <th className="px-6 py-4 text-right">Due Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
          {tasks.map((task) => {
            const assignee = mockData.users.find(u => u.id === task.assigneeId);
            const column = mockData.columns.find(c => c.id === task.columnId);
            
            return (
              <tr key={task.id} className="group hover:bg-gray-50 transition-colors dark:hover:bg-zinc-800/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {task.color && (
                      <div className={cn("h-3 w-3 rounded-full shrink-0", colorClasses[task.color] || 'bg-blue-500')} />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{task.title}</span>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-400 dark:text-zinc-500">
                        {task.tags.map(tag => (
                          <span key={tag}>#{tag}</span>
                        ))}
                        {task.commentsCount > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {task.commentsCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30">
                    {column?.title}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {assignee ? (
                      <>
                        <img
                          src={assignee.avatarUrl}
                          alt={assignee.name}
                          className="h-6 w-6 rounded-full bg-gray-100 dark:bg-zinc-800"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-sm text-gray-600 dark:text-zinc-400">{assignee.name}</span>
                      </>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-600">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-sm text-gray-500 dark:text-zinc-400">
                    <Calendar className="h-4 w-4" />
                    {formatDate(task.dueDate)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onEditTask(task)}
                      className="text-gray-400 hover:text-blue-500 p-1 rounded-md hover:bg-blue-50 transition-colors cursor-pointer dark:text-zinc-600 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                      title="Edit Task"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer dark:text-zinc-600 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-zinc-600">
          <p>No tasks found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
