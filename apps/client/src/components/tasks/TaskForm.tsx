import { useState, useEffect } from 'react';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { STATUSES, PRIORITIES, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
import type { Task } from '@/types/task.types';
import type { TaskStatus, TaskPriority } from '@/types/task.types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: number;
  task?: Task;
  defaultDate?: string;
}

export function TaskForm({ open, onOpenChange, projectId, task, defaultDate }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const { data: projects } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const needsProjectPicker = !projectId && !task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setStartDate(task.startDate || '');
      setEndDate(task.endDate || '');
      setSelectedProjectId(String(task.projectId));
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setStartDate(defaultDate || '');
      setEndDate(defaultDate || '');
      setSelectedProjectId(projectId ? String(projectId) : '');
    }
  }, [task, open, defaultDate, projectId]);

  const resolvedProjectId = projectId || (task ? task.projectId : Number(selectedProjectId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !resolvedProjectId) return;

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    if (task) {
      await updateTask.mutateAsync({ id: task.id, data });
    } else {
      await createTask.mutateAsync({ ...data, projectId: resolvedProjectId });
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{task ? 'Edit Task' : 'New Task'}</SheetTitle>
          <SheetDescription className="sr-only">
            Enter the details of the task including title, status, priority, and dates.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 px-1">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
          </div>
          {needsProjectPicker && (
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_CONFIG[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || (needsProjectPicker && !selectedProjectId)}>
              {task ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
