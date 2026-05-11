import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getOrders, updateOrderStatus, type Order } from '@/api/orders.api';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'];

function statusVariant(status: string) {
  switch (status) {
    case 'completed':
    case 'delivered':
      return 'default' as const;
    case 'shipped':
    case 'confirmed':
      return 'secondary' as const;
    case 'cancelled':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
}

export function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: getOrders,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-1">Orders</h2>
        <p className="text-sm text-muted-foreground">Manage and track all customer orders.</p>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by order ID, name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading orders...</p>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px] xl:min-w-0">
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <code className="text-xs">#{order.id.slice(0, 8).toUpperCase()}</code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{order.fullName}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell className="font-medium">
                        {Number(order.totalPrice).toLocaleString()} EGP
                      </TableCell>
                      <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) => statusMutation.mutate({ id: order.id, status: v })}
                        >
                          <SelectTrigger className="h-7 w-28 text-xs capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild title="View">
                          <Link to={`/orders/${order.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
