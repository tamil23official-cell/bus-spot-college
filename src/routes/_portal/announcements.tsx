import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Megaphone } from "lucide-react";
import { PortalLayout } from "@/components/PortalLayout";
import { announcementsQuery } from "@/lib/bus-data";

export const Route = createFileRoute("/_portal/announcements")({
  head: () => ({
    meta: [
      { title: "Bus Announcements — College Bus Tracking System" },
      { name: "description", content: "Delays, route changes and holiday notices for college bus services." },
      { property: "og:title", content: "Bus Announcements — College Bus Tracking System" },
      { property: "og:description", content: "Latest transport notices published by the college transport office." },
    ],
  }),
  component: AnnouncementsPage,
});

const TONE: Record<string, string> = {
  Delay: "bg-warning/15 text-warning-foreground",
  "Route Change": "bg-info/12 text-info",
  Holiday: "bg-destructive/10 text-destructive",
  General: "bg-primary-soft text-primary",
};

function AnnouncementsPage() {
  const announcements = useQuery(announcementsQuery);

  return (
    <PortalLayout title="Announcements" subtitle="Delays, route changes and holiday notices">
      <div className="grid gap-4 lg:grid-cols-2">
        {(announcements.data ?? []).map((a) => (
          <article key={a.id} className="surface-card surface-card-hover p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <Megaphone className="size-5" />
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TONE[a.category] ?? TONE["General"]}`}>
                {a.category}
              </span>
            </div>
            <h2 className="mt-4 text-base font-semibold">{a.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{a.message}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {new Date(a.created_at).toLocaleString()}
            </p>
          </article>
        ))}
        {announcements.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No announcements have been posted yet.</p>
        )}
      </div>
    </PortalLayout>
  );
}
