import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Mail,
  Phone,
  Globe,
  Calendar,
  User as UserIcon,
  FolderOpen,
  ListTodo,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  getUserById,
  updateUser,
  deleteUser,
  type UpdateUserPayload,
} from '@/api/users.api';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    gender: '',
    birthDate: '',
    country: '',
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => getUserById(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditOpen(false);
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      navigate('/users', { replace: true });
    },
  });

  function openEdit() {
    if (!user) return;
    setFormData({
      username: user.username,
      email: user.email,
      phone: user.phone ?? '',
      gender: user.gender ?? '',
      birthDate: user.birthDate ?? '',
      country: user.country ?? '',
    });
    setFormError('');
    setEditOpen(true);
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    updateMutation.mutate({
      username: formData.username || undefined,
      email: formData.email || undefined,
      phone: formData.phone || null,
      gender: formData.gender || null,
      birthDate: formData.birthDate || null,
      country: formData.country || null,
    });
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading user...</div>;
  }

  if (!user) {
    return <div className="text-sm text-destructive">User not found.</div>;
  }

  const infoFields = [
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Phone', value: user.phone || '-', icon: Phone },
    { label: 'Gender', value: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '-', icon: UserIcon },
    { label: 'Birth Date', value: user.birthDate || '-', icon: Calendar },
    { label: 'Country', value: user.country || '-', icon: Globe },
    { label: 'Auth Method', value: user.googleId ? 'Google OAuth' : 'Email / Password', icon: UserIcon },
  ];

  return (
    <div className="max-w-5xl space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/users"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{user.username}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button variant="outline" size="sm" onClick={openEdit} className="flex-1 sm:flex-none h-9 text-xs">
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} className="flex-1 sm:flex-none h-9 text-xs">
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 sm:pb-2 p-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Projects</CardTitle>
            <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{user.stats.totalProjects}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 sm:pb-2 p-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tasks</CardTitle>
            <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{user.stats.totalTasks}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 sm:pb-2 p-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Orders</CardTitle>
            <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{user.stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 sm:pb-2 p-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Auth</CardTitle>
            <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {user.googleId ? (
              <Badge variant="secondary" className="text-[10px] uppercase">Google</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] uppercase">Email</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Info */}
      <Card className="shadow-sm">
        <CardHeader className="p-5 sm:p-6 border-b bg-zinc-50/50">
          <CardTitle className="text-sm font-black uppercase tracking-widest">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6">
            {infoFields.map((field) => (
              <div key={field.label} className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <field.icon className="h-3 w-3" />
                  {field.label}
                </div>
                <p className="text-sm font-bold text-zinc-900 break-all">{field.value}</p>
              </div>
            ))}
          </div>
          <Separator className="my-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground whitespace-nowrap">User ID:</span>
              <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded break-all">{user.id}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground whitespace-nowrap">Created:</span>
              <span className="text-zinc-900">{new Date(user.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground whitespace-nowrap">Last Updated:</span>
              <span className="text-zinc-900">{new Date(user.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects & Tasks */}
      <Card className="shadow-sm">
        <CardHeader className="p-5 sm:p-6 border-b bg-zinc-50/50">
          <CardTitle className="text-sm font-black uppercase tracking-widest">Projects & Tasks ({user.projects.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          {user.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 font-bold">No projects recorded yet.</p>
          ) : (
            <div className="space-y-6">
              {user.projects.map((project) => (
                <div key={project.id} className="border rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:border-zinc-300">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      {project.color && (
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                      )}
                      <h4 className="font-bold text-sm sm:text-base truncate">{project.name}</h4>
                    </div>
                    <Badge variant="secondary" className="w-fit text-[10px] uppercase">
                      {project.tasks.length} tasks
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">{project.description}</p>
                  )}
                  {project.tasks.length > 0 && (
                    <div className="rounded-xl border overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table className="min-w-[500px] sm:min-w-0">
                          <TableHeader className="bg-zinc-50/50">
                            <TableRow>
                              <TableHead className="text-[10px] font-black uppercase tracking-widest">Task</TableHead>
                              <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                              <TableHead className="text-[10px] font-black uppercase tracking-widest">Priority</TableHead>
                              <TableHead className="text-[10px] font-black uppercase tracking-widest">Due</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {project.tasks.map((task) => (
                              <TableRow key={task.id}>
                                <TableCell className="font-bold text-xs">{task.title}</TableCell>
                                <TableCell>
                                  <Badge
                                    className="text-[9px] uppercase h-5"
                                    variant={
                                      task.status === 'done'
                                        ? 'default'
                                        : task.status === 'in-progress'
                                        ? 'secondary'
                                        : 'outline'
                                    }
                                  >
                                    {task.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className="text-[9px] uppercase h-5"
                                    variant={
                                      task.priority === 'urgent' || task.priority === 'high'
                                        ? 'destructive'
                                        : 'outline'
                                    }
                                  >
                                    {task.priority}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-[10px] font-medium text-muted-foreground">
                                  {task.endDate || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders */}
      <Card className="shadow-sm">
        <CardHeader className="p-5 sm:p-6 border-b bg-zinc-50/50">
          <CardTitle className="text-sm font-black uppercase tracking-widest">Order History ({user.orders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          {user.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 font-bold">No orders placed yet.</p>
          ) : (
            <div className="space-y-6">
              {user.orders.map((order) => (
                <div key={order.id} className="border rounded-2xl p-4 sm:p-5 transition-all hover:border-zinc-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded">#{order.id.slice(0, 8).toUpperCase()}</code>
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="text-[9px] uppercase">
                        {order.status}
                      </Badge>
                      <span className="font-black text-sm">{Number(order.totalPrice).toLocaleString()} EGP</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 mb-4 text-[10px] font-bold">
                    <div><span className="text-muted-foreground uppercase tracking-widest block mb-0.5">Customer:</span> {order.fullName}</div>
                    <div><span className="text-muted-foreground uppercase tracking-widest block mb-0.5">Phone:</span> {order.phone}</div>
                    <div><span className="text-muted-foreground uppercase tracking-widest block mb-0.5">Method:</span> <span className="capitalize">{order.paymentMethod}</span></div>
                  </div>
                  
                  <div className="text-[10px] font-bold mb-4">
                    <span className="text-muted-foreground uppercase tracking-widest block mb-0.5">Address:</span>
                    <span className="text-zinc-600 line-clamp-1">{order.address}</span>
                  </div>

                  <div className="rounded-xl border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[400px] sm:min-w-0">
                        <TableHeader className="bg-zinc-50/30">
                          <TableRow>
                            <TableHead className="text-[9px] font-black uppercase tracking-widest">Item</TableHead>
                            <TableHead className="text-[9px] font-black uppercase tracking-widest">Brand</TableHead>
                            <TableHead className="text-[9px] font-black uppercase tracking-widest text-right">Price</TableHead>
                            <TableHead className="text-[9px] font-black uppercase tracking-widest text-center">Qty</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-bold text-xs">{item.name}</TableCell>
                              <TableCell className="text-[10px] font-black uppercase tracking-widest text-rose-600">{item.brand}</TableCell>
                              <TableCell className="text-right text-xs font-bold">{Number(item.price).toLocaleString()} EGP</TableCell>
                              <TableCell className="text-center text-xs font-bold">{item.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Editing {user.username}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Birth Date</Label>
                <Input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
              </div>
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
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{user.username}</strong>?
              This will also delete all their projects, tasks, and orders. This action cannot be undone.
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
    </div>
  );
}
