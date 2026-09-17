import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bus,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Route as RouteIcon,
  Settings,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/routes", label: "Routes", icon: RouteIcon },
  { to: "/schedule", label: "Schedule", icon: CalendarClock },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
] as const;

export function PortalLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/student-login", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-5 text-sidebar-foreground">
      <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
        <span className="grid size-9 place-items-center rounded-lg bg-sidebar-accent">
          <Bus className="size-5" />
        </span>
        <span className="text-sm leading-tight font-semibold">
          College Bus
          <br />
          Tracking System
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-80 transition-all hover:bg-sidebar-accent hover:opacity-100"
            activeProps={{ className: "bg-sidebar-accent opacity-100" }}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
        {role === "admin" && (
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-lg border border-sidebar-border px-3 py-2.5 text-sm font-medium opacity-90 transition-all hover:bg-sidebar-accent hover:opacity-100"
            activeProps={{ className: "bg-sidebar-accent opacity-100" }}
          >
            <Settings className="size-4" />
            Admin Panel
          </Link>
        )}
      </nav>

      <div className="border-t border-sidebar-border pt-4">
        <p className="text-sm font-semibold">{profile?.full_name ?? "Student"}</p>
        <p className="text-xs opacity-70">
          {role === "admin" ? "Administrator" : (profile?.student_id ?? profile?.email ?? "Student")}
        </p>
        <button onClick={handleSignOut} className="btn-base btn-ghost-light mt-3 w-full">
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="animate-in slide-in-from-left relative h-full w-64">{sidebar}</div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3.5 backdrop-blur md:px-8">
          <button
            className="btn-base btn-outline px-2 py-2 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold md:text-xl">{title}</h1>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
