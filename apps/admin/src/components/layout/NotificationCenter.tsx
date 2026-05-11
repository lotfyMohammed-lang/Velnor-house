import { useEffect, useState } from 'react';
import { Bell, Check, ExternalLink, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/api/notifications.api';
import type { Notification } from '@/api/notifications.api';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter({ darkMode }: { darkMode: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative h-10 w-10 rounded-xl transition-all ${
            darkMode
              ? 'text-zinc-400 hover:bg-white/10 hover:text-white'
              : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef1b4f] text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`w-80 rounded-2xl p-0 ${
          darkMode ? 'border-white/10 bg-[#13203c] text-white' : 'border-zinc-200 bg-white'
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="p-0 text-base font-bold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-8 px-2 text-xs text-[#ef1b4f] hover:bg-[#ef1b4f]/10 hover:text-[#ef1b4f]"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className={darkMode ? 'bg-white/10' : 'bg-zinc-100'} />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                darkMode ? 'bg-white/5' : 'bg-zinc-50'
              }`}>
                <Bell className="h-6 w-6 opacity-20" />
              </div>
              <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative flex cursor-pointer gap-3 p-4 transition-colors ${
                    !notification.isRead
                      ? darkMode
                        ? 'bg-[#ef1b4f]/5 hover:bg-[#ef1b4f]/10'
                        : 'bg-zinc-50 hover:bg-zinc-100'
                      : darkMode
                        ? 'hover:bg-white/5'
                        : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    notification.type === 'new_order'
                      ? 'bg-[#ef1b4f]/20 text-[#ef1b4f]'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {notification.type === 'new_order' ? (
                      <Package className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold leading-tight ${
                        !notification.isRead ? (darkMode ? 'text-white' : 'text-zinc-900') : (darkMode ? 'text-zinc-400' : 'text-zinc-500')
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ef1b4f]" />
                      )}
                    </div>
                    <p className={`truncate text-xs leading-relaxed ${
                      darkMode ? 'text-zinc-400' : 'text-zinc-500'
                    }`}>
                      {notification.message}
                    </p>
                    <p className={`text-[10px] ${
                      darkMode ? 'text-zinc-500' : 'text-zinc-400'
                    }`}>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100"
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3 text-[#ef1b4f]" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
