import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';
import { useTasks, useDeleteTask, useReorderTask } from '@/hooks/useTasks';
import { TaskForm } from '@/components/tasks/TaskForm';
import { ViewSwitcher, type ViewType } from '@/components/views/ViewSwitcher';
import { ListView } from '@/components/views/ListView';
import { KanbanView } from '@/components/views/KanbanView';
import { CalendarView } from '@/components/views/CalendarView';
import { Button } from '@/components/ui/button';
import type { Task, TaskStatus } from '@/types/task.types';

export function TasksPage() {
  const { projectId } = useParams();
  const pid = Number(projectId);
  const { data: project, isLoading: loadingProject } = useProject(pid);
  const { data: tasks = [], isLoading: loadingTasks } = useTasks(pid);
  const deleteTask = useDeleteTask();
  const reorderTask = useReorderTask(['tasks', pid]);

  const [view, setView] = useState<ViewType>('list');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [defaultDate, setDefaultDate] = useState<string | undefined>();

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setDefaultDate(undefined);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditTask(undefined);
    setDefaultDate(undefined);
    setShowForm(true);
  };

  const handleNewWithDate = (date: string) => {
    setEditTask(undefined);
    setDefaultDate(date);
    setShowForm(true);
  };

  if (loadingProject || loadingTasks) {
    return <div className="p-8 text-muted-foreground">Loading...</div>;
  }

  if (!project) {
    return <div className="p-8 text-muted-foreground">Project not found</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: project.color || '#94a3b8' }}
          />
          <h2 className="text-2xl font-bold">{project.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <ViewSwitcher value={view} onChange={setView} />
          <Button onClick={handleNew}>New Task</Button>
        </div>
      </div>

      {view === 'list' && (
        <ListView
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={(id) => deleteTask.mutate(id)}
        />
      )}

      {view === 'kanban' && (
        <KanbanView
          tasks={tasks}
          onEdit={handleEdit}
          onReorder={(taskId: number, status: TaskStatus, position: number) => {
            reorderTask.mutate({ id: taskId, data: { status, position } });
          }}
        />
      )}

      {view === 'calendar' && (
        <CalendarView
          tasks={tasks}
          onEdit={handleEdit}
          onDateClick={handleNewWithDate}
        />
      )}

      <TaskForm
        open={showForm}
        onOpenChange={setShowForm}
        projectId={pid}
        task={editTask}
        defaultDate={defaultDate}
      />
    </div>
  );
}
