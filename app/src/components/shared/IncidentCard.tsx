import { Link } from 'react-router-dom';
import { MapPin, Clock, ThumbsUp, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Incident } from '@/types/incident';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface IncidentCardProps {
  incident: Incident;
  linkTo?: string;
  showStatus?: boolean;
  showUpvotes?: boolean;
  className?: string;
}

const incidentTypeIcons: Record<string, string> = {
  fire: '🔥',
  accident: '🚗',
  medical: '🏥',
  crime: '🚨',
  flood: '🌊',
  earthquake: '🌍',
  other: '⚠️',
};

export function IncidentCard({
  incident,
  linkTo,
  showStatus = true,
  showUpvotes = true,
  className,
}: IncidentCardProps) {
  const CardWrapper = linkTo ? Link : 'div';
  const timeAgo = formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true });

  return (
    <CardWrapper
      to={linkTo || '#'}
      className={cn(
        'incident-card group block',
        linkTo && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
          {incidentTypeIcons[incident.type.toLowerCase()] || incidentTypeIcons.other}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-foreground">{incident.title}</h3>
              <p className="mt-0.5 text-sm capitalize text-muted-foreground">{incident.type}</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <SeverityBadge severity={incident.severity} />
              {linkTo && (
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              )}
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {incident.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {incident.location.address}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo}
            </span>
            {showUpvotes && incident.upvotes > 0 && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                {incident.upvotes} confirmations
              </span>
            )}
            {showStatus && <StatusBadge status={incident.status} />}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
