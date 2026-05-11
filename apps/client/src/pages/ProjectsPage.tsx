import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useDeleteProject } from '@/hooks/useProjects';
import { useAllTasks, useDeleteTask, useReorderTask } from '@/hooks/useTasks';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { TaskForm } from '@/components/tasks/TaskForm';
import { ViewSwitcher, type ViewType } from '@/components/views/ViewSwitcher';
import { ListView } from '@/components/views/ListView';
import { KanbanView } from '@/components/views/KanbanView';
import { CalendarView } from '@/components/views/CalendarView';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Project } from '@/types/project.types';
import type { Task, TaskStatus } from '@/types/task.types';

export function ProjectsPage() {
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: allTasks = [], isLoading: loadingTasks } = useAllTasks();
  const deleteProject = useDeleteProject();
  const deleteTask = useDeleteTask();
  const reorderTask = useReorderTask(['tasks', 'all']);
  const navigate = useNavigate();

  const [editProject, setEditProject] = useState<Project | undefined>();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [view, setView] = useState<ViewType>('list');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [defaultDate, setDefaultDate] = useState<string | undefined>();

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setDefaultDate(undefined);
    setShowTaskForm(true);
  };

  const handleNewTask = () => {
    setEditTask(undefined);
    setDefaultDate(undefined);
    setShowTaskForm(true);
  };

  const handleNewTaskWithDate = (date: string) => {
    setEditTask(undefined);
    setDefaultDate(date);
    setShowTaskForm(true);
  };

  if (loadingProjects || loadingTasks) {
    return <div className="p-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button onClick={() => { setEditProject(undefined); setShowProjectForm(true); }}>
          New Project
        </Button>
      </div>
      {projects?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No projects yet</p>
          <p className="text-sm">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => navigate(`/app/projects/${project.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: project.color || '#94a3b8' }}
                    />
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditProject(project);
                        setShowProjectForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject.mutate(project.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {project.description && (
                  <CardDescription className="mt-1">{project.description}</CardDescription>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {(projects?.length ?? 0) > 0 && (
        <>
          <Separator className="my-8" />
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Tasks</h2>
            <div className="flex items-center gap-3">
              <ViewSwitcher value={view} onChange={setView} />
              <Button onClick={handleNewTask}>New Task</Button>
            </div>
          </div>

          {view === 'list' && (
            <ListView
              tasks={allTasks}
              onEdit={handleEditTask}
              onDelete={(id) => deleteTask.mutate(id)}
            />
          )}

          {view === 'kanban' && (
            <KanbanView
              tasks={allTasks}
              onEdit={handleEditTask}
              onReorder={(taskId: number, status: TaskStatus, position: number) => {
                reorderTask.mutate({ id: taskId, data: { status, position } });
              }}
            />
          )}

          {view === 'calendar' && (
            <CalendarView
              tasks={allTasks}
              onEdit={handleEditTask}
              onDateClick={handleNewTaskWithDate}
            />
          )}
        </>
      )}

      <ProjectForm
        open={showProjectForm}
        onOpenChange={setShowProjectForm}
        project={editProject}
      />
      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        task={editTask}
        defaultDate={defaultDate}
      />
    </div>
  );
}
