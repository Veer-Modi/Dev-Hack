import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

const BASE_URL = import.meta.env.VITE_API_URL as string;
const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#a855f7", "#f97316"];

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${url}`);
  return res.json();
}

function qs(params: Record<string, string | number | undefined>) {
  const u = new URL("/api/admin/analytics/timeseries", BASE_URL);
  Object.entries(params).forEach(([k, v]) => v != null && u.searchParams.set(k, String(v)));
  return u.toString();
}

export default function AdminAnalytics() {
  const [from, setFrom] = useState<string>(() => new Date(Date.now() - 7 * 86400000).toISOString());
  const [to, setTo] = useState<string>(() => new Date().toISOString());
  const [types, setTypes] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");

  const [series, setSeries] = useState<{ ts: string; count: number }[]>([]);
  const [severityDist, setSeverityDist] = useState<{ critical: number; high: number; medium: number; low: number }>({
    critical: 0, high: 0, medium: 0, low: 0
  });
  const [peaks, setPeaks] = useState<{ hour: number; count: number }[]>([]);

  async function load() {
    const params = { from, to, type: types || undefined, severity: severity || undefined };
    const [ts, sev, pk] = await Promise.all([
      fetchJSON<{ ts: string; count: number }[]>(qs(params)),
      fetchJSON<{ critical: number; high: number; medium: number; low: number }>(
        new URL("/api/admin/analytics/severity", BASE_URL).toString()
      ),
      fetchJSON<{ hour: number; count: number }[]>(
        new URL(`/api/admin/analytics/peaks?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, BASE_URL).toString()
      ),
    ]);
    setSeries(ts);
    setSeverityDist(sev);
    setPeaks(pk);
  }

  useEffect(() => { load().catch(() => {}); }, [from, to, types, severity]);

  const severityPie = useMemo(
    () => [
      { name: "Critical", value: severityDist.critical },
      { name: "High", value: severityDist.high },
      { name: "Medium", value: severityDist.medium },
      { name: "Low", value: severityDist.low },
    ],
    [severityDist]
  );

  return (
    <DashboardLayout role="admin" userName="Emily Davis">
      <div className="p-6 grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs text-muted-foreground">From</label>
              <input className="w-full rounded-md border border-border px-2 py-1 text-sm"
                     type="datetime-local"
                     value={from.slice(0,16)}
                     onChange={(e) => setFrom(new Date(e.target.value).toISOString())} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To</label>
              <input className="w-full rounded-md border border-border px-2 py-1 text-sm"
                     type="datetime-local"
                     value={to.slice(0,16)}
                     onChange={(e) => setTo(new Date(e.target.value).toISOString())} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Types (comma)</label>
              <input className="w-full rounded-md border border-border px-2 py-1 text-sm"
                     placeholder="fire,medical,accident"
                     value={types}
                     onChange={(e) => setTypes(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Severity (comma)</label>
              <input className="w-full rounded-md border border-border px-2 py-1 text-sm"
                     placeholder="critical,high,medium,low"
                     value={severity}
                     onChange={(e) => setSeverity(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Incident Volume Over Time</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ts" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(v) => new Date(v as string).toLocaleString()} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Severity Distribution</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityPie} dataKey="value" nameKey="name" outerRadius={100} label>
                  {severityPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Peak Activity Hours</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peaks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}