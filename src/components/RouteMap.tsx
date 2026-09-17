import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import type { BusStop } from "@/lib/bus-data";

const stopIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#2f5fd0;border:3px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const busIcon = L.divIcon({
  className: "",
  html: `<span style="display:grid;place-items:center;width:30px;height:30px;border-radius:9999px;background:#0f9d58;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);font-size:15px">🚌</span>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export default function RouteMap({
  stops,
  busPosition,
  busLabel,
}: {
  stops: BusStop[];
  busPosition?: { lat: number; lng: number } | null | undefined;
  busLabel?: string | undefined;
}) {
  const points: [number, number][] = stops.map((s) => [Number(s.lat), Number(s.lng)]);
  const center = busPosition
    ? ([busPosition.lat, busPosition.lng] as [number, number])
    : (points[0] ?? [11.0512, 77.018]);

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.length > 1 && <Polyline positions={points} pathOptions={{ color: "#2f5fd0", weight: 4, opacity: 0.8 }} />}
      {stops.map((stop) => (
        <Marker key={stop.id} position={[Number(stop.lat), Number(stop.lng)]} icon={stopIcon}>
          <Popup>
            <strong>
              {stop.stop_order}. {stop.name}
            </strong>
            <br />
            Arrival: {stop.arrival_time ?? "—"}
          </Popup>
        </Marker>
      ))}
      {busPosition && (
        <Marker position={[busPosition.lat, busPosition.lng]} icon={busIcon}>
          <Popup>{busLabel ?? "Bus current location"}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
