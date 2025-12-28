import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle, Activity } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/shared/MetricCard';
import { IncidentCard } from '@/components/shared/IncidentCard';
import { mockIncidents, mockActivityLogs } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';

export default function ResponderDashboard() {
  const criticalIncidents = mockIncidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved');
  const inProgressIncidents = mockIncidents.filter((i) => i.status === 'in-progress');
  const recentLogs = mockActivityLogs.slice(0, 5);

  return (
    <DashboardLayout role="responder" userName="Sarah Johnson">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Responder Dashboard</h1>
          <p className="text-muted-foreground">Monitor and respond to active incidents.</p>
        </div>

        {/* Alert Banner */}
        {criticalIncidents.length > 0 && (
          <div className="mb-6 flex items-center gap-4 rounded-lg border border-critical/30 bg-critical/10 p-4 animate-fade-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-critical/20">
              <AlertTriangle className="h-5 w-5 text-critical" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-critical">
                {criticalIncidents.length} Critical Incident{criticalIncidents.length > 1 ? 's' : ''} Require Immediate Attention
              </p>
              <p className="text-sm text-critical/80">
                Priority response needed for unassigned critical incidents.
              </p>
            </div>
            <Button variant="emergency" size="sm" asChild>
              <Link to="/responder/queue">View Queue</Link>
            </Button>
          </div>
        )}

        {/* Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Critical Incidents"
            value={criticalIncidents.length}
            icon={AlertTriangle}
            variant="critical"
            description="Needs attention"
          />
          <MetricCard
            title="In Progress"
            value={inProgressIncidents.length}
            icon={Clock}
            variant="warning"
            description="Currently handling"
          />
          <MetricCard
            title="Resolved Today"
            value="12"
            icon={CheckCircle}
            variant="success"
            trend={{ value: 8, isPositive: true }}
            description="vs yesterday"
          />
          <MetricCard
            title="Avg Response Time"
            value="4.2 min"
            icon={Activity}
            variant="default"
            trend={{ value: 12, isPositive: true }}
            description="faster"
          />
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Priority Queue */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="font-semibold">Priority Incident Queue</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/responder/queue">View All</Link>
                </Button>
              </div>
              <div className="divide-y divide-border">
                {mockIncidents
                  .filter((i) => i.status !== 'resolved')
                  .sort((a, b) => {
                    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                    return severityOrder[a.severity] - severityOrder[b.severity];
                  })
                  .slice(0, 4)
                  .map((incident, index) => (
                    <div key={incident.id} className="p-4 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      <IncidentCard
                        incident={incident}
                        linkTo={`/responder/incidents/${incident.id}`}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-semibold">Recent Activity</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/responder/logs">View All</Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recentLogs.map((log, index) => (
                <div
                  key={log.id}
                  className="p-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {log.userName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{log.userName}</span>{' '}
                        <span className="text-muted-foreground">{log.action}</span>
                      </p>
                      {log.details && (
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">
                          {log.details}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
