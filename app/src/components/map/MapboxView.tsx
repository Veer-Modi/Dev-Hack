import React, { useEffect, useRef } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = (import.meta as any).env.VITE_MAPBOX_TOKEN as string;

export type MapboxIncident = {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  location: { lat: number; lng: number; address: string };
};

type Props = {
  incidents: MapboxIncident[];
  onMarkerClick?: (id: string) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  selectableMarker?: boolean;
  onSelectPosition?: (pos: { lat: number; lng: number }) => void;
  className?: string;
};

export default function MapboxView({
  incidents,
  onMarkerClick,
  center = { lat: 40.7128, lng: -74.006 },
  zoom = 11,
  selectableMarker = false,
  onSelectPosition,
  className,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const selectionMarkerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center.lng, center.lat],
      zoom,
    });

    map.addControl(new mapboxgl.NavigationControl({
      showCompass: false,
    }));

    if (selectableMarker) {
      map.on("click", (e) => {
        const lngLat = e.lngLat;
        if (!lngLat) return;
        if (!selectionMarkerRef.current) {
          selectionMarkerRef.current = new mapboxgl.Marker({ color: "#1e90ff", draggable: true })
            .setLngLat([lngLat.lng, lngLat.lat])
            .addTo(map);
          selectionMarkerRef.current.on("dragend", () => {
            const pos = selectionMarkerRef.current!.getLngLat();
            onSelectPosition?.({ lat: pos.lat, lng: pos.lng });
          });
        } else {
          selectionMarkerRef.current.setLngLat([lngLat.lng, lngLat.lat]);
        }
        onSelectPosition?.({ lat: lngLat.lat, lng: lngLat.lng });
      });
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Remove existing markers from previous render
    (map as any)._incidentMarkers?.forEach((m: Marker) => m.remove());
    const markers: Marker[] = [];

    incidents.forEach((i) => {
      const color =
        i.severity === "critical"
          ? "#ef4444"
          : i.severity === "high"
          ? "#f59e0b"
          : i.severity === "medium"
          ? "#eab308"
          : "#22c55e";

      const marker = new mapboxgl.Marker({ color })
        .setLngLat([i.location.lng, i.location.lat])
        .addTo(map);

      if (onMarkerClick) {
        marker.getElement().addEventListener("click", () => onMarkerClick(i.id));
      }

      markers.push(marker);
    });

    (map as any)._incidentMarkers = markers;
  }, [incidents, onMarkerClick]);

  return <div ref={mapRef} className={className ?? "h-full w-full"} />;
}
