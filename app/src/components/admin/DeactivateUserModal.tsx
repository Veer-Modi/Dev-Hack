import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { User } from '@/types/incident';

interface DeactivateUserModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userId: string) => void;
}

export function DeactivateUserModal({ user, open, onOpenChange, onConfirm }: DeactivateUserModalProps) {
  if (!user) return null;

  const handleConfirm = () => {
    onConfirm(user.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">
            {user.isActive ? 'Deactivate' : 'Activate'} User Account?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {user.isActive ? (
              <>
                This will deactivate the account for <strong>{user.name}</strong>. 
                They will no longer be able to access the platform until reactivated.
              </>
            ) : (
              <>
                This will reactivate the account for <strong>{user.name}</strong>. 
                They will regain access to the platform.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={user.isActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-success text-success-foreground hover:bg-success/90'}
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
