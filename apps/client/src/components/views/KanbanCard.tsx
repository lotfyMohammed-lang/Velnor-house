import { useSortable } from '@dnd-kit/react/sortable';
import type { Task } from '@/types/task.types';
import type { TaskStatus } from '@/types/task.types';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

interface KanbanCardProps {
  task: Task;
  index: number;
  column: TaskStatus;
  onEdit: (task: Task) => void;
}

export function KanbanCard({ task, index, column, onEdit }: KanbanCardProps) {
  const { ref, isDragging } = useSortable({
    id: task.id,
    index,
    type: 'item',
    accept: 'item',
    group: column,
    data: { task },
  });

  return (
    <div
      ref={ref}
      className={`p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-sm'
      }`}
      onClick={() => onEdit(task)}
    >
      <p className="font-medium text-sm mb-2 leading-snug">{task.title}</p>
      <div className="flex items-center gap-1.5">
        <Badge variant="secondary" className={`${PRIORITY_CONFIG[task.priority].color} text-xs`}>
          {PRIORITY_CONFIG[task.priority].label}
        </Badge>
        {task.endDate && (
          <span className="text-xs text-muted-foreground">
            {task.endDate}
          </span>
        )}
      </div>
    </div>
  );
}
