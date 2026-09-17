import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, IdCard, MapPin, Phone, Timer, Users } from "lucide-react";
import { PortalLayout } from "@/components/PortalLayout";
import { MapPanel } from "@/components/MapPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { busesQuery, occupancyLabel, schedulesQuery, stopsQuery } from "@/lib/bus-data";

export const Route = createFileRoute("/_portal/bus/$busId")({
  head: () => ({
    meta: [
      { title: "Bus Details — College Bus Tracking System" },
      { name: "description", content: "Bus route, driver contact, current status, estimated arrival, stops and map." },
      { property: "og:title", content: "Bus Details — College Bus Tracking System" },
      { property: "og:description", content: "Full details for a college bus including stops and live status." },
    ],
  }),
  component: BusDetails,
});

function BusDetails() {
  const { busId } = Route.useParams();
  const buses = useQuery(busesQuery);
  const stops = useQuery(stopsQuery);
  const schedules = useQuery(schedulesQuery);

  const bus = (buses.data ?? []).find((b) => b.id === busId);
  const busStops = (stops.data ?? []).filter((s) => s.route_id === bus?.route_id);
  const busSchedules = (schedules.data ?? []).filter((s) => s.bus_id === busId);

  if (buses.isLoading) {
    return (
      <PortalLayout title="Bus details">
        <p className="text-sm text-muted-foreground">Loading bus information…</p>
      </PortalLayout>
    );
  }

  if (!bus) {
    return (
      <PortalLayout title="Bus not found">
        <div className="surface-card p-6">
          <p className="text-sm text-muted-foreground">This bus is no longer available.</p>
          <Link to="/dashboard" className="btn-base btn-primary mt-4">
            Back to dashboard
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const position =
    bus.current_lat != null && bus.current_lng != null
      ? { lat: Number(bus.current_lat), lng: Number(bus.current_lng) }
      : null;

  return (
    <PortalLayout title={`Bus ${bus.bus_number}`} subtitle={bus.routes?.name ?? "Route not assigned"}>
      <Link to="/dashboard" className="btn-base btn-outline mb-5">
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="surface-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{bus.bus_number}</h2>
            <StatusBadge status={bus.status} />
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Info icon={MapPin} label="Route" value={bus.routes?.name ?? "—"} />
            <Info
              icon={MapPin}
              label="From → To"
              value={bus.routes ? `${bus.routes.start_point} → ${bus.routes.destination}` : "—"}
            />
            <Info icon={IdCard} label="Driver name" value={bus.drivers?.name ?? "—"} />
            <Info icon={Phone} label="Driver contact" value={bus.drivers?.phone ?? "—"} />
            <Info icon={Timer} label="Estimated arrival" value={bus.eta ?? "—"} />
            <Info icon={Users} label="Capacity" value={`${bus.occupancy}/${bus.capacity} · ${occupancyLabel(bus)}`} />
          </dl>

          <h3 className="mt-6 text-sm font-semibold">Timings</h3>
          <table className="mt-2 w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-2">Shift</th>
                <th className="pb-2">Departure</th>
                <th className="pb-2">Arrival</th>
                <th className="pb-2">Days</th>
              </tr>
            </thead>
            <tbody>
              {busSchedules.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-2 font-medium">{s.shift}</td>
                  <td className="py-2">{s.departure_time}</td>
                  <td className="py-2">{s.arrival_time}</td>
                  <td className="py-2 text-muted-foreground">{s.days}</td>
                </tr>
              ))}
              {busSchedules.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 text-muted-foreground">
                    No timings added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <h3 className="mt-6 text-sm font-semibold">Stops on this route</h3>
          <ol className="mt-2 space-y-2">
            {busStops.map((stop) => (
              <li key={stop.id} className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2 text-sm">
                <span className="grid size-6 place-items-center rounded-full bg-card text-[11px] font-semibold">
                  {stop.stop_order}
                </span>
                <span className="flex-1">{stop.name}</span>
                <span className="text-xs text-muted-foreground">{stop.arrival_time ?? "—"}</span>
              </li>
            ))}
            {busStops.length === 0 && <li className="text-sm text-muted-foreground">No stops added for this route.</li>}
          </ol>
        </section>

        <section className="surface-card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="text-base font-semibold">Route map</h2>
          <p className="mt-1 mb-3 text-xs text-muted-foreground">
            The green marker shows the bus location last updated by the transport office.
          </p>
          <MapPanel stops={busStops} busPosition={position} busLabel={`Bus ${bus.bus_number}`} height="30rem" />
        </section>
      </div>
    </PortalLayout>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
