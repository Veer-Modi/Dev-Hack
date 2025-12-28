import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/incident';
import {
  LayoutDashboard,
  AlertTriangle,
  Map,
  FileText,
  Activity,
  Users,
  BarChart3,
  Settings,
  ClipboardList,
  Radio,
  Shield,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const responderNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/responder', icon: LayoutDashboard },
  { label: 'Priority Queue', href: '/responder/queue', icon: AlertTriangle },
  { label: 'Live Map', href: '/responder/map', icon: Map },
  { label: 'Incident Management', href: '/responder/incidents', icon: FileText },
  { label: 'Activity Logs', href: '/responder/logs', icon: Activity },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'User Management', href: '/admin/users', icon: Users },
  { label: 'Configuration', href: '/admin/config', icon: Settings },
  { label: 'Audit Logs', href: '/admin/audit', icon: ClipboardList },
];

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navItems = role === 'admin' ? adminNavItems : responderNavItems;

  const roleIcon = role === 'admin' ? Shield : Radio;
  const RoleIcon = roleIcon;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile close button */}
          <div className="flex items-center justify-between border-b border-sidebar-border p-4 md:hidden">
            <div className="flex items-center gap-2 text-sidebar-foreground">
              <RoleIcon className="h-5 w-5" />
              <span className="font-medium capitalize">{role} Portal</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-sidebar-foreground hover:bg-sidebar-accent">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Role indicator - desktop */}
          <div className="hidden border-b border-sidebar-border p-4 md:block">
            <div className="flex items-center gap-2 text-sidebar-foreground">
              <RoleIcon className="h-5 w-5" />
              <span className="font-medium capitalize">{role} Portal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse-slow rounded-full bg-success" />
              <span className="text-xs text-sidebar-foreground/70">System Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
