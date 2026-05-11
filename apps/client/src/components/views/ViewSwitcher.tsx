import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type ViewType = 'list' | 'kanban' | 'calendar';

interface ViewSwitcherProps {
  value: ViewType;
  onChange: (view: ViewType) => void;
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ViewType)}>
      <TabsList>
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="kanban">Kanban</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
