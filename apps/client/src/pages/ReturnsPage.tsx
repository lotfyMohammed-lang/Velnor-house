import { useQuery } from '@tanstack/react-query';
import { getMyReturns } from '@/api/returns.api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCcw, Calendar, MessageSquare, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function ReturnsPage() {
  const { data: returns, isLoading } = useQuery({
    queryKey: ['my-returns'],
    queryFn: getMyReturns,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'rejected':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400';
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
          Post-Purchase Support
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground">
          My Returns
        </h1>
      </div>

      {!returns || returns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-background/50 py-20 text-center">
          <RefreshCcw className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-xl font-bold">No return requests</h3>
          <p className="mt-2 text-muted-foreground">You haven't requested any returns yet.</p>
          <Button asChild className="mt-8 rounded-full px-8" variant="outline">
            <Link to="/orders">View Orders</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {returns.map((request: any) => (
            <Card key={request.id} className="overflow-hidden rounded-[28px] border-border/60 bg-background/50 shadow-sm backdrop-blur-sm">
              <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${getStatusColor(request.status)}`}>
                      <RefreshCcw className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Request Status
                      </p>
                      <p className="text-sm font-bold capitalize">{request.status}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Requested On
                      </p>
                      <p className="text-sm font-bold">{new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Order
                      </p>
                      <p className="text-sm font-bold text-amber-600">#{request.orderId.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-8">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-4">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Product Information</span>
                    </div>
                    <h4 className="text-lg font-bold">{request.productName}</h4>
                    <p className="text-sm text-muted-foreground">Quantity: {request.quantity}</p>
                  </div>

                  <div className="flex-1 min-w-[280px]">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Reason for Return</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed bg-muted/30 p-4 rounded-2xl border border-border/40">
                      {request.reason}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
