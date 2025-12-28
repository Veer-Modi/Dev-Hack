import { cn } from '@/lib/utils';
import type { IncidentStatus } from '@/types/incident';
import { Circle, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: IncidentStatus;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<IncidentStatus, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  unverified: {
    label: 'Unverified',
    className: 'status-unverified',
    icon: Circle,
  },
  'partially-verified': {
    label: 'Partially Verified',
    className: 'status-unverified',
    icon: AlertCircle,
  },
  verified: {
    label: 'Verified',
    className: 'status-verified',
    icon: CheckCircle,
  },
  'in-progress': {
    label: 'In Progress',
    className: 'status-in-progress',
    icon: Loader2,
  },
  resolved: {
    label: 'Resolved',
    className: 'status-resolved',
    icon: CheckCircle,
  },
};

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn('status-badge', config.className, className)}>
      {showIcon && <Icon className={cn('h-3 w-3', status === 'in-progress' && 'animate-spin')} />}
      {config.label}
    </span>
  );
}
