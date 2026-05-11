import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DateClickArg } from '@fullcalendar/interaction';
import type { Task } from '@/types/task.types';
import { PRIORITY_CONFIG } from '@/lib/constants';

const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8',
  medium: '#eab308',
  high: '#f97316',
  urgent: '#ef4444',
};

interface CalendarViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDateClick: (date: string) => void;
}

export function CalendarView({ tasks, onEdit, onDateClick }: CalendarViewProps) {
  const events = tasks
    .filter((t) => t.startDate || t.endDate)
    .map((task) => ({
      id: String(task.id),
      title: task.title,
      start: task.startDate || task.endDate!,
      end: task.endDate
        ? new Date(new Date(task.endDate).getTime() + 86400000).toISOString().split('T')[0]
        : undefined,
      backgroundColor: PRIORITY_COLORS[task.priority],
      borderColor: PRIORITY_COLORS[task.priority],
      extendedProps: { task },
    }));

  const handleEventClick = (info: EventClickArg) => {
    const task = info.event.extendedProps.task as Task;
    onEdit(task);
  };

  const handleDateClick = (info: DateClickArg) => {
    onDateClick(info.dateStr);
  };

  return (
    <div className="fc-wrapper">
      <style>{`
        .fc-wrapper .fc {
          --fc-border-color: hsl(var(--border));
          --fc-button-bg-color: hsl(var(--primary));
          --fc-button-border-color: hsl(var(--primary));
          --fc-button-hover-bg-color: hsl(var(--primary) / 0.9);
          --fc-button-hover-border-color: hsl(var(--primary) / 0.9);
          --fc-button-active-bg-color: hsl(var(--primary) / 0.8);
          --fc-button-active-border-color: hsl(var(--primary) / 0.8);
          --fc-today-bg-color: hsl(var(--accent));
          --fc-page-bg-color: transparent;
          font-family: inherit;
        }
        .fc-wrapper .fc .fc-button {
          font-size: 0.8125rem;
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius);
        }
        .fc-wrapper .fc .fc-toolbar-title {
          font-size: 1.125rem;
          font-weight: 600;
        }
        .fc-wrapper .fc .fc-daygrid-day-number {
          font-size: 0.8125rem;
          padding: 4px 8px;
        }
        .fc-wrapper .fc .fc-event {
          border-radius: 4px;
          font-size: 0.75rem;
          padding: 1px 4px;
          cursor: pointer;
        }
        .fc-wrapper .fc .fc-daygrid-day.fc-day-today {
          background-color: hsl(var(--accent));
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek',
        }}
        height="auto"
        dayMaxEvents={3}
      />
    </div>
  );
}
