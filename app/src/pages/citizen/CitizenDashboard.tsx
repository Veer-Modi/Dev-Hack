
import { Link } from 'react-router-dom';
import { Plus, MapPin, FileText, Radio } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/shared/MetricCard';
import { IncidentCard } from '@/components/shared/IncidentCard';
import { mockIncidents } from '@/data/mockData';

export default function CitizenDashboard() {
  const nearbyIncidents = mockIncidents.filter((i) => i.status !== 'resolved').slice(0, 3);
  const myReports = mockIncidents.filter((i) => i.reportedBy.startsWith('citizen')).slice(0, 2);

  return (
    <DashboardLayout role="citizen" userName="John Smith">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome back, John</h1>
            <p className="text-muted-foreground">Monitor incidents and report emergencies in your area.</p>
          </div>
          <Button size="lg" variant="emergency" asChild>
            <Link to="/report" className="gap-2">
              <Plus className="h-5 w-5" />
              Report New Incident
            </Link>
          </Button>
        </div>

        {/* Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Nearby Incidents"
            value={nearbyIncidents.length}
            icon={MapPin}
            variant="warning"
            description="Within 5 miles"
          />
          <MetricCard
            title="My Active Reports"
            value={myReports.filter((r) => r.status !== 'resolved').length}
            icon={FileText}
            variant="default"
            description="Being processed"
          />
          <MetricCard
            title="Live Updates"
            value="Real-time"
            icon={Radio}
            variant="success"
            description="Feed connected"
          />
        </div>

        {/* Main content grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Nearby Incidents */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Nearby Incidents</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/feed">View all</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {nearbyIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  linkTo={`/incident/${incident.id}`}
                  showUpvotes={false}
                />
              ))}
            </div>
          </div>

          {/* My Reports */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Reports</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/my-reports">View all</Link>
              </Button>
            </div>
            {myReports.length > 0 ? (
              <div className="space-y-4">
                {myReports.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    linkTo={`/incident/${incident.id}`}
                    showUpvotes={false}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No reports yet</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/report">Create your first report</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Live Incident Feed', href: '/feed', icon: Radio },
              { label: 'Report Incident', href: '/report', icon: Plus },
              { label: 'My Reports', href: '/my-reports', icon: FileText },
              { label: 'Nearby Map', href: '/feed', icon: MapPin },
            ].map((action) => (
              <Link
                key={action.href + action.label}
                to={action.href}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
