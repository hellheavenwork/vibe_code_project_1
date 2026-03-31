import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { Column, Task } from '../../types';
import { Plus, MoreHorizontal } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onAddTaskClick: () => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks, onDeleteTask, onEditTask, onAddTaskClick }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-xl bg-gray-50/50 p-3 dark:bg-zinc-900/50">
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-300">{column.title}</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-500 dark:bg-zinc-800 dark:text-zinc-500">
            {tasks.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:text-zinc-600 dark:hover:text-zinc-400">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-3"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard 
              key={task.id} 
              task={task} 
              onDelete={() => onDeleteTask(task.id)}
              onEdit={() => onEditTask(task)}
            />
          ))}
        </SortableContext>

        <button 
          onClick={onAddTaskClick}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3 text-sm font-medium text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all dark:border-zinc-800 dark:text-zinc-600 dark:hover:border-blue-900 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>
    </div>
  );
};
