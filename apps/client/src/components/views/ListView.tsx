import type { Task } from '@/types/task.types';
import { TaskCard } from '@/components/tasks/TaskCard';

interface ListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export function ListView({ tasks, onEdit, onDelete }: ListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tasks yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
