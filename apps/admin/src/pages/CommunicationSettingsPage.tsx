import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  Loader2,
  MessageSquare,
  Phone,
  Mail,
  Send,
  Layout,
  Bell,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getCommunicationSettings,
  updateCommunicationSettings,
  testTelegramConnection,
} from '@/api/settings.api';
import type { CommunicationSettings } from '@/api/settings.api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function CommunicationSettingsPage() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Controlled states for toggles
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappPosition, setWhatsappPosition] = useState<'left' | 'right'>('left');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [adminDashboardEnabled, setAdminDashboardEnabled] = useState(true);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['communication-settings'],
    queryFn: getCommunicationSettings,
  });

  // Sync state when data loads
  useEffect(() => {
    if (settings) {
      setWhatsappEnabled(settings.whatsappEnabled);
      setWhatsappPosition(settings.whatsappPosition);
      setEmailEnabled(settings.emailEnabled);
      setTelegramEnabled(settings.telegramEnabled);
      setAdminDashboardEnabled(settings.adminDashboardEnabled);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: updateCommunicationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-settings'] });
      toast.success('Communication settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    const payload: Partial<CommunicationSettings> = {
      whatsappEnabled,
      whatsappPosition,
      whatsappNumber: formData.get('whatsappNumber') as string,
      whatsappDefaultMessage: formData.get('whatsappDefaultMessage') as string,
      whatsappLabelAr: formData.get('whatsappLabelAr') as string,
      whatsappLabelEn: formData.get('whatsappLabelEn') as string,
      emailEnabled,
      notificationEmail: formData.get('notificationEmail') as string,
      telegramEnabled,
      telegramBotToken: formData.get('telegramBotToken') as string,
      telegramChatId: formData.get('telegramChatId') as string,
      adminDashboardEnabled,
    };

    try {
      await mutation.mutateAsync(payload);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTestTelegram() {
    setIsTesting(true);
    try {
      const res = await testTelegramConnection();
      toast.success(res.message);
    } catch (error: any) {
      toast.error(error.message || 'Telegram test failed');
    } finally {
      setIsTesting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Communication Settings</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage how you connect with customers and receive order notifications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* WhatsApp Configuration */}
        <Card className="overflow-hidden border-none shadow-lg rounded-2xl sm:rounded-3xl">
          <CardHeader className="bg-muted/30 pb-4 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg sm:text-xl font-black">WhatsApp Chat</CardTitle>
                  <CardDescription className="text-xs sm:text-sm truncate">Floating button for support.</CardDescription>
                </div>
              </div>
              <Switch
                checked={whatsappEnabled}
                onCheckedChange={setWhatsappEnabled}
                className="data-[state=checked]:bg-green-600 self-end xs:self-auto"
              />
            </div>
          </CardHeader>
          <CardContent className={`p-5 sm:p-8 space-y-6 transition-opacity duration-300 ${!whatsappEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">WhatsApp Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    className="pl-10 h-11 rounded-xl font-bold"
                    placeholder="e.g. 201507997888"
                    defaultValue={settings?.whatsappNumber}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Include country code without +</p>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Button Position</Label>
                <div className="flex items-center gap-4 rounded-xl border h-11 px-4 bg-background">
                  <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors", whatsappPosition === 'left' ? 'text-green-600' : 'text-muted-foreground')}>
                    Left
                  </span>
                  <Switch 
                    checked={whatsappPosition === 'right'} 
                    onCheckedChange={(checked) => setWhatsappPosition(checked ? 'right' : 'left')}
                    className="data-[state=checked]:bg-zinc-900"
                  />
                  <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors", whatsappPosition === 'right' ? 'text-green-600' : 'text-muted-foreground')}>
                    Right
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappDefaultMessage" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Default Chat Message</Label>
              <Textarea
                id="whatsappDefaultMessage"
                name="whatsappDefaultMessage"
                rows={2}
                className="rounded-xl resize-none font-medium text-sm"
                placeholder="Message that appears in customer's input field"
                defaultValue={settings?.whatsappDefaultMessage}
              />
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsappLabelAr" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Label Text (Arabic)</Label>
                <Input
                  id="whatsappLabelAr"
                  name="whatsappLabelAr"
                  dir="rtl"
                  placeholder="تواصل معنا"
                  defaultValue={settings?.whatsappLabelAr}
                  className="h-11 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappLabelEn" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Label Text (English)</Label>
                <Input
                  id="whatsappLabelEn"
                  name="whatsappLabelEn"
                  placeholder="Chat with us"
                  defaultValue={settings?.whatsappLabelEn}
                  className="h-11 rounded-xl font-bold"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card className="overflow-hidden border-none shadow-lg rounded-2xl sm:rounded-3xl">
          <CardHeader className="bg-muted/30 pb-4 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg sm:text-xl font-black">Email Notifications</CardTitle>
                  <CardDescription className="text-xs sm:text-sm truncate">Order summaries via email.</CardDescription>
                </div>
              </div>
              <Switch
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
                className="data-[state=checked]:bg-blue-600 self-end xs:self-auto"
              />
            </div>
          </CardHeader>
          <CardContent className={`p-5 sm:p-8 transition-opacity duration-300 ${!emailEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="space-y-2">
              <Label htmlFor="notificationEmail" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Notification Email</Label>
              <Input
                id="notificationEmail"
                name="notificationEmail"
                type="email"
                placeholder="e.g. orders@velnor.com"
                defaultValue={settings?.notificationEmail}
                className="max-w-md h-11 rounded-xl font-bold"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                This email will receive a copy of every new order confirmation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Telegram Notifications */}
        <Card className="overflow-hidden border-none shadow-lg rounded-2xl sm:rounded-3xl">
          <CardHeader className="bg-muted/30 pb-4 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                  <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg sm:text-xl font-black">Telegram Notifications</CardTitle>
                  <CardDescription className="text-xs sm:text-sm truncate">Instant alerts via bot.</CardDescription>
                </div>
              </div>
              <Switch
                checked={telegramEnabled}
                onCheckedChange={setTelegramEnabled}
                className="data-[state=checked]:bg-sky-600 self-end xs:self-auto"
              />
            </div>
          </CardHeader>
          <CardContent className={`p-5 sm:p-8 space-y-6 transition-opacity duration-300 ${!telegramEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telegramBotToken" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bot Token</Label>
                <Input
                  id="telegramBotToken"
                  name="telegramBotToken"
                  type="password"
                  placeholder="e.g. 123456789:ABC..."
                  defaultValue={settings?.telegramBotToken}
                  className="h-11 rounded-xl font-mono text-[10px] sm:text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegramChatId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Chat ID</Label>
                <Input
                  id="telegramChatId"
                  name="telegramChatId"
                  placeholder="e.g. 987654321"
                  defaultValue={settings?.telegramChatId}
                  className="h-11 rounded-xl font-mono text-[10px] sm:text-xs"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-sky-50 p-4 sm:p-5 border border-sky-100 dark:bg-sky-900/10 dark:border-sky-900/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-sky-600 shrink-0" />
                <p className="text-xs sm:text-sm font-bold text-sky-800 dark:text-sky-300">
                  Verify your connection after saving changes.
                </p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleTestTelegram}
                disabled={isTesting || !telegramEnabled}
                className="w-full sm:w-auto h-9 sm:h-10 rounded-xl bg-white hover:bg-sky-50 border-sky-200 text-sky-700 font-bold dark:bg-zinc-950 dark:hover:bg-sky-900/20"
              >
                {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Dashboard Notifications */}
        <Card className="overflow-hidden border-none shadow-lg rounded-2xl sm:rounded-3xl">
          <CardHeader className="bg-muted/30 pb-4 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                  <Layout className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg sm:text-xl font-black">Admin Dashboard</CardTitle>
                  <CardDescription className="text-xs sm:text-sm truncate">In-app alerts and badges.</CardDescription>
                </div>
              </div>
              <Switch
                checked={adminDashboardEnabled}
                onCheckedChange={setAdminDashboardEnabled}
                className="data-[state=checked]:bg-rose-600 self-end xs:self-auto"
              />
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-8">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed">
              {adminDashboardEnabled 
                ? "The notification bell in the sidebar will show alerts for new orders in real-time."
                : "New orders will not appear in the notification center. You must manually check the Orders page."}
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={isSaving || mutation.isPending}
            className="w-full sm:w-auto px-10 h-12 sm:h-14 rounded-2xl bg-[#ef1b4f] hover:bg-[#d11744] text-white font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 transition-all hover:shadow-rose-500/30 active:scale-[0.98]"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
