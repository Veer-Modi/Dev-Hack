import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Config = {
  id: string;
  slaMinutes: { critical: number; high: number; medium: number; low: number };
  verificationRules: { minConfirmations: number };
  notifications: { email: boolean; push: boolean; sms: boolean };
  preferences: { quietHours: { start: string; end: string }; timezone: string; dataRetentionDays: number };
};

const BASE_URL = import.meta.env.VITE_API_URL as string;

async function loadConfig(): Promise<Config> {
  const res = await fetch(`${BASE_URL}/api/admin/config`);
  if (!res.ok) throw new Error("Failed to load config");
  return res.json();
}

async function saveConfig(cfg: Config) {
  const res = await fetch(`${BASE_URL}/api/admin/config`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cfg),
  });
  if (!res.ok) throw new Error("Failed to save config");
  return res.json();
}

export default function Configuration() {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig().then(setCfg).finally(() => setLoading(false));
  }, []);

  function setSLA(key: keyof Config["slaMinutes"], value: number) {
    setCfg((c) => (c ? { ...c, slaMinutes: { ...c.slaMinutes, [key]: value } } : c));
  }
  function setMinConfirmations(value: number) {
    setCfg((c) => (c ? { ...c, verificationRules: { ...c.verificationRules, minConfirmations: value } } : c));
  }
  function setNotification(key: keyof Config["notifications"], value: boolean) {
    setCfg((c) => (c ? { ...c, notifications: { ...c.notifications, [key]: value } } : c));
  }
  function setQuiet(key: "start" | "end", value: string) {
    setCfg((c) => (c ? { ...c, preferences: { ...c.preferences, quietHours: { ...c.preferences.quietHours, [key]: value } } } : c));
  }
  function setTimezone(value: string) {
    setCfg((c) => (c ? { ...c, preferences: { ...c.preferences, timezone: value } } : c));
  }
  function setRetention(value: number) {
    setCfg((c) => (c ? { ...c, preferences: { ...c.preferences, dataRetentionDays: value } } : c));
  }

  async function onSave() {
    if (!cfg) return;
    setSaving(true);
    try {
      const saved = await saveConfig(cfg);
      setCfg(saved);
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    setLoading(true);
    try {
      const latest = await loadConfig();
      setCfg(latest);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout role="admin" userName="Emily Davis">
      <div className="p-6 space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Configuration</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onReset} disabled={loading || saving}>Reset</Button>
            <Button onClick={onSave} disabled={loading || saving}>Save Changes</Button>
          </div>
        </div>

        {loading && <div className="text-sm text-muted-foreground">Loading configuration...</div>}

        {cfg && (
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-lg font-medium">Incident Configuration</h2>
              {(["critical", "high", "medium", "low"] as const).map((sev) => (
                <div key={sev} className="grid grid-cols-2 gap-3 items-center">
                  <Label className="capitalize">{sev} response time (minutes)</Label>
                  <Input type="number" min={1} value={cfg.slaMinutes[sev]} onChange={(e) => setSLA(sev, Math.max(1, Number(e.target.value) || 0))} />
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium">Verification Rules</h2>
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label>Minimum confirmations</Label>
                <Input type="number" min={1} value={cfg.verificationRules.minConfirmations} onChange={(e) => setMinConfirmations(Math.max(1, Number(e.target.value) || 0))} />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium">Notifications</h2>
              {(["email", "push", "sms"] as const).map((k) => (
                <div key={k} className="flex items-center justify-between">
                  <Label className="capitalize">{k} alerts</Label>
                  <Switch checked={cfg.notifications[k]} onCheckedChange={(v) => setNotification(k, !!v)} />
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium">System Preferences</h2>
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label>Quiet hours (start)</Label>
                <Input type="time" value={cfg.preferences.quietHours.start} onChange={(e) => setQuiet("start", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label>Quiet hours (end)</Label>
                <Input type="time" value={cfg.preferences.quietHours.end} onChange={(e) => setQuiet("end", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label>Timezone</Label>
                <Input value={cfg.preferences.timezone} onChange={(e) => setTimezone(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label>Data retention (days)</Label>
                <Input type="number" min={7} value={cfg.preferences.dataRetentionDays} onChange={(e) => setRetention(Math.max(7, Number(e.target.value) || 7))} />
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}