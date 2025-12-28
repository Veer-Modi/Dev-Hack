import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icon paths for Vite
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export type LeafletIncident = {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  location: { lat: number; lng: number; address: string }
}

type Props = {
  incidents: LeafletIncident[]
  onMarkerClick?: (id: string) => void
  selectableMarker?: boolean
  onSelectPosition?: (pos: { lat: number; lng: number }) => void
  centerOnUser?: boolean
  onUserLocation?: (pos: { lat: number; lng: number }) => void
  userRadiusMeters?: number
  className?: string
}


function RecenterOnUser({ pos, enabled }: { pos: { lat: number; lng: number } | null; enabled: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!enabled || !pos) return
    map.setView([pos.lat, pos.lng], 13)
  }, [enabled, pos, map])
  return null
}

function ClickSelectable({ onSelect }: { onSelect?: (pos: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onSelect?.({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function LeafletMap({
  incidents,
  onMarkerClick,
  selectableMarker,
  onSelectPosition,
  centerOnUser = true,
  onUserLocation,
  userRadiusMeters = 0,
  className,
}: Props) {
  const defaultCenter: LatLngExpression = [40.7128, -74.006]
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(p)
        onUserLocation?.(p)
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [onUserLocation])

  useEffect(() => {
    // initialize from user selection changes
    // no-op; selected is controlled by map events
  }, [])

  return (
    <div className={className ?? 'h-full w-full'}>
      <MapContainer {...({ center: defaultCenter, zoom: 12, style: { height: '100%', width: '100%' } } as any)}>
        <TileLayer
          {...({ attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' } as any)}
        />
        <RecenterOnUser enabled={centerOnUser} pos={userPos} />
        {userPos && (
          <>
            <Marker position={[userPos.lat, userPos.lng]}>
              <Popup>You are here</Popup>
            </Marker>
            {userRadiusMeters > 0 && (
              <Circle {...({ center: [userPos.lat, userPos.lng], radius: userRadiusMeters, pathOptions: { color: '#3b82f6' } } as any)} />
            )}
          </>
        )}
        {selectableMarker && <ClickSelectable onSelect={(pos) => { setSelected(pos); onSelectPosition?.(pos) }} />}
        {selected && <Marker position={[selected.lat, selected.lng]} />}
        {incidents.map((i) => (
          <Marker
            key={i.id}
            position={[i.location.lat, i.location.lng]}
            eventHandlers={{ click: () => onMarkerClick?.(i.id) }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-medium text-sm">{i.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{i.severity}</p>
                <p className="text-xs">{i.location.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
