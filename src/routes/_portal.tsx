import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_portal")({
  ssr: false,
  component: PortalGate,
});

function PortalGate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="surface-card max-w-sm p-7 text-center">
          <h1 className="text-lg font-semibold">Please log in first</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page is available to logged-in students and administrators.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link to="/student-login" className="btn-base btn-primary">
              Student Login
            </Link>
            <Link to="/admin-login" className="btn-base btn-outline">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
