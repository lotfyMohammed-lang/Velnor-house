import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  Percent,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { promosApi, type PromoCode } from '@/api/promos.api';
import { toast } from 'sonner';

export default function PromoCodesPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newPromo, setNewPromo] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    maxDiscount: '200',
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  async function fetchPromos() {
    try {
      setIsLoading(true);
      const data = await promosApi.getAll();
      setPromos(data);
    } catch (error) {
      console.error('FETCH PROMOS ERROR:', error);
      toast.error('Failed to load promo codes');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newPromo.code || !newPromo.discountValue) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitLoading(true);
      await promosApi.create({
        code: newPromo.code,
        discountType: newPromo.discountType,
        discountValue: Number(newPromo.discountValue),
        maxDiscount: Number(newPromo.maxDiscount),
      });
      toast.success('Promo code created successfully');
      setIsDialogOpen(false);
      setNewPromo({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        maxDiscount: '200',
      });
      fetchPromos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create promo code');
    } finally {
      setIsSubmitLoading(false);
    }
  }

  async function handleToggle(id: string) {
    try {
      await promosApi.toggleStatus(id);
      fetchPromos();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      await promosApi.delete(id);
      setPromos(promos.filter((p) => p.id !== id));
      toast.success('Promo code deleted');
    } catch (error) {
      toast.error('Failed to delete promo code');
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Promo Codes</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your store's promotional discounts and special offers.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full w-full sm:w-auto h-11">
              <Plus className="mr-2 h-4 w-4" />
              New Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-[425px] p-5 sm:p-6">
            <form onSubmit={handleCreate}>
              <DialogHeader className="px-0">
                <DialogTitle className="text-xl">Create Promo Code</DialogTitle>
                <DialogDescription className="text-sm">
                  Add a new discount code for your customers.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-6 px-0">
                <div className="grid gap-2">
                  <Label htmlFor="code" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Code Name</Label>
                  <Input
                    id="code"
                    placeholder="E.g. SUMMER2026"
                    className="h-11 rounded-xl font-bold"
                    value={newPromo.code}
                    onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</Label>
                    <Select
                      value={newPromo.discountType}
                      onValueChange={(value: any) =>
                        setNewPromo({ ...newPromo, discountType: value })
                      }
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="value" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder="E.g. 10"
                      className="h-11 rounded-xl font-bold"
                      value={newPromo.discountValue}
                      onChange={(e) => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max Discount Cap (EGP)</Label>
                  <Input
                    id="max"
                    type="number"
                    className="h-11 rounded-xl font-bold"
                    value={newPromo.maxDiscount}
                    onChange={(e) => setNewPromo({ ...newPromo, maxDiscount: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    This cap limits the maximum discount amount for this code.
                  </p>
                </div>
              </div>
              <DialogFooter className="px-0 pt-2 flex flex-col gap-2">
                <Button type="submit" disabled={isSubmitLoading} className="w-full h-12 rounded-xl">
                  {isSubmitLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Code'
                  )}
                </Button>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="h-10 rounded-xl text-xs uppercase font-bold sm:hidden">Cancel</Button>
                </DialogTrigger>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {promos.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center rounded-[32px] border-dashed">
          <Tag className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-lg font-bold">No promo codes found</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">Get started by creating your first promotional code for the store.</p>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo) => (
            <Card key={promo.id} className={`overflow-hidden rounded-2xl sm:rounded-3xl border-none shadow-md transition-all ${!promo.isActive ? 'opacity-70 grayscale' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-5 sm:p-6 bg-zinc-50/50">
                <div className="space-y-1.5 min-w-0">
                  <Badge variant={promo.isActive ? 'default' : 'secondary'} className="rounded-full text-[9px] uppercase tracking-widest px-2.5 h-5">
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl font-black truncate pr-2">{promo.code}</CardTitle>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {promo.discountType === 'percentage' ? <Percent className="h-5 w-5 sm:h-6 sm:w-6" /> : <Banknote className="h-5 w-5 sm:h-6 sm:w-6" />}
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Discount</p>
                      <p className="text-lg font-bold text-zinc-900">
                        {promo.discountValue}
                        {promo.discountType === 'percentage' ? '%' : ' EGP'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Max Cap</p>
                      <p className="text-lg font-bold text-zinc-900">{promo.maxDiscount} EGP</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 rounded-xl h-10 text-xs font-bold"
                      onClick={() => handleToggle(promo.id)}
                    >
                      {promo.isActive ? (
                        <>
                          <ToggleRight className="mr-2 h-4 w-4 text-emerald-500" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="mr-2 h-4 w-4 text-muted-foreground" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 rounded-xl h-10 text-xs font-bold text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(promo.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
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
