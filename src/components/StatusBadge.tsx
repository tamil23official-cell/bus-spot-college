import { CheckCircle2, Clock, CircleDot, AlertTriangle } from "lucide-react";

const MAP: Record<
  string,
  { className: string; icon: typeof Clock; label: string }
> = {
  "On Time": {
    className: "bg-success/12 text-success border-success/30",
    icon: CheckCircle2,
    label: "On Time",
  },
  Delayed: {
    className: "bg-warning/15 text-warning-foreground border-warning/40",
    icon: AlertTriangle,
    label: "Delayed",
  },
  "Not Started": {
    className: "bg-muted text-muted-foreground border-border",
    icon: CircleDot,
    label: "Not Started",
  },
  Completed: {
    className: "bg-info/12 text-info border-info/30",
    icon: Clock,
    label: "Completed",
  },
};

export function StatusBadge({ status, size = "md" }: { status: string; size?: "sm" | "md" }) {
  const conf = MAP[status] ?? MAP["Not Started"]!;
  const Icon = conf.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${conf.className} ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      }`}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      {conf.label}
    </span>
  );
}
