import { useMemo, useState } from 'react';
import { MapPin, X, CheckCircle, Clock, Navigation } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Incident } from '@/types/incident';
import { cn } from '@/lib/utils';
import LeafletMap from '@/components/map/LeafletMap';
import { useStore } from '@/lib/store';

const severityColors = {
  critical: 'bg-critical',
  high: 'bg-warning',
  medium: 'bg-yellow-500',
  low: 'bg-success',
};

export default function LiveMap() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [radiusMeters, setRadiusMeters] = useState(5000);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const { incidents: storeIncidents, updateIncidentStatus } = useStore();

  const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  };

  const incidents = useMemo(() => {
    const base = storeIncidents.filter((i) => i.status !== 'resolved');
    if (!nearbyOnly || !center) return base;
    return base.filter((i) => haversine(center, i.location) <= radiusMeters);
  }, [storeIncidents, nearbyOnly, center, radiusMeters]);

  return (
    <DashboardLayout role="responder" userName="Sarah Johnson">
      <div className="relative h-[calc(100vh-4rem)]">
        {/* Map Container */}
        <div className="h-full w-full bg-muted relative">
          <LeafletMap
            centerOnUser
            userRadiusMeters={nearbyOnly ? radiusMeters : 0}
            onUserLocation={(pos) => { if (!center) setCenter(pos); }}
            selectableMarker={nearbyOnly}
            onSelectPosition={(pos) => setCenter(pos)}
            incidents={incidents.map(i => ({ id: i.id, title: i.title, severity: i.severity, location: i.location }))}
            onMarkerClick={(id) => {
              const match = incidents.find(i => i.id === id);
              if (match) setSelectedIncident(match);
            }}
            className="h-full w-full"
          />

          {/* Map label */}
          <div className="absolute left-4 top-4 z-10 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
            <p className="text-sm font-medium">Live Incident Map</p>
            <p className="text-xs text-muted-foreground">{incidents.length} active incidents</p>
          </div>

          {/* Legend & Nearby Controls */}
          <div className="absolute top-4 right-4 z-[2000] pointer-events-auto rounded-lg border border-border bg-card p-4 shadow-sm">
            <p className="mb-2 text-xs font-medium text-muted-foreground">SEVERITY</p>
            <div className="space-y-2">
              {(['critical', 'high', 'medium', 'low'] as const).map((severity) => (
                <div key={severity} className="flex items-center gap-2">
                  <div className={cn('h-3 w-3 rounded-full', severityColors[severity])} />
                  <span className="text-xs capitalize">{severity}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-medium">Nearby only</label>
                <Button size="sm" variant={nearbyOnly ? 'default' : 'outline'} onClick={() => setNearbyOnly(v => !v)}>
                  {nearbyOnly ? 'On' : 'Off'}
                </Button>
              </div>
              <div className="mt-2">
                <label className="text-xs text-muted-foreground">Radius (meters)</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Math.max(100, Number(e.target.value) || 0))}
                  min={100}
                  step={100}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Click map to set center when Nearby is On.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {selectedIncident && (
          <div className="absolute right-0 top-0 z-30 h-full w-full max-w-md border-l border-border bg-card shadow-lg animate-slide-in-right">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border p-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <SeverityBadge severity={selectedIncident.severity} />
                    <StatusBadge status={selectedIncident.status} />
                  </div>
                  <h2 className="text-lg font-semibold">{selectedIncident.title}</h2>
                  <p className="text-sm capitalize text-muted-foreground">
                    {selectedIncident.type}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedIncident(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Location */}
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">LOCATION</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{selectedIncident.location.address}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">DESCRIPTION</h3>
                    <p className="text-sm">{selectedIncident.description}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Confirmations</p>
                      <p className="text-lg font-semibold">{selectedIncident.upvotes}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Time Elapsed</p>
                      <p className="text-lg font-semibold">15 min</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-border p-4">
                <div className="grid grid-cols-2 gap-3">
                  {selectedIncident.status === 'unverified' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => updateIncidentStatus(selectedIncident.id, 'verified')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify
                    </Button>
                  )}
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => updateIncidentStatus(selectedIncident.id, 'in-progress')}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Respond
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full col-span-2"
                    onClick={() => updateIncidentStatus(selectedIncident.id, 'resolved')}
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
