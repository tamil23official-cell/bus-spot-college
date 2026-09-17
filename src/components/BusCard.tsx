import { Link } from "@tanstack/react-router";
import { Bus as BusIcon, MapPin, Phone, Timer, Users } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { occupancyLabel, type Bus } from "@/lib/bus-data";

export function BusCard({ bus }: { bus: Bus }) {
  const fill = Math.min(Math.round((bus.occupancy / Math.max(bus.capacity, 1)) * 100), 100);

  return (
    <article className="surface-card surface-card-hover flex flex-col gap-4 p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
            <BusIcon className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold">{bus.bus_number}</h3>
            <p className="text-xs text-muted-foreground">{bus.routes?.name ?? "Route not assigned"}</p>
          </div>
        </div>
        <StatusBadge status={bus.status} size="sm" />
      </header>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> From
          </dt>
          <dd className="font-medium">{bus.routes?.start_point ?? "—"}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Timer className="size-3.5" /> Estimated arrival
          </dt>
          <dd className="font-medium">{bus.eta ?? "—"}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3.5" /> Driver
          </dt>
          <dd className="font-medium">{bus.drivers?.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" /> Seats
          </dt>
          <dd className="font-medium">{occupancyLabel(bus)}</dd>
        </div>
      </dl>

      <div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${fill}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {bus.occupancy} of {bus.capacity} seats occupied
        </p>
      </div>

      <Link
        to="/bus/$busId"
        params={{ busId: bus.id }}
        className="btn-base btn-outline w-full"
        aria-label={`View details for bus ${bus.bus_number}`}
      >
        View bus details
      </Link>
    </article>
  );
}
