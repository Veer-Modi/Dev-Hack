import { cn } from '@/lib/utils';
import type { Severity } from '@/types/incident';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
  showIcon?: boolean;
  className?: string;
}

const severityConfig: Record<Severity, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  critical: {
    label: 'Critical',
    className: 'severity-critical',
    icon: AlertTriangle,
  },
  high: {
    label: 'High',
    className: 'severity-high',
    icon: AlertCircle,
  },
  medium: {
    label: 'Medium',
    className: 'severity-medium',
    icon: Info,
  },
  low: {
    label: 'Low',
    className: 'severity-low',
    icon: CheckCircle,
  },
};

export function SeverityBadge({ severity, showIcon = true, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <span className={cn('severity-badge', config.className, className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
