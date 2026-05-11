import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2, Loader2, Mail, Shield, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  getAdminById,
  updateAdmin,
  deleteAdmin,
  type UpdateAdminPayload,
} from '@/api/admins.api';
import { useAdminAuth } from '@/lib/auth';

export function AdminDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { admin: currentAdmin } = useAdminAuth();
  const isSelf = currentAdmin?.id === id;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });

  const { data: admin, isLoading } = useQuery({
    queryKey: ['admin-admin', id],
    queryFn: () => getAdminById(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateAdminPayload) => updateAdmin(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admin', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-admins'] });
      setEditOpen(false);
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdmin(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admins'] });
      navigate('/admins', { replace: true });
    },
  });

  function openEdit() {
    if (!admin) return;
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
    setFormError('');
    setEditOpen(true);
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    updateMutation.mutate({
      name: formData.name || undefined,
      email: formData.email || undefined,
      role: formData.role || undefined,
    });
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading admin...</div>;
  }

  if (!admin) {
    return <div className="text-sm text-destructive">Admin not found.</div>;
  }

  const infoFields = [
    { label: 'Email', value: admin.email, icon: Mail },
    { label: 'Role', value: admin.role, icon: Shield },
    { label: 'Created', value: new Date(admin.createdAt).toLocaleString(), icon: Calendar },
    { label: 'Last Updated', value: new Date(admin.updatedAt).toLocaleString(), icon: Calendar },
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admins"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{admin.name}</h2>
            {isSelf && <Badge variant="secondary">You</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{admin.email}</p>
        </div>
        <Button variant="outline" onClick={openEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
        {!isSelf && (
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      {/* Role Card */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Role</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={admin.role === 'super_admin' ? 'default' : 'outline'} className="text-sm">
              {admin.role}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Account Age</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((Date.now() - new Date(admin.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Admin Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {infoFields.map((field) => (
              <div key={field.label} className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <field.icon className="h-3 w-3" />
                  {field.label}
                </div>
                <p className="text-sm font-medium">{field.value}</p>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="text-sm">
            <span className="text-muted-foreground">Admin ID: </span>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{admin.id}</code>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>Editing {admin.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>
            )}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      {!isSelf && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Admin</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{admin.name}</strong>?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
