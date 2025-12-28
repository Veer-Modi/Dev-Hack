import { Link } from 'react-router-dom';
import { BarChart3, Users, AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/shared/MetricCard';
import { mockIncidents, mockUsers, mockActivityLogs } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const incidentTrendData = [
  { name: 'Mon', incidents: 12, resolved: 10 },
  { name: 'Tue', incidents: 19, resolved: 15 },
  { name: 'Wed', incidents: 15, resolved: 14 },
  { name: 'Thu', incidents: 22, resolved: 18 },
  { name: 'Fri', incidents: 18, resolved: 16 },
  { name: 'Sat', incidents: 8, resolved: 8 },
  { name: 'Sun', incidents: 6, resolved: 5 },
];

const incidentTypeData = [
  { name: 'Fire', value: 25, color: 'hsl(355, 78%, 56%)' },
  { name: 'Accident', value: 35, color: 'hsl(29, 87%, 60%)' },
  { name: 'Medical', value: 20, color: 'hsl(200, 80%, 50%)' },
  { name: 'Other', value: 20, color: 'hsl(210, 25%, 60%)' },
];

export default function AdminDashboard() {
  const totalIncidents = mockIncidents.length;
  const verifiedRate = Math.round(
    (mockIncidents.filter((i) => i.status !== 'unverified').length / totalIncidents) * 100
  );
  const activeUsers = mockUsers.filter((u) => u.isActive).length;
  const recentLogs = mockActivityLogs.slice(0, 4);

  return (
    <DashboardLayout role="admin" userName="Emily Davis">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and performance metrics.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/analytics">View Analytics</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/config">Configuration</Link>
            </Button>
          </div>
        </div>

        {/* KPI Widgets */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Incidents"
            value={totalIncidents}
            icon={AlertTriangle}
            trend={{ value: 12, isPositive: false }}
            description="vs last week"
          />
          <MetricCard
            title="Verification Rate"
            value={`${verifiedRate}%`}
            icon={CheckCircle}
            variant="success"
            trend={{ value: 5, isPositive: true }}
            description="improvement"
          />
          <MetricCard
            title="Active Users"
            value={activeUsers}
            icon={Users}
            variant="default"
            description="Online now"
          />
          <MetricCard
            title="Peak Activity"
            value="2-4 PM"
            icon={Clock}
            variant="warning"
            description="Most active hours"
          />
        </div>

        {/* Charts Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Incident Trend Chart */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Incident Trends</h2>
                <p className="text-sm text-muted-foreground">Weekly incident volume</p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incidentTrendData}>
                  <defs>
                    <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145, 63%, 42%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(145, 63%, 42%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="incidents"
                    stroke="hsl(200, 80%, 50%)"
                    fill="url(#incidentGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="hsl(145, 63%, 42%)"
                    fill="url(#resolvedGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incident Type Distribution */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4">
              <h2 className="font-semibold">Incident Types</h2>
              <p className="text-sm text-muted-foreground">Distribution by category</p>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incidentTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {incidentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {incidentTypeData.map((type) => (
                <div key={type.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-xs text-muted-foreground">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="font-semibold">Audit Log</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/audit">View All</Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {recentLogs.map((log, index) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {log.userName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{log.userName}</p>
                    <p className="text-sm text-muted-foreground">{log.action}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
