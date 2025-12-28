import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import type { UserRole } from '@/types/incident';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName?: string;
}

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showSidebar = role === 'responder' || role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        userRole={role}
        userName={userName}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        showMenu={showSidebar}
      />
      <div className="flex">
        {showSidebar && (
          <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <main
          className={`flex-1 transition-all duration-300 ${showSidebar ? 'md:ml-64' : ''}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
