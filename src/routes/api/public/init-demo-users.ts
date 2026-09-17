import { createFileRoute } from "@tanstack/react-router";

// One-time helper that creates the demo student and admin accounts used for
// testing the portal. Safe to call repeatedly: existing users are skipped.
const DEMO_USERS = [
  {
    email: "student@college.edu",
    password: "student123",
    metadata: { full_name: "Priya Ramesh", student_id: "21CS045", department: "Computer Science", role: "student" },
  },
  {
    email: "admin@college.edu",
    password: "admin123",
    metadata: { full_name: "Transport Office", student_id: null, department: "Administration", role: "admin" },
  },
];

async function seed() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const results: { email: string; status: string }[] = [];

  for (const demo of DEMO_USERS) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: demo.email,
      password: demo.password,
      email_confirm: true,
      user_metadata: demo.metadata,
    });

    if (error) {
      results.push({ email: demo.email, status: `skipped: ${error.message}` });
      continue;
    }

    if (data.user && demo.metadata.role === "admin") {
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: data.user.id, role: "admin" },
        { onConflict: "user_id,role" },
      );
    }
    results.push({ email: demo.email, status: "created" });
  }

  return results;
}

export const Route = createFileRoute("/api/public/init-demo-users")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify({ results: await seed() }), {
          headers: { "Content-Type": "application/json" },
        }),
      POST: async () =>
        new Response(JSON.stringify({ results: await seed() }), {
          headers: { "Content-Type": "application/json" },
        }),
    },
  },
});
