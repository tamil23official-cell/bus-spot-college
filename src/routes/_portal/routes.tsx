import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin } from "lucide-react";
import { PortalLayout } from "@/components/PortalLayout";
import { MapPanel } from "@/components/MapPanel";
import { busesQuery, routesQuery, stopsQuery } from "@/lib/bus-data";

export const Route = createFileRoute("/_portal/routes")({
  head: () => ({
    meta: [
      { title: "Bus Routes — College Bus Tracking System" },
      { name: "description", content: "All college bus routes with starting point, destination, bus number and stops." },
      { property: "og:title", content: "Bus Routes — College Bus Tracking System" },
      { property: "og:description", content: "Browse every college bus route and its stops on the map." },
    ],
  }),
  component: RoutesPage,
});

function RoutesPage() {
  const routes = useQuery(routesQuery);
  const stops = useQuery(stopsQuery);
  const buses = useQuery(busesQuery);
  const [selected, setSelected] = useState<string | null>(null);

  const activeRouteId = selected ?? routes.data?.[0]?.id ?? null;
  const activeStops = (stops.data ?? []).filter((s) => s.route_id === activeRouteId);
  const activeRoute = (routes.data ?? []).find((r) => r.id === activeRouteId);

  return (
    <PortalLayout title="Bus Routes" subtitle="All routes, stops and assigned buses">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          {(routes.data ?? []).map((route) => {
            const routeBuses = (buses.data ?? []).filter((b) => b.route_id === route.id);
            const routeStops = (stops.data ?? []).filter((s) => s.route_id === route.id);
            const isActive = route.id === activeRouteId;
            return (
              <article
                key={route.id}
                className={`surface-card surface-card-hover p-5 ${isActive ? "border-primary" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">{route.name}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {route.start_point} <ArrowRight className="size-3.5" /> {route.destination}
                      <span className="text-xs">· {Number(route.distance_km)} km</span>
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                    {routeBuses.map((b) => b.bus_number).join(", ") || "No bus assigned"}
                  </span>
                </div>

                <ol className="mt-4 space-y-2">
                  {routeStops.map((stop) => (
                    <li key={stop.id} className="flex items-center gap-3 text-sm">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold">
                        {stop.stop_order}
                      </span>
                      <MapPin className="size-3.5 text-primary" />
                      <span className="flex-1">{stop.name}</span>
                      <span className="text-xs text-muted-foreground">{stop.arrival_time ?? "—"}</span>
                    </li>
                  ))}
                </ol>

                <button className="btn-base btn-outline mt-4 w-full" onClick={() => setSelected(route.id)}>
                  Show this route on the map
                </button>
              </article>
            );
          })}
        </div>

        <div className="surface-card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="text-base font-semibold">{activeRoute?.name ?? "Route map"}</h2>
          <p className="mt-1 mb-3 text-xs text-muted-foreground">
            Stops are shown in order along the route. Select a route to update the map.
          </p>
          <MapPanel stops={activeStops} height="26rem" />
        </div>
      </div>
    </PortalLayout>
  );
}
