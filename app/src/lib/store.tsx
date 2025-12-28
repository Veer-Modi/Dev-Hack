import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Incident, IncidentStatus } from "@/types/incident";
import { mockIncidents } from "@/data/mockData";
import { confirmIncident as apiConfirm, createIncident as apiCreate, getIncidents, updateIncidentStatus as apiUpdateStatus, escalateIncident as apiEscalate } from '@/lib/api';
import { getSocket } from "@/lib/realtime";

type Store = {
  incidents: Incident[];
  createIncident: (input: Omit<Incident, "id" | "reportedAt" | "updatedAt" | "upvotes">) => Incident;
  confirmIncident: (id: string) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  updateIncident: (id: string, updates: Partial<Pick<Incident, 'title' | 'description' | 'severity' | 'location' | 'assignedTo'>>) => void;
  escalateIncident: (id: string) => void;
};

const StoreContext = createContext<Store | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [incidents, setIncidents] = useState<Incident[]>(() => [...mockIncidents]);

  useEffect(() => {
    // Initial load from API, fallback to mock if fails
    getIncidents().then((data) => {
      if (Array.isArray(data)) setIncidents(data as Incident[]);
    }).catch(() => {
      // keep mock data
    });

    // Socket subscriptions
    const socket = getSocket();
    const onNew = (incident: Incident) => setIncidents((prev) => [incident, ...prev.filter(i => i.id !== (incident as any)._id && i.id !== (incident as any).id)]);
    const onStatus = ({ id, status, updatedAt }: { id: string; status: IncidentStatus; updatedAt: string }) =>
      setIncidents((prev) => prev.map((i) => (i.id === id || (i as any)._id === id ? { ...i, status, updatedAt: new Date(updatedAt) as any } : i)));
    const onConfirm = ({ id, upvotes, updatedAt }: { id: string; upvotes: number; updatedAt: string }) =>
      setIncidents((prev) => prev.map((i) => (i.id === id || (i as any)._id === id ? { ...i, upvotes, updatedAt: new Date(updatedAt) as any } : i)));
    const onUpdate = (incident: Incident) =>
      setIncidents((prev) => prev.map((i) => (i.id === (incident as any).id || (i as any)._id === (incident as any)._id ? { ...i, ...incident } : i)));

    socket.on('incident:new', onNew as any);
    socket.on('incident:status', onStatus as any);
    socket.on('incident:confirm', onConfirm as any);
    socket.on('incident:update', onUpdate as any);

    return () => {
      socket.off('incident:new', onNew as any);
      socket.off('incident:status', onStatus as any);
      socket.off('incident:confirm', onConfirm as any);
      socket.off('incident:update', onUpdate as any);
    };
  }, []);

  const createIncident: Store["createIncident"] = (input) => {
    const optimistic: Incident = {
      ...input,
      id: (globalThis.crypto?.randomUUID?.() ?? String(Date.now())),
      reportedAt: new Date(),
      updatedAt: new Date(),
      upvotes: 0,
    };
    setIncidents((prev) => [optimistic, ...prev]);
    // Fire and forget; socket will broadcast the canonical one
    apiCreate({
      type: input.type,
      title: input.title,
      description: input.description,
      severity: input.severity,
      location: input.location,
      mediaUrls: input.mediaUrls,
      reportedBy: input.reportedBy ?? 'citizen',
    }).catch(() => {
      // rollback on failure
      setIncidents((prev) => prev.filter((i) => i.id !== optimistic.id));
    });
    return optimistic;
  };

  const confirmIncident: Store["confirmIncident"] = (id) => {
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, upvotes: i.upvotes + 1, updatedAt: new Date() } : i)));
    apiConfirm(id).catch(() => {
      // rollback on failure
      setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, upvotes: Math.max(0, i.upvotes - 1) } : i)));
    });
  };

  const updateIncidentStatus: Store["updateIncidentStatus"] = (id, status) => {
    const prevSnapshot = incidents;
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status, updatedAt: new Date() } : i)));
    apiUpdateStatus(id, status).catch(() => setIncidents(prevSnapshot));
  };

  const updateIncident: Store["updateIncident"] = (id, updates) => {
    const prevSnapshot = incidents;
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date() } : i)));
    import("@/lib/api").then(({ updateIncident }) => updateIncident(id, updates as any)).catch(() => setIncidents(prevSnapshot));
  };

  const escalateIncident: Store["escalateIncident"] = (id) => {
    apiEscalate(id).catch((error) => {
      console.error('Failed to escalate incident:', error);
    });
  };

  const value = useMemo(
    () => ({ incidents, createIncident, confirmIncident, updateIncidentStatus, updateIncident, escalateIncident }),
    [incidents]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};
