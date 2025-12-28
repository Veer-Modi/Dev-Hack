import { useState } from 'react';
import { Radio, Filter, MapPin, List, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IncidentCard } from '@/components/shared/IncidentCard';
import { mockIncidents, incidentTypes } from '@/data/mockData';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'map';

export default function LiveFeed() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [distanceFilter, setDistanceFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredIncidents = mockIncidents.filter((incident) => {
    if (typeFilter !== 'all' && incident.type.toLowerCase() !== typeFilter) {
      return false;
    }
    return true;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <DashboardLayout role="citizen" userName="John Smith">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Radio className="h-5 w-5 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Live Incident Feed</h1>
              <p className="text-sm text-muted-foreground">
                Real-time updates • {filteredIncidents.length} incidents
              </p>
            </div>
            <div className="ml-2 h-2 w-2 animate-pulse-slow rounded-full bg-success" />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
            <div className="flex rounded-lg border border-border p-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="px-3"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Incident Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Types</SelectItem>
              {incidentTypes.map((type) => (
                <SelectItem key={type} value={type.toLowerCase()}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={distanceFilter} onValueChange={setDistanceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Distance" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Any Distance</SelectItem>
              <SelectItem value="1">Within 1 mile</SelectItem>
              <SelectItem value="5">Within 5 miles</SelectItem>
              <SelectItem value="10">Within 10 miles</SelectItem>
              <SelectItem value="25">Within 25 miles</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search incidents..."
            className="max-w-xs"
          />
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredIncidents.map((incident, index) => (
              <div
                key={incident.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <IncidentCard
                  incident={incident}
                  linkTo={`/incident/${incident.id}`}
                />
              </div>
            ))}
            
            {filteredIncidents.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16">
                <Radio className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">No incidents found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters to see more results.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border bg-muted">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <MapPin className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">Map View</h3>
                <p className="text-muted-foreground">
                  Interactive map with incident markers
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
