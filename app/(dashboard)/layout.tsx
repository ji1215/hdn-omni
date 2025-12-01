'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import useStore from '@/store/useStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setMobileDrawerOpen, sidebarLayout } = useStore();

  // Vertical mode (default)
  if (sidebarLayout === 'vertical') {
    return (
      <div className="h-screen flex overflow-hidden bg-bg-main dark:bg-gray-900 transition-colors">
        {/* Sidebar - manages its own mobile drawer and backdrop */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setMobileDrawerOpen(true)} />
          <main className="flex-1 overflow-auto bg-bg-main dark:bg-gray-900 transition-colors">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Horizontal mode
  if (sidebarLayout === 'horizontal') {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-bg-main dark:bg-gray-900 transition-colors">
        {/* Header */}
        <Header onMenuClick={() => setMobileDrawerOpen(true)} />

        {/* Horizontal Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-bg-main dark:bg-gray-900 transition-colors">
          {children}
        </main>
      </div>
    );
  }

  // Two-column mode
  if (sidebarLayout === 'two-column') {
    return (
      <div className="h-screen flex overflow-hidden bg-bg-main dark:bg-gray-900 transition-colors">
        {/* Two-column Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setMobileDrawerOpen(true)} />
          <main className="flex-1 overflow-auto bg-bg-main dark:bg-gray-900 transition-colors">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Fallback (should never reach here)
  return null;
}