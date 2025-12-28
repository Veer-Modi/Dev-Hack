import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  variant?: 'default' | 'critical' | 'warning' | 'success';
  className?: string;
}

const variantStyles = {
  default: 'bg-primary/10 text-primary',
  critical: 'bg-critical/10 text-critical',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  variant = 'default',
  className,
}: MetricCardProps) {
  return (
    <div className={cn('metric-card animate-fade-in', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', variantStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {(trend || description) && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {trend && (
            <span
              className={cn(
                'flex items-center gap-1 font-medium',
                trend.isPositive ? 'text-success' : 'text-critical'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
          {description && <span className="text-muted-foreground">{description}</span>}
        </div>
      )}
    </div>
  );
}
