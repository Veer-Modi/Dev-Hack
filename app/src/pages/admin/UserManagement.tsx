import { useState, useEffect } from 'react';
import { Search, MoreVertical, User, Shield, Radio, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockUsers } from '@/data/mockData';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/incident';

const roleConfig: Record<UserRole, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  citizen: { label: 'Citizen', icon: User, className: 'bg-info/10 text-info' },
  responder: { label: 'Responder', icon: Radio, className: 'bg-warning/10 text-warning' },
  admin: { label: 'Admin', icon: Shield, className: 'bg-primary/10 text-primary' },
};

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const displayedUsers = users.length ? users : mockUsers;

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {});
  }, []);

  const filteredUsers = displayedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function refresh() {
    const next = await getUsers();
    setUsers(next);
  }

  async function onAdd() {
    const name = window.prompt('Name');
    if (!name) return;
    const email = window.prompt('Email');
    if (!email) return;
    const role = (window.prompt('Role: citizen | responder | admin') || 'citizen') as UserRole;
    await createUser({ name, email, role });
    await refresh();
  }

  async function onEdit(id: string) {
    const name = window.prompt('New name (leave blank to skip)') || undefined;
    const email = window.prompt('New email (leave blank to skip)') || undefined;
    await updateUser(id, { ...(name ? { name } : {}), ...(email ? { email } : {}) });
    await refresh();
  }

  async function onChangeRole(id: string) {
    const role = window.prompt('New role: citizen | responder | admin') as UserRole | null;
    if (!role) return;
    await updateUser(id, { role });
    await refresh();
  }

  async function onToggleActive(id: string, isActive: boolean) {
    await updateUser(id, { isActive: !isActive });
    await refresh();
  }

  async function onDelete(id: string) {
    if (!window.confirm('Delete this user?')) return;
    await deleteUser(id);
    await refresh();
  }

  return (
    <DashboardLayout role="admin" userName="Emily Davis">
      <div className="p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions. {displayedUsers.length} total users.
            </p>
          </div>
          <Button onClick={onAdd}>Add User</Button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => {
                const role = roleConfig[user.role as UserRole] ?? roleConfig.citizen;
                const RoleIcon = role.icon;
                return (
                  <TableRow
                    key={user.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {user.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('gap-1.5', role.className)}>
                        <RoleIcon className="h-3 w-3" />
                        {role.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            user.isActive ? 'bg-success' : 'bg-muted-foreground'
                          )}
                        />
                        <span className="text-sm">{user.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(user.id)}>Edit User</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onChangeRole(user.id)}>Change Role</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onToggleActive(user.id, user.isActive)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(user.id)}>
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}