import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/incident';

interface NavbarProps {
  userRole?: UserRole;
  userName?: string;
  onMenuToggle?: () => void;
  showMenu?: boolean;
}

const roleLabels: Record<UserRole, string> = {
  citizen: 'Citizen',
  responder: 'Responder',
  admin: 'Administrator',
};

const roleColors: Record<UserRole, string> = {
  citizen: 'bg-info/10 text-info',
  responder: 'bg-warning/10 text-warning',
  admin: 'bg-primary/10 text-primary',
};

export function Navbar({ userRole, userName, onMenuToggle, showMenu }: NavbarProps) {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [notifications] = useState(3);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {showMenu && (
            <Button variant="ghost" size="icon" onClick={onMenuToggle} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="hidden font-semibold text-foreground sm:inline-block">
              RapidResponse
            </span>
          </Link>
        </div>

        {/* Center section - Role indicator */}
        {userRole && (
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="outline" className={cn('font-medium', roleColors[userRole])}>
              {roleLabels[userRole]}
            </Badge>
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-2">
          {userRole ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-critical text-[10px] font-bold text-critical-foreground">
                    {notifications}
                  </span>
                )}
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden text-sm font-medium md:inline-block">
                      {userName || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{userName || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{roleLabels[userRole]}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <Link to="/">Logout</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/report">Report Incident</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
