import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getActivity } from '@/lib/api';

type Activity = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  incidentId?: string;
  timestamp: string;
  details?: string;
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivity()
      .then((res) => setLogs(res))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="admin" userName="Emily Davis">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">{logs.length} events</p>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {loading && <div className="p-4 text-sm text-muted-foreground">Loading...</div>}
            {!loading && logs.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">No activity found.</div>
            )}
            {logs.map((l) => (
              <div key={l.id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{l.userName}</span> {l.action}
                    {l.incidentId ? (
                      <>
                        {' '}for incident <span className="font-mono text-xs">{l.incidentId}</span>
                      </>
                    ) : null}
                  </p>
                  {l.details && (
                    <p className="text-xs text-muted-foreground mt-1">{l.details}</p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(l.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
