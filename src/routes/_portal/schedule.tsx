import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sun } from "lucide-react";
import { PortalLayout } from "@/components/PortalLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { busesQuery, schedulesQuery } from "@/lib/bus-data";

export const Route = createFileRoute("/_portal/schedule")({
  head: () => ({
    meta: [
      { title: "Daily Bus Schedule — College Bus Tracking System" },
      { name: "description", content: "Morning and evening college bus timings with departure and arrival times." },
      { property: "og:title", content: "Daily Bus Schedule — College Bus Tracking System" },
      { property: "og:description", content: "Departure and arrival timings for every college bus shift." },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const schedules = useQuery(schedulesQuery);
  const buses = useQuery(busesQuery);

  const shifts = [
    { key: "Morning", icon: Sun, label: "Morning shift" },
    { key: "Evening", icon: Moon, label: "Evening shift" },
  ];

  return (
    <PortalLayout title="Bus Schedule" subtitle="Daily morning and evening timings">
      <div className="space-y-6">
        {shifts.map((shift) => {
          const rows = (schedules.data ?? []).filter((s) => s.shift === shift.key);
          return (
            <section key={shift.key} className="surface-card p-5">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <shift.icon className="size-4 text-primary" /> {shift.label}
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[42rem] text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="pb-2">Bus number</th>
                      <th className="pb-2">Route</th>
                      <th className="pb-2">Departure</th>
                      <th className="pb-2">Arrival</th>
                      <th className="pb-2">Days</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const bus = (buses.data ?? []).find((b) => b.id === row.bus_id);
                      return (
                        <tr key={row.id} className="border-t border-border transition-colors hover:bg-secondary/60">
                          <td className="py-3 font-medium">{bus?.bus_number ?? "—"}</td>
                          <td className="py-3 text-muted-foreground">{bus?.routes?.name ?? "—"}</td>
                          <td className="py-3">{row.departure_time}</td>
                          <td className="py-3">{row.arrival_time}</td>
                          <td className="py-3 text-muted-foreground">{row.days}</td>
                          <td className="py-3">{bus ? <StatusBadge status={bus.status} size="sm" /> : "—"}</td>
                        </tr>
                      );
                    })}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-muted-foreground">
                          No timings added for this shift yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </PortalLayout>
  );
}
