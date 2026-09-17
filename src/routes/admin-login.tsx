import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/admin-login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Login — College Bus Tracking System" },
      { name: "description", content: "Transport administrators sign in to manage buses, routes, schedules and notices." },
      { property: "og:title", content: "Admin Login — College Bus Tracking System" },
      { property: "og:description", content: "Manage campus buses, routes, drivers, schedules and announcements." },
    ],
  }),
  component: () => <AuthCard variant="admin" />,
});
