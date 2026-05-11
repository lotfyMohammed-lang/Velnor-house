import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getPerfumes,
  createPerfume,
  updatePerfume,
  deletePerfume,
  uploadImage,
  type Perfume,
  type PerfumeSize,
  type CreatePerfumePayload,
  type UpdatePerfumePayload,
} from '@/api/perfumes.api';
import { cn } from '@/lib/utils';

type FormMode = 'create' | 'edit';

const emptySize: PerfumeSize = { sizeMl: 100, costPrice: 0, price: 0, stock: 0 };

const emptyForm = {
  type: 'perfume',
  name: '',
  brand: '',
  description: '',
  currency: 'EGP',
  category: '',
  imageUrl: '',
  featured: false,
  bestseller: false,
  tags: '',
  sizes: [{ ...emptySize }] as PerfumeSize[],
  metadata: {} as Record<string, any>,
};

function formatPriceRange(sizes: PerfumeSize[], currency: string, field: 'price' | 'costPrice' | 'profit' = 'price') {
  if (!sizes || sizes.length === 0) return '-';
  
  const values = sizes.map((s) => {
    if (field === 'profit') {
      return (s.price || 0) - (s.costPrice || 0);
    }
    return s[field] || 0;
  });

  const min = Math.min(...values);
  const max = Math.max(...values);
  
  if (min === max) return `${min.toLocaleString()} ${currency}`;
  return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
}

