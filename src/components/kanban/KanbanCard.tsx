import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Calendar, Trash2, Expand } from 'lucide-react';
import { Task } from '../../types';
import { cn, formatDate } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { mockData } from '../../data/mockData';

interface KanbanCardProps {
  task: Task;
  isOverlay?: boolean;
  onDelete?: () => void;
  onOpenDetail?: () => void;
}

const priorityColors = {
  Low: 'info',
  Medium: 'warning',
  High: 'danger',
} as const;

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500',
  orange: 'bg-orange-500', red: 'bg-red-500', pink: 'bg-pink-500',
  yellow: 'bg-yellow-400', teal: 'bg-teal-500',
};

export const KanbanCard: React.FC<KanbanCardProps> = React.memo(({ task, isOverlay, onDelete, onOpenDetail }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const assignee = mockData.users.find(u => u.id === task.assigneeId);

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-28 w-full rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-900/10"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onOpenDetail}
      className={cn(
        'group relative flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md cursor-pointer overflow-hidden dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-blue-900',
        isOverlay && 'border-blue-400 shadow-xl dark:border-blue-600'
      )}
    >
      {/* Color bar */}
      {task.color && (
        <div className={cn('absolute left-0 top-0 bottom-0 w-1.5', colorClasses[task.color] ?? 'bg-blue-500')} />
      )}

      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map(tag => (
            <Badge key={tag} className="bg-gray-100 text-[10px] text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Expand / detail button */}
          <button
            onClick={e => { e.stopPropagation(); onOpenDetail?.(); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-500 p-1 rounded-md hover:bg-blue-50 cursor-pointer dark:text-zinc-600 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
            title="Open detail"
          >
            <Expand className="h-3.5 w-3.5" />
          </button>
          {/* Delete */}
          <button
            onClick={e => { e.stopPropagation(); onDelete?.(); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 cursor-pointer dark:text-zinc-600 dark:hover:text-red-400 dark:hover:bg-red-900/20"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-gray-900 leading-tight dark:text-zinc-100 pl-0.5">
        {task.title}
      </h4>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3 text-gray-400 dark:text-zinc-500">
          {/* Comment badge with notification dot */}
          <div className="relative flex items-center gap-1">
            <MessageSquare
              className={cn('h-3.5 w-3.5', task.commentsCount > 0 ? 'text-blue-500' : 'text-gray-300 dark:text-zinc-600')}
            />
            {task.commentsCount > 0 && (
              <>
                <span className="text-[10px] font-semibold text-blue-500">{task.commentsCount}</span>
                {/* notification dot */}
                <span className="absolute -right-1.5 -top-1 h-1.5 w-1.5 rounded-full bg-blue-500 ring-1 ring-white dark:ring-zinc-900" />
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium">{formatDate(task.dueDate)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={priorityColors[task.priority]} className="text-[9px] px-1.5">
            {task.priority}
          </Badge>
          {assignee && (
            <img
              src={assignee.avatarUrl}
              alt={assignee.name}
              className="h-6 w-6 rounded-full border border-white bg-gray-100 dark:border-zinc-900 dark:bg-zinc-800"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>
    </div>
  );
});
