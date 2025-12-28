import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Incident, IncidentStatus } from "@/types/incident";
import { mockIncidents } from "@/data/mockData";
import { checkHealth, confirmIncident as apiConfirm, createIncident as apiCreate, getIncidents, updateIncident as apiUpdate, updateIncidentStatus as apiUpdateStatus } from "@/lib/api";
import { getSocket } from "@/lib/realtime";

type Store = {
  incidents: Incident[];
  createIncident: (input: Omit<Incident, "id" | "reportedAt" | "updatedAt" | "upvotes">) => Incident;
  confirmIncident: (id: string) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  updateIncident: (id: string, updates: Partial<Pick<Incident, 'title' | 'description' | 'severity' | 'location' | 'assignedTo'>>) => void;
};

const StoreContext = createContext<Store | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [incidents, setIncidents] = useState<Incident[]>(() => [...mockIncidents]);

  useEffect(() => {
    // Check API health first
    let isSubscribed = true; // to prevent state updates after unmount
    
    const initializeApp = async () => {
      // Initial load from API, fallback to mock if fails
      try {
        const isHealthy = await checkHealth();
        if (isHealthy) {
          const data = await getIncidents();
          if (Array.isArray(data) && isSubscribed) {
            setIncidents(data as Incident[]);
          }
        } else {
          console.warn('API server is not healthy, using mock data');
        }
      } catch (err) {
        console.warn('Failed to load incidents from API, using mock data:', err);
      }

      // Socket subscriptions - only if socket connects successfully
      try {
        const socket = getSocket();
        
        // Only set up listeners if socket is connected or will connect
        const onNew = (incident: Incident) => {
          if (isSubscribed) {
            setIncidents((prev) => [incident, ...prev.filter(i => i.id !== (incident as any)._id && i.id !== (incident as any).id)]);
          }
        };
        const onStatus = ({ id, status, updatedAt }: { id: string; status: IncidentStatus; updatedAt: string }) => {
          if (isSubscribed) {
            setIncidents((prev) => prev.map((i) => (i.id === id || (i as any)._id === id ? { ...i, status, updatedAt: new Date(updatedAt) as any } : i)));
          }
        };
        const onConfirm = ({ id, upvotes, updatedAt }: { id: string; upvotes: number; updatedAt: string }) => {
          if (isSubscribed) {
            setIncidents((prev) => prev.map((i) => (i.id === id || (i as any)._id === id ? { ...i, upvotes, updatedAt: new Date(updatedAt) as any } : i)));
          }
        };
        const onUpdate = (incident: Incident) => {
          if (isSubscribed) {
            setIncidents((prev) => prev.map((i) => (i.id === (incident as any).id || (i as any)._id === (incident as any)._id ? { ...i, ...incident } : i)));
          }
        };

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
      } catch (err) {
        console.warn('Failed to initialize socket, continuing without real-time updates:', err);
        return () => {};
      }
    };
    
    initializeApp();
    
    return () => {
      isSubscribed = false;
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
    apiUpdate(id, updates as any).catch(() => setIncidents(prevSnapshot));
  };

  const value = useMemo(
    () => ({ incidents, createIncident, confirmIncident, updateIncidentStatus, updateIncident }),
    [incidents]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};
