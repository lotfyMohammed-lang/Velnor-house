import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ShoppingBag, Package, MapPin, CreditCard, Phone, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { API_BASE_URL } from '@/api/client';

function getAuthHeaders() {
  const token = localStorage.getItem('todolo_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

type OrderItem = {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
  sizeMl?: number;
};

type Order = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  totalPrice: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
};

async function fetchOrder(id: string): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to load order');
  return response.json();
}

export function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId!),
    enabled: !!orderId,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 shadow-inner">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Order Placed Successfully!</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        {orderId && (
          <div className="mt-4 rounded-lg bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground">
            Order ID: <code className="text-foreground">#{orderId.slice(0, 8).toUpperCase()}</code>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {order && (
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Order Status</CardTitle>
              <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Items Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.brand}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.sizeMl && item.sizeMl > 0 ? `${item.sizeMl}ml` : '-'}</TableCell>
                      <TableCell className="text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {(item.price * item.quantity).toLocaleString()} EGP
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator className="my-3" />
              <div className="flex justify-between text-sm font-bold">
                <span>Total</span>
                <span>{Number(order.totalPrice).toLocaleString()} EGP</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Payment */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shipping Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{order.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{order.address}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold">{Number(order.totalPrice).toLocaleString()} EGP</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button asChild size="lg" className="px-8">
          <Link to="/">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  );
}
