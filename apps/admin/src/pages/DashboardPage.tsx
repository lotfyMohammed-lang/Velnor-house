import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  ShoppingBag,
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getDashboardStats } from '@/api/dashboard.api';

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

export function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading dashboard...</div>;
  }

  const cards = [
    { title: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users },
    { title: 'New Users (7d)', value: stats?.newUsersLast7Days ?? 0, icon: TrendingUp },
    { title: 'Total Products', value: stats?.totalPerfumes ?? 0, icon: ShoppingBag },
    { title: 'Total Orders', value: stats?.totalOrders ?? 0, icon: Package },
    { title: 'Pending Orders', value: stats?.pendingOrders ?? 0, icon: Clock },
    {
      title: 'Return Expenses',
      value: `${(stats?.returnExpenses ?? 0).toLocaleString()} EGP`,
      icon: RotateCcw,
    },
    {
      title: 'Revenue',
      value: `${(stats?.totalRevenue ?? 0).toLocaleString()} EGP`,
      icon: DollarSign,
    },
  ];

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold tracking-tight">Dashboard</h2>
      <p className="mb-6 text-sm text-muted-foreground">Overview of your store and users.</p>

      <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link to="/orders" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="overflow-x-auto">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <Table className="min-w-[500px] sm:min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Link
                            to={`/orders/${order.id}`}
                            className="text-xs font-mono text-primary hover:underline"
                          >
                            #{order.id.slice(0, 8).toUpperCase()}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">{order.fullName}</TableCell>
                        <TableCell className="text-sm font-medium">
                          {Number(order.totalPrice).toLocaleString()} EGP
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(order.status)} className="text-xs">
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="px-6 text-sm text-muted-foreground">No orders yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Users</CardTitle>
            <Link to="/users" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="overflow-x-auto">
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                <Table className="min-w-[400px] sm:min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Link
                            to={`/users/${user.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {user.username}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="px-6 text-sm text-muted-foreground">No users yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}