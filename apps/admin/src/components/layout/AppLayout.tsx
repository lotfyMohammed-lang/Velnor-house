import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('admin_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('admin_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div
      className={`flex h-screen flex-col lg:flex-row overflow-hidden transition-colors duration-300 ${
        darkMode ? 'dark bg-[#081120] text-white' : 'bg-[#f5f7fb] text-zinc-900'
      }`}
    >
      <Sidebar
        collapsed={collapsed}
        darkMode={darkMode}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
      />

      <main className="flex-1 overflow-y-auto">
        <div
          className={`min-h-full p-4 sm:p-6 md:p-8 ${
            darkMode
              ? 'bg-[linear-gradient(180deg,#081120_0%,#0d1830_100%)]'
              : 'bg-[linear-gradient(180deg,#f5f7fb_0%,#eef2f8_100%)]'
          }`}
        >
          <div
            className={`min-h-[calc(100vh-3rem)] rounded-[20px] sm:rounded-[28px] border p-4 sm:p-6 md:p-8 shadow-sm transition-colors duration-300 ${
              darkMode
                ? 'border-white/5 bg-[#0d1830]/40 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.25)]'
                : 'border-white bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]'
            }`}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}