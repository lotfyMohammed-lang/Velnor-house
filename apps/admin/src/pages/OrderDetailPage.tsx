import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Package,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building2,
  Navigation,
  MessageSquare,
  Map,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { getOrderById, updateOrderStatus } from '@/api/orders.api';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateOrderStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  if (isLoading) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading order...</div>;
  if (!order) return <p className="text-sm text-destructive">Order not found.</p>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
            <Link to="/orders"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              Order <code>#{order.id.slice(0, 8).toUpperCase()}</code>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Status:</span>
          <Select value={order.status} onValueChange={(v) => statusMutation.mutate(v)}>
            <SelectTrigger className="w-full sm:w-36 capitalize rounded-xl font-bold text-sm h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize font-medium">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3">
        <Card className="rounded-2xl border-none shadow-sm bg-zinc-50/50">
          <CardHeader className="pb-1.5 sm:pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-black">{Number(order.totalPrice).toLocaleString()} EGP</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm bg-zinc-50/50">
          <CardHeader className="pb-1.5 sm:pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-black">{order.items.reduce((s, i) => s + i.quantity, 0)} Units</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm bg-zinc-50/50 xs:col-span-2 md:col-span-1">
          <CardHeader className="pb-1.5 sm:pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg font-bold capitalize">{order.paymentMethod}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl sm:rounded-3xl border-zinc-100 overflow-hidden shadow-sm">
        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items Ordered
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[600px] sm:min-w-0">
              <TableHeader className="bg-zinc-50/30">
                <TableRow>
                  <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest">Product</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Size</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Price</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Qty</TableHead>
                  <TableHead className="pr-6 text-[10px] font-black uppercase tracking-widest text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover border border-zinc-100 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-zinc-900 truncate">{item.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 truncate">{item.brand}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{item.sizeMl ? `${item.sizeMl}ml` : '-'}</TableCell>
                    <TableCell className="text-right font-medium text-sm">{Number(item.price).toLocaleString()} EGP</TableCell>
                    <TableCell className="text-center font-bold text-sm">{item.quantity}</TableCell>
                    <TableCell className="pr-6 text-right font-black text-sm">
                      {(item.price * item.quantity).toLocaleString()} EGP
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 sm:p-6 bg-zinc-50/20 border-t border-zinc-100 flex justify-between items-center">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Final Total</span>
            <span className="text-xl sm:text-2xl font-black">{Number(order.totalPrice).toLocaleString()} EGP</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Information */}
        <Card className="rounded-2xl sm:rounded-3xl border-zinc-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
              <div className="font-bold text-zinc-900 text-sm sm:text-base">{order.fullName}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
              <div className="font-medium text-zinc-600 underline text-sm break-all">{order.email}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-emerald-500" />
                <code className="font-bold text-zinc-900 text-sm">{order.phone}</code>
              </div>
            </div>
            {order.user && (
              <div className="pt-2">
                <Separator className="mb-4" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Linked Account:</span>
                  <Link to={`/users/${order.user.id}`} className="text-xs font-bold text-primary hover:underline">
                    @{order.user.username}
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Address Details */}
        <Card className="rounded-2xl sm:rounded-3xl border-zinc-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-600" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Governorate</Label>
                <div className="font-bold text-sm text-zinc-900 capitalize">{order.governorate}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City</Label>
                <div className="font-bold text-sm text-zinc-900 capitalize">{order.city}</div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Area & Street</Label>
              <div className="font-medium text-sm text-zinc-800">
                {order.area}, {order.street}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bldg</Label>
                <div className="font-bold text-sm text-zinc-900">{order.buildingNumber}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Floor</Label>
                <div className="font-bold text-sm text-zinc-900">{order.floor || '-'}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Apt</Label>
                <div className="font-bold text-sm text-zinc-900">{order.apartmentNumber || '-'}</div>
              </div>
            </div>

            {order.landmark && (
              <div className="space-y-1 flex items-start gap-2 bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                <Navigation className="h-3 w-3 text-blue-500 mt-1 shrink-0" />
                <div className="min-w-0">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-blue-400 block">Landmark</Label>
                  <span className="text-xs font-bold text-blue-900 break-words">{order.landmark}</span>
                </div>
              </div>
            )}

            {order.deliveryNotes && (
              <div className="space-y-1 flex items-start gap-2 bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                <MessageSquare className="h-3 w-3 text-amber-500 mt-1 shrink-0" />
                <div className="min-w-0">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-amber-400 block">Notes</Label>
                  <span className="text-xs font-bold text-amber-900 italic break-words">"{order.deliveryNotes}"</span>
                </div>
              </div>
            )}

            <Separator />
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Formatted Summary</Label>
              <p className="text-[11px] leading-relaxed text-zinc-500">{order.address}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-none bg-zinc-900 text-white shadow-xl overflow-hidden">
        <CardContent className="py-4 px-4 sm:px-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center text-[10px] font-black uppercase tracking-widest">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <span className="text-zinc-500">Order ID: <code className="text-zinc-300 ml-1 break-all">{order.id}</code></span>
            <span className="text-zinc-500 whitespace-nowrap">Placed: <span className="text-zinc-300 ml-1">{new Date(order.createdAt).toLocaleString()}</span></span>
          </div>
          <span className="text-zinc-500 whitespace-nowrap">Updated: <span className="text-zinc-300 ml-1">{new Date(order.updatedAt).toLocaleString()}</span></span>
        </CardContent>
      </Card>
    </div>
  );
}
