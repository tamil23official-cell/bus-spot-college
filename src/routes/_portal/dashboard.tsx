import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bus as BusIcon, CalendarClock, Megaphone, Search, Timer } from "lucide-react";
import { PortalLayout } from "@/components/PortalLayout";
import { BusCard } from "@/components/BusCard";
import { StatusBadge } from "@/components/StatusBadge";
import { announcementsQuery, busesQuery, schedulesQuery } from "@/lib/bus-data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_portal/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — College Bus Tracking System" },
      { name: "description", content: "Today's college buses, live status, timings and announcements at a glance." },
      { property: "og:title", content: "Student Dashboard — College Bus Tracking System" },
      { property: "og:description", content: "Check today's buses, status, ETA and notices." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const buses = useQuery(busesQuery);
  const schedules = useQuery(schedulesQuery);
  const announcements = useQuery(announcementsQuery);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (buses.data ?? []).filter((bus) => {
      const matchesTerm =
        !term ||
        bus.bus_number.toLowerCase().includes(term) ||
        (bus.routes?.name ?? "").toLowerCase().includes(term) ||
        (bus.routes?.start_point ?? "").toLowerCase().includes(term);
      const matchesStatus = statusFilter === "All" || bus.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [buses.data, search, statusFilter]);

  const counts = useMemo(() => {
    const list = buses.data ?? [];
    return {
      total: list.length,
      onTime: list.filter((b) => b.status === "On Time").length,
      delayed: list.filter((b) => b.status === "Delayed").length,
      running: list.filter((b) => b.status === "On Time" || b.status === "Delayed").length,
    };
  }, [buses.data]);

  return (
    <PortalLayout
      title={`Welcome, ${profile?.full_name ?? "Student"}`}
      subtitle="Here is today's college bus information"
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BusIcon} label="Total buses" value={counts.total} />
        <StatCard icon={Timer} label="Running now" value={counts.running} />
        <StatCard icon={CalendarClock} label="On time" value={counts.onTime} />
        <StatCard icon={Megaphone} label="Delayed" value={counts.delayed} />
      </section>

      <section className="surface-card mt-6 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="field-input pl-9"
              placeholder="Search by bus number or route (e.g. 1001 or Gandhipuram)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search buses"
            />
          </div>
          <select
            className="field-input md:w-52"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            {["All", "On Time", "Delayed", "Not Started", "Completed"].map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All statuses" : s}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link to="/routes" className="btn-base btn-outline py-2">
            All routes
          </Link>
          <Link to="/schedule" className="btn-base btn-outline py-2">
            Today's schedule
          </Link>
          <Link to="/announcements" className="btn-base btn-outline py-2">
            Announcements
          </Link>
        </div>
      </section>

      <h2 className="mt-8 text-lg font-semibold">Today's buses</h2>
      {buses.isLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading buses…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No buses match your search.</p>
      ) : (
        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((bus) => (
            <BusCard key={bus.id} bus={bus} />
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Today's schedule</h2>
            <Link to="/schedule" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="py-2">Bus</th>
                  <th className="py-2">Shift</th>
                  <th className="py-2">Departure</th>
                  <th className="py-2">Arrival</th>
                </tr>
              </thead>
              <tbody>
                {(schedules.data ?? []).slice(0, 6).map((s) => {
                  const bus = (buses.data ?? []).find((b) => b.id === s.bus_id);
                  return (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2 font-medium">{bus?.bus_number ?? "—"}</td>
                      <td className="py-2">{s.shift}</td>
                      <td className="py-2">{s.departure_time}</td>
                      <td className="py-2">{s.arrival_time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Important announcements</h2>
            <Link to="/announcements" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-3 space-y-3">
            {(announcements.data ?? []).slice(0, 4).map((a) => (
              <li key={a.id} className="rounded-lg bg-secondary p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{a.title}</p>
                  <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-medium">{a.category}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.message}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="surface-card mt-6 p-5">
        <h2 className="text-base font-semibold">Bus status legend</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {["On Time", "Delayed", "Not Started", "Completed"].map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </section>
    </PortalLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BusIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="surface-card surface-card-hover flex items-center gap-4 p-5">
      <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
