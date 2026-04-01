import { useState } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  DragStartEvent, DragOverEvent, DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Task, Column } from '../../types';

interface KanbanBoardProps {
  tasks: Task[];
  columns: Column[];
  onTaskMove: (taskId: string, newColumnId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTaskDetail: (task: Task) => void;
  onAddTaskClick: () => void;
}

export const KanbanBoard = ({
  tasks, columns, onTaskMove, onDeleteTask, onOpenTaskDetail, onAddTaskClick,
}: KanbanBoardProps) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (_event: DragOverEvent) => {};

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId  = active.id as string;
    const overId  = over.id as string;
    const overCol = columns.find(c => c.id === overId);
    const overTask = tasks.find(t => t.id === overId);
    const newColumnId = overCol ? overCol.id : overTask ? overTask.columnId : null;

    if (newColumnId) onTaskMove(taskId, newColumnId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter(t => t.columnId === column.id)}
            onDeleteTask={onDeleteTask}
            onOpenTaskDetail={onOpenTaskDetail}
            onAddTaskClick={onAddTaskClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
      }}>
        {activeTask ? (
          <div className="rotate-3 scale-105 shadow-2xl">
            <KanbanCard task={activeTask} isOverlay onDelete={() => onDeleteTask(activeTask.id)} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
