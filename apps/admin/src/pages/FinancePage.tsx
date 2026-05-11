import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  RotateCcw,
  Scale,
  Package,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFinanceSummary } from '@/api/finance.api';

export function FinancePage() {
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['financeSummary'],
    queryFn: getFinanceSummary,
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading finance summary...</div>;
  }

  if (isError) {
    return <div className="text-sm text-destructive">Failed to load finance summary.</div>;
  }

  const cards = [
    { title: 'Total Revenue', value: `${Number(summary?.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`, icon: DollarSign },
    { title: 'Return Expenses', value: `${Number(summary?.returnExpenses ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`, icon: RotateCcw },
    { title: 'Net Revenue', value: `${Number(summary?.netRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`, icon: Scale },
    { title: 'Total Orders', value: summary?.totalOrders ?? 0, icon: Package },
    { title: 'Approved Returns', value: summary?.approvedReturnsCount ?? 0, icon: CheckCircle },
    { title: 'Pending Returns', value: summary?.pendingReturnsCount ?? 0, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Finance Overview</h2>
        <p className="text-muted-foreground">Comprehensive financial summary and revenue tracking.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-[#ef1b4f]" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold truncate">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
