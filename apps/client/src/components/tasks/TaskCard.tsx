import type { Task } from '@/types/task.types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => onEdit(task)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{task.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={STATUS_CONFIG[task.status].color}>
            {STATUS_CONFIG[task.status].label}
          </Badge>
          <Badge variant="secondary" className={PRIORITY_CONFIG[task.priority].color}>
            {PRIORITY_CONFIG[task.priority].label}
          </Badge>
          {task.endDate && (
            <span className="text-xs text-muted-foreground">
              Due {task.endDate}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-destructive hover:text-destructive shrink-0 ml-2"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
      >
        Delete
      </Button>
    </div>
  );
}
