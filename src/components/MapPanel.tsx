import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { BusStop } from "@/lib/bus-data";

const RouteMap = lazy(() => import("./RouteMap"));

function MapFallback() {
  return (
    <div className="grid h-full w-full place-items-center rounded-lg bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  );
}

export function MapPanel({
  stops,
  busPosition,
  busLabel,
  height = "22rem",
}: {
  stops: BusStop[];
  busPosition?: { lat: number; lng: number } | null | undefined;
  busLabel?: string | undefined;
  height?: string;
}) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-lg border border-border">
      <ClientOnly fallback={<MapFallback />}>
        <Suspense fallback={<MapFallback />}>
          <RouteMap stops={stops} busPosition={busPosition} busLabel={busLabel} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
