import { Outlet } from 'react-router-dom';
import { NavHeader } from './NavHeader';
import { WhatsAppButton } from './WhatsAppButton';

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <WhatsAppButton />
    </div>
  );
}
