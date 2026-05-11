import { useQuery } from '@tanstack/react-query';
import { getMyOrders } from '@/api/orders.api';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, Calendar, ArrowRight, RefreshCcw, Check } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createReturnRequest } from '@/api/returns.api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PREDEFINED_REASONS = [
  'Product is different than expected',
  'I did not like the scent',
  'Wrong item received',
  'Item arrived damaged',
  'Packaging issue',
  'Changed my mind',
  'Other',
];

export function OrdersPage() {
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [selectedItem, setSelectedItem] = useState<{
    orderId: string;
    productId: string;
    productName: string;
    sizeMl: number;
    quantity: number;
  } | null>(null);

  async function handleReturnRequest() {
    if (!selectedItem || !selectedReason) return;
    
    const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
    if (!finalReason.trim()) {
      toast.error('Please provide a reason for return');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReturnRequest({
        ...selectedItem,
        reason: finalReason,
      });
      toast.success('Return request submitted successfully');
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setSelectedItem(null);
    setSelectedReason(null);
    setCustomReason('');
  }

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
          Purchase History
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground">
          My Orders
        </h1>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-background/50 py-20 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-xl font-bold">No orders found</h3>
          <p className="mt-2 text-muted-foreground">You haven't placed any orders yet.</p>
          <Button asChild className="mt-8 rounded-full px-8" variant="outline">
            <a href="/">Start Shopping</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order: any) => {
            const orderDate = new Date(order.createdAt);
            const isReturnEligible = 
              Math.ceil(Math.abs(new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)) <= 14;

            return (
              <Card key={order.id} className="overflow-hidden rounded-[28px] border-border/60 bg-background/50 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-sm">
                        <Package className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Order ID
                        </p>
                        <p className="text-sm font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Date
                        </p>
                        <p className="text-sm font-bold">{orderDate.toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Total
                        </p>
                        <p className="text-sm font-black text-amber-600">{formatPrice(order.totalPrice)}</p>
                      </div>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="rounded-full px-3 py-1 font-bold">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="divide-y divide-border/40">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex flex-wrap items-center gap-6 p-6">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-[200px]">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                            {item.brand}
                          </p>
                          <h4 className="text-lg font-bold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.sizeMl > 0 ? `${item.sizeMl}ml • ` : ''}
                            {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right mr-4">
                            <p className="text-sm font-black">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                          
                          {isReturnEligible ? (
                            <Dialog onOpenChange={(open) => !open && resetForm()}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-full border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400"
                                  onClick={() => setSelectedItem({
                                    orderId: order.id,
                                    productId: item.productId,
                                    productName: item.name,
                                    sizeMl: item.sizeMl,
                                    quantity: item.quantity
                                  })}
                                >
                                  <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                                  Request Return
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="rounded-[32px] sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-black">Request Return</DialogTitle>
                                  <DialogDescription className="font-medium">
                                    Why would you like to return <strong>{item.name}</strong>?
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                  <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                      Select Reason
                                    </Label>
                                    <div className="grid gap-2">
                                      {PREDEFINED_REASONS.map((reason) => (
                                        <button
                                          key={reason}
                                          type="button"
                                          onClick={() => setSelectedReason(reason)}
                                          className={cn(
                                            "flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-bold transition-all text-left group",
                                            selectedReason === reason 
                                              ? "border-amber-500 bg-amber-500/5 text-amber-600 shadow-sm" 
                                              : "border-border/60 hover:border-amber-200 hover:bg-amber-50/30"
                                          )}
                                        >
                                          {reason}
                                          {selectedReason === reason && (
                                            <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center animate-in zoom-in-50 duration-300">
                                              <Check className="h-3 w-3 text-white stroke-[4]" />
                                            </div>
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {selectedReason === 'Other' && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                      <Label htmlFor="reason" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                        Custom Reason Details
                                      </Label>
                                      <Textarea
                                        id="reason"
                                        placeholder="Tell us more about the issue..."
                                        className="min-h-[100px] rounded-2xl border-border/60 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all"
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                      />
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button 
                                    className="w-full rounded-2xl h-12 font-bold text-sm uppercase tracking-widest bg-zinc-900 hover:bg-rose-600 shadow-lg transition-all" 
                                    onClick={handleReturnRequest}
                                    disabled={isSubmitting || !selectedReason || (selectedReason === 'Other' && !customReason.trim())}
                                  >
                                    {isSubmitting ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : 'Submit Support Request'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/30 px-3 py-1.5 rounded-full border border-border/40">
                              Return window expired
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
