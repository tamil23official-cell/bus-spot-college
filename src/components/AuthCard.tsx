import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bus, KeyRound, Loader2, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_ACCOUNTS } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(3, { message: "Enter your full name" }).max(100),
  studentId: z.string().trim().min(3, { message: "Enter your student ID" }).max(30),
  department: z.string().trim().max(60).optional(),
});

export function AuthCard({ variant }: { variant: "student" | "admin" }) {
  const navigate = useNavigate();
  const isAdmin = variant === "admin";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    studentId: "",
    department: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function fillDemo() {
    const demo = isAdmin ? DEMO_ACCOUNTS.admin : DEMO_ACCOUNTS.student;
    setForm((f) => ({ ...f, email: demo.email, password: demo.password }));
    setErrors({});
    toast.info("Demo credentials filled in. Press Login to continue.");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});

    if (mode === "login") {
      const parsed = loginSchema.safeParse(form);
      if (!parsed.success) {
        setErrors(fieldErrors(parsed.error));
        return;
      }
      setBusy(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      setBusy(false);
      if (error) {
        toast.error(error.message === "Invalid login credentials" ? "Incorrect email or password" : error.message);
        return;
      }
      toast.success("Logged in successfully");
      navigate({ to: isAdmin ? "/admin" : "/dashboard" });
      return;
    }

    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: parsed.data.fullName,
          student_id: parsed.data.studentId,
          department: parsed.data.department ?? "",
          role: "student",
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. You are signed in.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="campus-hero hidden flex-col justify-between p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15">
            <Bus className="size-5" />
          </span>
          College Bus Tracking
        </Link>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold">
            {isAdmin ? "Manage campus transport in one place" : "Never miss your college bus again"}
          </h2>
          <p className="mt-4 text-sm opacity-85">
            {isAdmin
              ? "Add buses, update live status and estimated arrival times, manage routes, stops, drivers, schedules and announcements."
              : "Check today's buses, live status, route stops, timings, driver contact and the route map — all from one dashboard."}
          </p>
        </div>
        <p className="text-xs opacity-70">Centralized bus information portal for students and administrators.</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="surface-card w-full max-w-md p-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            {isAdmin ? <ShieldCheck className="size-3.5" /> : <UserPlus className="size-3.5" />}
            {isAdmin ? "Admin access" : "Student access"}
          </span>
          <h1 className="mt-4 text-2xl font-semibold">
            {mode === "login" ? (isAdmin ? "Admin Login" : "Student Login") : "Create student account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Enter your college email and password to continue."
              : "Register with your college email and student ID."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {mode === "signup" && (
              <>
                <Field label="Full name" error={errors["fullName"]}>
                  <input
                    className="field-input"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Priya Ramesh"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Student ID" error={errors["studentId"]}>
                    <input
                      className="field-input"
                      value={form.studentId}
                      onChange={(e) => set("studentId", e.target.value)}
                      placeholder="21CS045"
                    />
                  </Field>
                  <Field label="Department" error={errors["department"]}>
                    <input
                      className="field-input"
                      value={form.department}
                      onChange={(e) => set("department", e.target.value)}
                      placeholder="Computer Science"
                    />
                  </Field>
                </div>
              </>
            )}

            <Field label={isAdmin ? "Admin email" : "Student email / ID email"} error={errors["email"]}>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="field-input pl-9"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder={isAdmin ? "admin@college.edu" : "student@college.edu"}
                />
              </div>
            </Field>

            <Field label="Password" error={errors["password"]}>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="field-input pl-9"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </Field>

            <button type="submit" className="btn-base btn-primary w-full" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          <button onClick={fillDemo} className="btn-base btn-outline mt-3 w-full">
            Use demo {isAdmin ? "admin" : "student"} credentials
          </button>

          <div className="mt-5 space-y-2 text-sm">
            {!isAdmin && (
              <button
                className="font-medium text-primary hover:underline"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setErrors({});
                }}
              >
                {mode === "login" ? "New student? Create an account" : "Already registered? Login instead"}
              </button>
            )}
            <p className="text-muted-foreground">
              {isAdmin ? (
                <Link to="/student-login" className="hover:underline">
                  Student login instead
                </Link>
              ) : (
                <Link to="/admin-login" className="hover:underline">
                  Admin login instead
                </Link>
              )}
            </p>
          </div>

          <div className="mt-5 rounded-lg bg-secondary p-3 text-xs text-secondary-foreground">
            <p className="font-semibold">Test credentials</p>
            <p>Student — student@college.edu / student123</p>
            <p>Admin — admin@college.edu / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
