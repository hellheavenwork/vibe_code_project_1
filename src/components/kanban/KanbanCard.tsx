import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Calendar, Trash2, MoreVertical } from 'lucide-react';
import { Task } from '../../types';
import { cn, formatDate } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { mockData } from '../../data/mockData';

interface KanbanCardProps {
  task: Task;
  isOverlay?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, isOverlay, onDelete, onEdit }) => {
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

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-32 w-full rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md cursor-grab active:cursor-grabbing overflow-hidden',
        isOverlay && 'border-blue-400 shadow-xl'
      )}
    >
      {/* Color Indicator */}
      {task.color && (
        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", colorClasses[task.color] || 'bg-blue-500')} />
      )}

      <div className="flex items-start justify-between">
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <Badge key={tag} className="bg-gray-100 text-[10px] text-gray-600">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-500 p-1 rounded-md hover:bg-blue-50 cursor-pointer"
            title="Edit Task"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-gray-900 leading-tight">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3 text-gray-400">
          {task.commentsCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-[10px] font-medium">{task.commentsCount}</span>
            </div>
          )}
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
              className="h-6 w-6 rounded-full border border-white bg-gray-100"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>
    </div>
  );
};
