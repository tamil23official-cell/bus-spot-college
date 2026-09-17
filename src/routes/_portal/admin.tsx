import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bus as BusIcon, GraduationCap, Radio, Route as RouteIcon, ShieldAlert } from "lucide-react";
import { PortalLayout } from "@/components/PortalLayout";
import { CrudSection, type FieldConfig } from "@/components/CrudSection";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth";
import {
  BUS_STATUSES,
  announcementsQuery,
  busesQuery,
  driversQuery,
  routesQuery,
  schedulesQuery,
  stopsQuery,
  studentsQuery,
} from "@/lib/bus-data";

export const Route = createFileRoute("/_portal/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — College Bus Tracking System" },
      { name: "description", content: "Manage college buses, routes, stops, drivers, schedules and announcements." },
      { property: "og:title", content: "Admin Dashboard — College Bus Tracking System" },
      { property: "og:description", content: "Transport office control panel for campus bus information." },
    ],
  }),
  component: AdminPage,
});

const TABS = ["Overview", "Buses", "Routes", "Stops", "Drivers", "Schedules", "Announcements", "Students"] as const;

function AdminPage() {
  const { role, profile } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  const buses = useQuery(busesQuery);
  const routes = useQuery(routesQuery);
  const stops = useQuery(stopsQuery);
  const drivers = useQuery(driversQuery);
  const schedules = useQuery(schedulesQuery);
  const announcements = useQuery(announcementsQuery);
  const students = useQuery(studentsQuery);

  if (role !== "admin") {
    return (
      <PortalLayout title="Admin Panel">
        <div className="surface-card max-w-lg p-6">
          <span className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
            <ShieldAlert className="size-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Admin access required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You are signed in as a student. Log in with an administrator account to manage buses and routes.
          </p>
          <Link to="/admin-login" className="btn-base btn-primary mt-4">
            Go to Admin Login
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const routeOptions = (routes.data ?? []).map((r) => ({ value: r.id, label: r.name }));
  const driverOptions = (drivers.data ?? []).map((d) => ({ value: d.id, label: `${d.name} (${d.phone})` }));
  const busOptions = (buses.data ?? []).map((b) => ({ value: b.id, label: b.bus_number }));
  const routeName = (id: string | null) => (routes.data ?? []).find((r) => r.id === id)?.name ?? "—";
  const busNumber = (id: string) => (buses.data ?? []).find((b) => b.id === id)?.bus_number ?? "—";

  const busFields: FieldConfig[] = [
    { name: "bus_number", label: "Bus number", required: true, placeholder: "TN 45 A 1006" },
    { name: "route_id", label: "Route", type: "select", options: routeOptions },
    { name: "driver_id", label: "Driver", type: "select", options: driverOptions },
    { name: "capacity", label: "Capacity", type: "number", required: true, placeholder: "52" },
    { name: "occupancy", label: "Seats occupied", type: "number", placeholder: "30" },
    {
      name: "status",
      label: "Current status",
      type: "select",
      required: true,
      options: BUS_STATUSES.map((s) => ({ value: s, label: s })),
    },
    { name: "eta", label: "Estimated arrival", placeholder: "08:40 AM" },
    { name: "current_lat", label: "Current latitude", type: "number", placeholder: "11.0512" },
    { name: "current_lng", label: "Current longitude", type: "number", placeholder: "77.0180" },
  ];

  return (
    <PortalLayout title="Admin Dashboard" subtitle={`Signed in as ${profile?.full_name ?? "Administrator"}`}>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={BusIcon} label="Total buses" value={buses.data?.length ?? 0} />
        <Stat icon={RouteIcon} label="Total routes" value={routes.data?.length ?? 0} />
        <Stat icon={GraduationCap} label="Registered students" value={students.data?.length ?? 0} />
        <Stat
          icon={Radio}
          label="Active buses"
          value={(buses.data ?? []).filter((b) => b.status === "On Time" || b.status === "Delayed").length}
        />
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`btn-base py-2 ${tab === item ? "btn-primary" : "btn-outline"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {tab === "Overview" && (
          <section className="surface-card p-5">
            <h2 className="text-base font-semibold">Recent updates</h2>
            <p className="text-xs text-muted-foreground">Latest bus statuses and published announcements.</p>
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold">Bus status board</h3>
                <ul className="mt-2 space-y-2">
                  {(buses.data ?? []).map((bus) => (
                    <li
                      key={bus.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{bus.bus_number}</span>
                      <span className="text-xs text-muted-foreground">{bus.routes?.name ?? "No route"}</span>
                      <span className="text-xs">ETA {bus.eta ?? "—"}</span>
                      <StatusBadge status={bus.status} size="sm" />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Latest announcements</h3>
                <ul className="mt-2 space-y-2">
                  {(announcements.data ?? []).slice(0, 5).map((a) => (
                    <li key={a.id} className="rounded-lg bg-secondary px-3 py-2 text-sm">
                      <p className="font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.category} · {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {tab === "Buses" && (
          <CrudSection
            title="Buses"
            description="Add buses, update live status, estimated arrival time and current location."
            table="buses"
            fields={busFields}
            rows={buses.data ?? []}
            loading={buses.isLoading}
            invalidateKeys={[["buses"]]}
            columns={[
              { key: "bus_number", label: "Bus number" },
              { key: "route", label: "Route", render: (row) => routeName(row.route_id) },
              { key: "status", label: "Status" },
              { key: "eta", label: "ETA", render: (row) => row.eta ?? "—" },
              { key: "seats", label: "Seats", render: (row) => `${row.occupancy}/${row.capacity}` },
            ]}
          />
        )}

        {tab === "Routes" && (
          <CrudSection
            title="Routes"
            description="Create and edit bus routes with starting point, destination and distance."
            table="routes"
            fields={[
              { name: "name", label: "Route name", required: true, placeholder: "Route 6 - Kuniamuthur Line" },
              { name: "start_point", label: "Starting point", required: true },
              { name: "destination", label: "Destination", required: true, placeholder: "College Campus" },
              { name: "distance_km", label: "Distance (km)", type: "number" },
            ]}
            rows={routes.data ?? []}
            loading={routes.isLoading}
            invalidateKeys={[["routes"], ["buses"]]}
            columns={[
              { key: "name", label: "Route" },
              { key: "start_point", label: "From" },
              { key: "destination", label: "To" },
              { key: "distance_km", label: "Distance (km)" },
            ]}
          />
        )}

        {tab === "Stops" && (
          <CrudSection
            title="Bus stops"
            description="Manage stops for each route, including order, timing and map coordinates."
            table="bus_stops"
            fields={[
              { name: "route_id", label: "Route", type: "select", required: true, options: routeOptions },
              { name: "name", label: "Stop name", required: true },
              { name: "stop_order", label: "Stop order", type: "number", required: true },
              { name: "arrival_time", label: "Arrival time", placeholder: "07:45 AM" },
              { name: "lat", label: "Latitude", type: "number", required: true, placeholder: "11.0512" },
              { name: "lng", label: "Longitude", type: "number", required: true, placeholder: "77.0180" },
            ]}
            rows={stops.data ?? []}
            loading={stops.isLoading}
            invalidateKeys={[["bus_stops"]]}
            columns={[
              { key: "stop_order", label: "#" },
              { key: "name", label: "Stop" },
              { key: "route", label: "Route", render: (row) => routeName(row.route_id) },
              { key: "arrival_time", label: "Arrival" },
            ]}
          />
        )}

        {tab === "Drivers" && (
          <CrudSection
            title="Drivers"
            description="Driver names, contact numbers, licence and experience."
            table="drivers"
            fields={[
              { name: "name", label: "Driver name", required: true },
              { name: "phone", label: "Contact number", required: true, placeholder: "+91 98765 43210" },
              { name: "license_no", label: "Licence number" },
              { name: "experience_years", label: "Experience (years)", type: "number" },
            ]}
            rows={drivers.data ?? []}
            loading={drivers.isLoading}
            invalidateKeys={[["drivers"], ["buses"]]}
            columns={[
              { key: "name", label: "Driver" },
              { key: "phone", label: "Contact" },
              { key: "license_no", label: "Licence" },
              { key: "experience_years", label: "Experience" },
            ]}
          />
        )}

        {tab === "Schedules" && (
          <CrudSection
            title="Schedules"
            description="Morning and evening timings for each bus."
            table="schedules"
            fields={[
              { name: "bus_id", label: "Bus", type: "select", required: true, options: busOptions },
              {
                name: "shift",
                label: "Shift",
                type: "select",
                required: true,
                options: [
                  { value: "Morning", label: "Morning" },
                  { value: "Evening", label: "Evening" },
                ],
              },
              { name: "departure_time", label: "Departure time", required: true, placeholder: "07:15 AM" },
              { name: "arrival_time", label: "Arrival time", required: true, placeholder: "08:35 AM" },
              { name: "days", label: "Operating days", placeholder: "Mon - Sat" },
            ]}
            rows={schedules.data ?? []}
            loading={schedules.isLoading}
            invalidateKeys={[["schedules"]]}
            columns={[
              { key: "bus", label: "Bus", render: (row) => busNumber(row.bus_id) },
              { key: "shift", label: "Shift" },
              { key: "departure_time", label: "Departure" },
              { key: "arrival_time", label: "Arrival" },
              { key: "days", label: "Days" },
            ]}
          />
        )}

        {tab === "Announcements" && (
          <CrudSection
            title="Announcements"
            description="Publish delays, route changes and holiday notices for students."
            table="announcements"
            fields={[
              { name: "title", label: "Title", required: true },
              { name: "message", label: "Message", type: "textarea", required: true },
              {
                name: "category",
                label: "Category",
                type: "select",
                required: true,
                options: ["Delay", "Route Change", "Holiday", "General"].map((c) => ({ value: c, label: c })),
              },
            ]}
            rows={announcements.data ?? []}
            loading={announcements.isLoading}
            invalidateKeys={[["announcements"]]}
            columns={[
              { key: "title", label: "Title" },
              { key: "category", label: "Category" },
              {
                key: "created_at",
                label: "Posted",
                render: (row) => new Date(row.created_at).toLocaleDateString(),
              },
            ]}
          />
        )}

        {tab === "Students" && (
          <section className="surface-card p-5">
            <h2 className="text-base font-semibold">Registered students</h2>
            <p className="text-xs text-muted-foreground">Students who created an account on the portal.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Student ID</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {(students.data ?? []).map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2.5 font-medium">{s.full_name}</td>
                      <td className="py-2.5">{s.student_id ?? "—"}</td>
                      <td className="py-2.5 text-muted-foreground">{s.email ?? "—"}</td>
                      <td className="py-2.5">{s.department ?? "—"}</td>
                    </tr>
                  ))}
                  {students.data?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 text-muted-foreground">
                        No students registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </PortalLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof BusIcon; label: string; value: number }) {
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
