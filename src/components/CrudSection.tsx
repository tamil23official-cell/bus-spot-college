import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
};

type Row = Record<string, unknown>;

export function CrudSection<T extends Row>({
  title,
  description,
  table,
  fields,
  rows,
  columns,
  invalidateKeys,
  loading,
}: {
  title: string;
  description: string;
  table: "buses" | "routes" | "bus_stops" | "drivers" | "schedules" | "announcements";
  fields: FieldConfig[];
  rows: T[];
  columns: { key: string; label: string; render?: (row: T) => string }[];
  invalidateKeys: string[][];
  loading?: boolean;
}) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function refresh() {
    for (const key of invalidateKeys) void queryClient.invalidateQueries({ queryKey: key });
  }

  const save = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editingId) {
        const { error } = await supabase.from(table).update(payload as never).eq("id", editingId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from(table).insert(payload as never);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success(editingId ? `${title} entry updated` : `${title} entry added`);
      refresh();
      closeForm();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Deleted successfully");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function openCreate() {
    setEditingId(null);
    setValues(Object.fromEntries(fields.map((f) => [f.name, ""])));
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(row: T) {
    setEditingId(String(row["id"]));
    setValues(
      Object.fromEntries(fields.map((f) => [f.name, row[f.name] == null ? "" : String(row[f.name])])),
    );
    setErrors({});
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setErrors({});
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const payload: Record<string, unknown> = {};

    for (const field of fields) {
      const raw = (values[field.name] ?? "").trim();
      if (field.required && !raw) {
        nextErrors[field.name] = `${field.label} is required`;
        continue;
      }
      if (field.type === "number") {
        if (raw === "") {
          payload[field.name] = null;
        } else if (Number.isNaN(Number(raw))) {
          nextErrors[field.name] = `${field.label} must be a number`;
        } else {
          payload[field.name] = Number(raw);
        }
        continue;
      }
      payload[field.name] = raw === "" ? null : raw;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please correct the highlighted fields");
      return;
    }
    save.mutate(payload);
  }

  return (
    <section className="surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <button className="btn-base btn-primary" onClick={formOpen ? closeForm : openCreate}>
          {formOpen ? <X className="size-4" /> : <Plus className="size-4" />}
          {formOpen ? "Close form" : "Add new"}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={submit} className="mt-4 grid gap-4 rounded-xl bg-secondary p-4 sm:grid-cols-2" noValidate>
          {fields.map((field) => (
            <label key={field.name} className="block space-y-1.5">
              <span className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
              </span>
              {field.type === "select" ? (
                <select
                  className="field-input"
                  value={values[field.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                >
                  <option value="">Select…</option>
                  {(field.options ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  className="field-input min-h-24"
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                />
              ) : (
                <input
                  className="field-input"
                  type={field.type === "number" ? "number" : "text"}
                  step="any"
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                />
              )}
              {errors[field.name] && <span className="block text-xs text-destructive">{errors[field.name]}</span>}
            </label>
          ))}
          <div className="flex items-end gap-2 sm:col-span-2">
            <button type="submit" className="btn-base btn-primary" disabled={save.isPending}>
              {editingId ? "Save changes" : "Add entry"}
            </button>
            <button type="button" className="btn-base btn-outline" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[38rem] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="pb-2">
                  {col.label}
                </th>
              ))}
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + 1} className="py-3 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={String(row["id"])} className="border-t border-border transition-colors hover:bg-secondary/60">
                {columns.map((col) => (
                  <td key={col.key} className="py-2.5">
                    {col.render ? col.render(row) : (row[col.key] == null ? "—" : String(row[col.key]))}
                  </td>
                ))}
                <td className="py-2.5">
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn-base btn-outline px-2.5 py-1.5"
                      onClick={() => openEdit(row)}
                      aria-label="Edit entry"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      className="btn-base btn-danger px-2.5 py-1.5"
                      aria-label="Delete entry"
                      onClick={() => {
                        if (confirm("Delete this entry? This cannot be undone.")) {
                          remove.mutate(String(row["id"]));
                        }
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="py-3 text-muted-foreground">
                  No entries yet. Use “Add new” to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
