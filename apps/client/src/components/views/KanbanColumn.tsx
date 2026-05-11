import { useSortable } from '@dnd-kit/react/sortable';
import { CollisionPriority } from '@dnd-kit/abstract';
import type { Task, TaskStatus } from '@/types/task.types';
import { STATUS_CONFIG } from '@/lib/constants';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  index: number;
  onEdit: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, index, onEdit }: KanbanColumnProps) {
  const { ref } = useSortable({
    id: status,
    index,
    type: 'column',
    collisionPriority: CollisionPriority.Low,
    accept: ['item', 'column'],
  });

  return (
    <div ref={ref} className="flex-1 min-w-[280px] max-w-[360px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h3 className="font-semibold text-sm">{STATUS_CONFIG[status].label}</h3>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2 min-h-[100px] p-2 rounded-lg bg-muted/50">
        {tasks.map((task, taskIndex) => (
          <KanbanCard
            key={task.id}
            task={task}
            index={taskIndex}
            column={status}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
