import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/student-login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Student Login — College Bus Tracking System" },
      { name: "description", content: "Students sign in to view college bus routes, timings and live bus status." },
      { property: "og:title", content: "Student Login — College Bus Tracking System" },
      { property: "og:description", content: "Sign in with your college email to check today's bus information." },
    ],
  }),
  component: () => <AuthCard variant="student" />,
});
