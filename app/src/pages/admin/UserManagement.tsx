import { useState, useEffect } from 'react';
import { Search, MoreVertical, User, Shield, Radio, Eye, Key, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getUsers, createUser, updateUser, deleteUser, resetUserPassword } from '@/lib/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { UserRole } from '@/types/incident';

const roleConfig: Record<UserRole, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  citizen: { label: 'Citizen', icon: User, className: 'bg-info/10 text-info' },
  responder: { label: 'Responder', icon: Radio, className: 'bg-warning/10 text-warning' },
  admin: { label: 'Admin', icon: Shield, className: 'bg-primary/10 text-primary' },
};

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'responder' as UserRole,
    password: '',
    generatePassword: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function onAdd() {
    setShowAddUserModal(true);
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Name and email are required');
      return;
    }
    
    if (!newUser.generatePassword && !newUser.password) {
      toast.error('Password is required when not auto-generating');
      return;
    }

    try {
      setIsLoading(true);
      const result = await createUser({ 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role,
        password: newUser.generatePassword ? undefined : newUser.password
      });
      
      if (result.password && newUser.generatePassword) {
        toast.success(`User created successfully! Generated password: ${result.password}`, {
          duration: 10000
        });
      } else {
        toast.success('User created successfully with custom password');
      }
      
      setShowAddUserModal(false);
      setNewUser({
        name: '',
        email: '',
        role: 'responder',
        password: '',
        generatePassword: true
      });
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  async function onEdit(id: string) {
    const name = window.prompt('New name (leave blank to skip)') || undefined;
    const email = window.prompt('New email (leave blank to skip)') || undefined;
    
    try {
      setIsLoading(true);
      await updateUser(id, { ...(name ? { name } : {}), ...(email ? { email } : {}) });
      toast.success('User updated successfully');
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  }

  async function onChangeRole(id: string) {
    const role = window.prompt('New role: citizen | responder | admin') as UserRole | null;
    if (!role) return;
    
    try {
      setIsLoading(true);
      await updateUser(id, { role });
      toast.success('User role updated successfully');
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  }

  async function onToggleActive(id: string, isActive: boolean) {
    try {
      setIsLoading(true);
      await updateUser(id, { isActive: !isActive });
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    
    try {
      setIsLoading(true);
      await deleteUser(id);
      toast.success('User deleted successfully');
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  }

  async function onResetPassword(id: string, userName: string, userEmail: string) {
    if (!window.confirm(`Reset password for ${userName} (${userEmail})? A new password will be sent to their email.`)) return;
    
    try {
      setIsLoading(true);
      await resetUserPassword(id);
      toast.success('Password reset successfully. New password sent to email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DashboardLayout role="admin" userName="Emily Davis">
      <div className="p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions. {users.length} total users.
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
                          <DropdownMenuItem onClick={() => onResetPassword(user.id, user.name, user.email)}>
                            <Key className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
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

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter user's full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">Citizen</SelectItem>
                  <SelectItem value="responder">Responder</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="generatePassword"
                    checked={newUser.generatePassword}
                    onChange={(e) => setNewUser({ ...newUser, generatePassword: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="generatePassword" className="text-sm">
                    Auto-generate password and send via email
                  </Label>
                </div>
                {!newUser.generatePassword && (
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter custom password"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddUserModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}