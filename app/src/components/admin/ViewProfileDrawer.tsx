import { User, Mail, Calendar, Shield, Activity } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { User as UserType, UserRole } from '@/types/incident';

interface ViewProfileDrawerProps {
  user: UserType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  citizen: { label: 'Citizen', className: 'bg-info/10 text-info' },
  responder: { label: 'Responder', className: 'bg-warning/10 text-warning' },
  admin: { label: 'Admin', className: 'bg-primary/10 text-primary' },
};

export function ViewProfileDrawer({ user, open, onOpenChange }: ViewProfileDrawerProps) {
  if (!user) return null;

  const role = roleConfig[user.role];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>User Profile</SheetTitle>
          <SheetDescription>View detailed user information</SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <Badge variant="outline" className={cn('mt-1', role.className)}>
                <Shield className="mr-1 h-3 w-3" />
                {role.label}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">{format(new Date(user.createdAt), 'MMMM d, yyyy')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      user.isActive ? 'bg-success' : 'bg-muted-foreground'
                    )}
                  />
                  <span className="font-medium">{user.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
