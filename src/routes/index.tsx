import { createFileRoute, Link } from "@tanstack/react-router";
import { Bus, Clock, MapPin, Megaphone, Route as RouteIcon, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "College Bus Tracking & Information System" },
      {
        name: "description",
        content:
          "Check college bus routes, timings, live bus status, stops, driver contact and announcements from one student portal.",
      },
      { property: "og:title", content: "College Bus Tracking & Information System" },
      {
        property: "og:description",
        content: "Centralized portal for college bus routes, schedules, live status and announcements.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Bus,
    title: "Live bus status",
    text: "See whether each bus is on time, delayed, yet to start or has completed its trip today.",
  },
  {
    icon: RouteIcon,
    title: "Routes & stops",
    text: "Browse every route with starting point, destination and the full ordered list of stops.",
  },
  { icon: Clock, title: "Morning & evening timings", text: "Daily departure and arrival times for every bus shift." },
  { icon: MapPin, title: "Route map", text: "View the route, stops and current bus location on an interactive map." },
  { icon: Users, title: "Driver & seat details", text: "Driver name, contact number and current seat availability." },
  { icon: Megaphone, title: "Announcements", text: "Delays, route changes and holiday notices published by the admin." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="campus-hero text-primary-foreground">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <span className="flex items-center gap-2.5 font-semibold">
            <span className="grid size-9 place-items-center rounded-lg bg-white/15">
              <Bus className="size-5" />
            </span>
            College Bus Tracking
          </span>
          <div className="hidden gap-2 sm:flex">
            <Link to="/student-login" className="btn-base btn-ghost-light">
              Student Login
            </Link>
            <Link to="/admin-login" className="btn-base btn-ghost-light">
              Admin Login
            </Link>
          </div>
        </nav>

        <div className="mx-auto max-w-6xl px-5 pt-10 pb-20 md:pt-16 md:pb-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold">
            <ShieldCheck className="size-3.5" /> College Mini Project · Transport Information Portal
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-semibold md:text-6xl">
            College Bus Tracking &amp; Information System
          </h1>
          <p className="mt-5 max-w-2xl text-base opacity-90 md:text-lg">
            Students often struggle to know bus timings, routes, delays and current bus status. This portal brings bus
            schedules, routes, stop details and real-time-like status information into one simple place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/student-login"
              className="btn-base bg-card text-foreground hover:shadow-lift px-6 py-3 hover:-translate-y-0.5"
            >
              Student Login
            </Link>
            <Link to="/admin-login" className="btn-base btn-ghost-light px-6 py-3">
              Admin Login
            </Link>
          </div>
          <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["5", "Buses"],
              ["5", "Routes"],
              ["19", "Stops"],
              ["2", "Daily shifts"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl bg-white/10 p-4">
                <dt className="text-2xl font-semibold">{value}</dt>
                <dd className="text-xs opacity-80">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-2xl font-semibold md:text-3xl">What students can do</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Everything a student needs before leaving home, and everything the transport office needs to keep it accurate.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="surface-card surface-card-hover p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="surface-card grid gap-6 p-7 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Test the system right away</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sample data for 5 buses, 5 routes, stops, schedules and announcements is already loaded. Use these demo
              accounts to explore both dashboards.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-secondary p-4 text-sm">
              <p className="font-semibold">Student</p>
              <p className="text-muted-foreground">student@college.edu</p>
              <p className="text-muted-foreground">student123</p>
            </div>
            <div className="rounded-xl bg-secondary p-4 text-sm">
              <p className="font-semibold">Admin</p>
              <p className="text-muted-foreground">admin@college.edu</p>
              <p className="text-muted-foreground">admin123</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-6">
        <p className="mx-auto max-w-6xl px-5 text-xs text-muted-foreground">
          College Bus Tracking &amp; Information System — a centralized web platform for campus transport information.
        </p>
      </footer>
    </div>
  );
}
