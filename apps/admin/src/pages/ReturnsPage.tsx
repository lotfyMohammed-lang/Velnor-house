import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllReturnRequests, updateReturnStatus } from '@/api/returns.api';
import type { ReturnRequest } from '@/api/returns.api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  MoreVertical,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

export function ReturnsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: returns, isLoading } = useQuery({
    queryKey: ['admin-returns'],
    queryFn: getAllReturnRequests,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      updateReturnStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
      toast.success('Return status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const filteredReturns = useMemo(() => {
    if (!returns) return [];
    return returns.filter((item) => {
      const matchesSearch =
        item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [returns, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Returns Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review and process customer return requests.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl sm:rounded-[32px] border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/10 p-5 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers..."
                className="h-11 rounded-xl border-border/60 pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filter by Status:</span>
              <div className="flex flex-wrap gap-1.5 p-1 rounded-xl border border-border/40 bg-background w-fit">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-lg px-3 sm:px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                      statusFilter === status
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px] xl:min-w-0">
              <TableHeader className="bg-zinc-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-[120px] text-[10px] font-black uppercase tracking-widest">ID</TableHead>
                  <TableHead className="w-[120px] text-[10px] font-black uppercase tracking-widest">Order</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Product</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Reason</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                  <TableHead className="pr-6 text-right text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-48 text-center text-muted-foreground font-bold">
                      No return requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReturns.map((request) => (
                    <TableRow key={request.id} className="group transition-colors">
                      <TableCell className="pl-6 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                        #{request.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-mono text-[10px] font-bold uppercase text-amber-600">
                        #{request.orderId.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col min-w-[120px]">
                          <span className="font-bold text-sm text-foreground">
                            {request.user?.username || 'N/A'}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                            {request.user?.email || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col min-w-[140px]">
                          <span className="font-bold text-sm">{request.productName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {request.sizeMl}ml • Qty: {request.quantity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-xs italic text-muted-foreground" title={request.reason}>
                          "{request.reason}"
                        </p>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-zinc-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="pr-6 text-right">
                        {request.status === 'pending' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl p-2 w-48 shadow-xl">
                              <DropdownMenuItem
                                onClick={() => updateMutation.mutate({ id: request.id, status: 'approved' })}
                                className="rounded-lg text-emerald-600 font-bold focus:bg-emerald-50 focus:text-emerald-700 py-2.5"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Return
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateMutation.mutate({ id: request.id, status: 'rejected' })}
                                className="rounded-lg text-rose-600 font-bold focus:bg-rose-50 focus:text-rose-700 py-2.5"
                              >
                                <XCircle className="mr-2 h-4 w-4" /> Reject Return
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button variant="ghost" size="icon" disabled className="rounded-xl opacity-10">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