function totalStock(sizes: PerfumeSize[]) {
  return sizes?.reduce((sum, s) => sum + s.stock, 0) ?? 0;
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [isUploading, setIsUploading] = useState(false);

  const { data: perfumes = [], isLoading } = useQuery({
    queryKey: ['admin-perfumes'],
    queryFn: getPerfumes,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePerfumePayload) => createPerfume(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-perfumes'] });
      closeDialog();
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePerfumePayload }) =>
      updatePerfume(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-perfumes'] });
      closeDialog();
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePerfume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-perfumes'] });
      setDeleteDialogOpen(false);
      setSelectedPerfume(null);
    },
  });

  const filtered = perfumes.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.type?.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setFormMode('create');
    setFormData({ ...emptyForm, sizes: [{ ...emptySize }] });
    setFormError('');
    setDialogOpen(true);
  }

  function openEdit(perfume: Perfume) {
    setFormMode('edit');
    setSelectedPerfume(perfume);
    setFormData({
      type: perfume.type || 'perfume',
      name: perfume.name,
      brand: perfume.brand,
      description: perfume.description,
      currency: perfume.currency || 'EGP',
      category: perfume.category,
      imageUrl: perfume.imageUrl,
      featured: perfume.featured,
      bestseller: perfume.bestseller,
      tags: perfume.tags?.join(', ') ?? '',
      sizes: perfume.sizes?.length ? perfume.sizes.map((s) => ({ ...s })) : [{ ...emptySize }],
      metadata: perfume.metadata || {},
    });
    setFormError('');
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setSelectedPerfume(null);
    setFormError('');
  }

  function updateSize(index: number, field: keyof PerfumeSize, value: number) {
    const updated = [...formData.sizes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, sizes: updated });
  }

  function updateMetadata(field: string, value: any) {
    setFormData({ ...formData, metadata: { ...formData.metadata, [field]: value } });
  }

  function addSize() {
    setFormData({ ...formData, sizes: [...formData.sizes, { ...emptySize }] });
  }

  function removeSize(index: number) {
    if (formData.sizes.length <= 1) return;
    setFormData({ ...formData, sizes: formData.sizes.filter((_, i) => i !== index) });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError('');
    try {
      const result = await uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: result.imageUrl }));
    } catch (err: any) {
      setFormError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.brand || (formData.type === 'perfume' && !formData.category)) {
      setFormError('Name, brand, and category are required');
      return;
    }

    if (formData.sizes.some((s) => s.price < 0 || s.costPrice < 0 || (formData.type === 'perfume' && s.sizeMl <= 0))) {
      setFormError('All variants must have valid prices');
      return;
    }

    const payload: CreatePerfumePayload = {
      type: formData.type,
      name: formData.name,
      brand: formData.brand,
      description: formData.description,
      currency: formData.currency,
      category: formData.type === 'perfume' ? formData.category : formData.type, // Use type as category for bags/watches if not set
      imageUrl: formData.imageUrl,
      featured: formData.featured,
      bestseller: formData.bestseller,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      sizes: formData.sizes,
      metadata: formData.metadata,
    };

    if (formMode === 'create') {
      createMutation.mutate(payload);
    } else if (selectedPerfume) {
      updateMutation.mutate({ id: selectedPerfume.id, payload });
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Products</h2>
          <p className="text-sm text-muted-foreground">Manage multi-category luxury catalog.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by name, brand or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading products...</p>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px] xl:min-w-0">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((perfume) => (
                    <TableRow key={perfume.id}>
                      <TableCell className="font-medium">{perfume.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase text-[10px] font-black tracking-widest">
                          {perfume.type || 'perfume'}
                        </Badge>
                      </TableCell>
                      <TableCell>{perfume.brand}</TableCell>
                      <TableCell>{formatPriceRange(perfume.sizes, perfume.currency, 'costPrice')}</TableCell>
                      <TableCell>{formatPriceRange(perfume.sizes, perfume.currency, 'price')}</TableCell>
                      <TableCell className="font-bold text-green-600 dark:text-green-400">
                        {formatPriceRange(perfume.sizes, perfume.currency, 'profit')}
                      </TableCell>
                      <TableCell className="capitalize">{perfume.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {totalStock(perfume.sizes)}
                          {totalStock(perfume.sizes) <= 0 && <Badge variant="destructive" className="text-[8px] h-4">OUT</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(perfume)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedPerfume(perfume); setDeleteDialogOpen(true); }} title="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
              {formMode === 'create' ? 'Add Item' : 'Edit Item'}
            </DialogTitle>
            <DialogDescription>
              {formMode === 'create' ? 'Add a new luxury item to the store.' : `Editing ${selectedPerfume?.name}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8 mt-6">
            {formError && (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive font-bold border border-destructive/20">{formError}</div>
            )}

            {/* Type Selector */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Item Type</Label>
              <div className="flex gap-2">
                {['perfume', 'bag', 'watch'].map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={formData.type === t ? 'default' : 'outline'}
                    className={cn(
                      "flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px]",
                      formData.type === t ? "bg-zinc-900" : "text-zinc-500"
                    )}
                    onClick={() => setFormData({ ...formData, type: t })}
                  >
                    {t}s
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Name</Label>
                <Input className="h-12 rounded-xl" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Brand</Label>
                <Input className="h-12 rounded-xl" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description</Label>
              <Textarea className="rounded-xl resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Image URL</Label>
                <div className="flex gap-2">
                  <Input className="h-12 rounded-xl" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-12 rounded-xl shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Currency</Label>
                <Input className="h-12 rounded-xl" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
              </div>
            </div>

            {/* Dynamic Fields based on Type */}
            {formData.type === 'perfume' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Perfume Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="unisex">Unisex</SelectItem>
                      <SelectItem value="niche">Niche</SelectItem>
                      <SelectItem value="gift-sets">Gift Sets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sizes & Pricing</Label>
                    <Button type="button" variant="outline" size="sm" className="rounded-lg text-[9px] uppercase font-black" onClick={addSize}>
                      <Plus className="mr-1 h-3 w-3" /> Add Size
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.sizes.map((size, i) => (
                      <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end p-4 border rounded-xl bg-zinc-50/50 relative group">
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase">Size (ml)</Label>
                          <Input className="h-10 bg-white" type="number" value={size.sizeMl} onChange={(e) => updateSize(i, 'sizeMl', Number(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase">Cost</Label>
                          <Input className="h-10 bg-white" type="number" step="0.01" value={size.costPrice} onChange={(e) => updateSize(i, 'costPrice', Number(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase">Selling</Label>
                          <Input className="h-10 bg-white" type="number" step="0.01" value={size.price} onChange={(e) => updateSize(i, 'price', Number(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase">Stock</Label>
                          <Input className="h-10 bg-white" type="number" value={size.stock} onChange={(e) => updateSize(i, 'stock', Number(e.target.value))} />
                        </div>
                        <div className="flex items-center justify-between pt-2 sm:pt-0">
                           <div className="flex flex-col">
                             <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">Profit</span>
                             <span className="text-xs font-black text-green-600">
                               {(Number(size.price || 0) - Number(size.costPrice || 0)).toLocaleString()}
                             </span>
                           </div>
                           <Button type="button" variant="ghost" size="icon" onClick={() => removeSize(i)} disabled={formData.sizes.length <= 1} className="text-destructive">
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'bag' && (
              <div className="space-y-6 pt-4 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Material</Label>
                    <Input className="h-12 rounded-xl" value={formData.metadata.material || ''} onChange={(e) => updateMetadata('material', e.target.value)} placeholder="Leather, Canvas..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Color</Label>
                    <Input className="h-12 rounded-xl" value={formData.metadata.color || ''} onChange={(e) => updateMetadata('color', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Size</Label>
                    <Input className="h-12 rounded-xl" value={formData.metadata.size || ''} onChange={(e) => updateMetadata('size', e.target.value)} placeholder="Small, Medium, Large" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 border rounded-2xl bg-zinc-50/50">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cost Price</Label>
                    <Input className="h-12 rounded-xl bg-white" type="number" step="0.01" value={formData.sizes[0].costPrice} onChange={(e) => updateSize(0, 'costPrice', Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Selling Price</Label>
                    <Input className="h-12 rounded-xl bg-white" type="number" step="0.01" value={formData.sizes[0].price} onChange={(e) => updateSize(0, 'price', Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Stock Units</Label>
                    <Input className="h-12 rounded-xl bg-white" type="number" value={formData.sizes[0].stock} onChange={(e) => updateSize(0, 'stock', Number(e.target.value))} />
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'watch' && (
              <div className="space-y-6 pt-4 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Movement</Label>
                    <Input className="h-12 rounded-xl" value={formData.metadata.movement || ''} onChange={(e) => updateMetadata('movement', e.target.value)} placeholder="Automatic, Quartz..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Strap Material</Label>
                    <Input className="h-12 rounded-xl" value={formData.metadata.strapMaterial || ''} onChange={(e) => updateMetadata('strapMaterial', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Case Size</Label>
                    <Input className="h-12 rounded-xl" value={formData.metadata.caseSize || ''} onChange={(e) => updateMetadata('caseSize', e.target.value)} placeholder="40mm, 42mm..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Color</Label>
                    <Input className="h-12 rounded-xl" value={formData.metadata.color || ''} onChange={(e) => updateMetadata('color', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 border rounded-2xl bg-zinc-50/50">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cost Price</Label>
                    <Input className="h-12 rounded-xl bg-white" type="number" step="0.01" value={formData.sizes[0].costPrice} onChange={(e) => updateSize(0, 'costPrice', Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Selling Price</Label>
                    <Input className="h-12 rounded-xl bg-white" type="number" step="0.01" value={formData.sizes[0].price} onChange={(e) => updateSize(0, 'price', Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Stock Units</Label>
                    <Input className="h-12 rounded-xl bg-white" type="number" value={formData.sizes[0].stock} onChange={(e) => updateSize(0, 'stock', Number(e.target.value))} />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 border rounded-2xl bg-background shadow-sm">
                <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="h-5 w-5 rounded-lg border-zinc-300 accent-rose-600" />
                <Label htmlFor="featured" className="cursor-pointer text-xs font-black uppercase tracking-widest">Featured Item</Label>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-2xl bg-background shadow-sm">
                <input type="checkbox" id="bestseller" checked={formData.bestseller} onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })} className="h-5 w-5 rounded-lg border-zinc-300 accent-rose-600" />
                <Label htmlFor="bestseller" className="cursor-pointer text-xs font-black uppercase tracking-widest">Bestseller</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tags (comma-separated)</Label>
              <Input className="h-12 rounded-xl" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="woody, luxury, leather..." />
            </div>

            <DialogFooter className="gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={closeDialog} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
              <Button type="submit" disabled={isSaving || isUploading} className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-zinc-900 hover:bg-zinc-800 shadow-2xl">
                {(isSaving || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formMode === 'create' ? 'Add to Catalog' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedPerfume?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => selectedPerfume && deleteMutation.mutate(selectedPerfume.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
