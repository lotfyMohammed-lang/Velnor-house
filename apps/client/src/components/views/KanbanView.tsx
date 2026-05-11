import { useState, useEffect } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';
import type { Task, TaskStatus } from '@/types/task.types';
import { STATUSES } from '@/lib/constants';
import { KanbanColumn } from './KanbanColumn';

interface KanbanViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onReorder: (taskId: number, status: TaskStatus, position: number) => void;
}

type ColumnItems = Record<TaskStatus, Task[]>;

function groupByStatus(tasks: Task[]): ColumnItems {
  const grouped: ColumnItems = { 'todo': [], 'in-progress': [], 'done': [] };
  for (const task of tasks) {
    grouped[task.status].push(task);
  }
  for (const status of STATUSES) {
    grouped[status].sort((a, b) => a.position - b.position);
  }
  return grouped;
}

export function KanbanView({ tasks, onEdit, onReorder }: KanbanViewProps) {
  const [columns, setColumns] = useState<ColumnItems>(() => groupByStatus(tasks));

  useEffect(() => {
    setColumns(groupByStatus(tasks));
  }, [tasks]);

  return (
    <DragDropProvider
      onDragOver={(event) => {
        const { source } = event.operation;
        if (source?.type === 'column') return;
        setColumns((current) => move(current, event));
      }}
      onDragEnd={(event) => {
        if (event.canceled) return;

        const { source } = event.operation;
        if (!source || source.type === 'column') return;

        const taskId = source.id as number;

        // Find which column the task ended up in and its position
        for (const status of STATUSES) {
          const idx = columns[status].findIndex((t) => t.id === taskId);
          if (idx !== -1) {
            onReorder(taskId, status, idx);
            break;
          }
        }
      }}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status, index) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={columns[status]}
            index={index}
            onEdit={onEdit}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}
