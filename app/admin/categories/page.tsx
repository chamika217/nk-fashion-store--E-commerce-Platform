"use client";

import { useState, useEffect } from "react";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/categoryService";
import { seedCategories } from "@/lib/seedCategories";
import type { Category } from "@/lib/types";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { hasPermission } from "@/lib/permissions";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Category form state ───────────────────────────────────────────────────────

interface CatFormState {
  name: string;
  slug: string;
  subcategories: string[];
  order: number;
  tagInput: string;
}

const blankForm = (): CatFormState => ({
  name: "",
  slug: "",
  subcategories: [],
  order: 1,
  tagInput: "",
});

function fromCategory(c: Category): CatFormState {
  return {
    name: c.name,
    slug: c.slug,
    subcategories: [...c.subcategories],
    order: c.order,
    tagInput: "",
  };
}

// ── Inline form component ─────────────────────────────────────────────────────

function CategoryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: CatFormState;
  onSave: (data: Omit<Category, "id">) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm]     = useState<CatFormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  function setName(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      // auto-suggest slug if user hasn't manually changed it
      slug: prev.slug === toSlug(prev.name) || prev.slug === ""
        ? toSlug(name)
        : prev.slug,
    }));
  }

  function addTag() {
    const tag = form.tagInput.trim();
    if (!tag || form.subcategories.includes(tag)) {
      setForm((prev) => ({ ...prev, tagInput: "" }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, tag],
      tagInput: "",
    }));
  }

  function removeTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((s) => s !== tag),
    }));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.slug.trim()) { setError("Slug is required."); return; }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        slug: form.slug.trim(),
        subcategories: form.subcategories,
        order: Number(form.order) || 1,
      });
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inp =
    "w-full rounded-lg border border-gray-light px-3 py-2 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-gray-light/30 border border-gray-light rounded-xl p-5 flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink uppercase tracking-wider">
            Name <span className="text-rose">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Women's Wear"
            className={inp}
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink uppercase tracking-wider">
            Slug <span className="text-rose">*</span>
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            placeholder="womens-wear"
            className={inp}
          />
        </div>

        {/* Order */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink uppercase tracking-wider">
            Display Order
          </label>
          <input
            type="number"
            min={1}
            value={form.order}
            onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
            className={inp}
          />
        </div>
      </div>

      {/* Subcategories tag input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-ink uppercase tracking-wider">
          Subcategories
        </label>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 min-h-[28px]">
          {form.subcategories.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 bg-rose-light text-ink text-xs px-2 py-1 rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-gray hover:text-rose transition-colors leading-none"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {/* Tag input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={form.tagInput}
            onChange={(e) => setForm((p) => ({ ...p, tagInput: e.target.value }))}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a subcategory and press Enter"
            className={inp}
          />
          <button
            type="button"
            onClick={addTag}
            className="shrink-0 text-xs bg-ink text-ivory px-3 py-2 rounded-lg hover:bg-rose transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-rose">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-ivory text-sm font-medium px-6 py-2 rounded-full hover:bg-rose transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save Category"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray hover:text-rose transition-colors px-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
      <p className="text-2xl">🔒</p>
      <p className="font-serif text-xl font-bold text-ink">Access Restricted</p>
      <p className="text-sm text-gray max-w-xs">
        You don&apos;t have permission to access this section.
      </p>
    </div>
  );
}

function CategoriesContent() {
  const { adminProfile, role }      = useAdminAuth();
  const canManage                   = hasPermission(role, "categories:manage");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [seeding, setSeeding]       = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // ── Permission guard ──────────────────────────────────────────────────────
  if (adminProfile && !hasPermission(role, "categories:view")) {
    return <AccessDenied />;
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleAdd(data: Omit<Category, "id">) {
    await addCategory(data);
    setShowForm(false);
    await load();
  }

  async function handleUpdate(id: string, data: Omit<Category, "id">) {
    await updateCategory(id, data);
    setEditingId(null);
    await load();
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    await deleteCategory(cat.id);
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
  }

  async function handleSeed() {
    if (!confirm("Seed the 4 default categories? This will add them to Firestore.")) return;
    setSeeding(true);
    try {
      await seedCategories();
      await load();
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-serif text-2xl font-bold text-ink">Categories</h1>
        {canManage && !showForm && !editingId && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-ink text-ivory text-sm font-medium px-5 py-2 rounded-full hover:bg-rose transition-colors"
          >
            + Add Category
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-6">
          <CategoryForm
            initial={blankForm()}
            onSave={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray py-12 text-center">Loading categories…</p>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-4">
          <p className="text-gray">No categories yet.</p>
          <p className="text-sm text-gray">
            Add your first category above, or seed the defaults:
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="text-sm bg-ink text-ivory px-6 py-2 rounded-full hover:bg-rose transition-colors disabled:opacity-60"
          >
            {seeding ? "Seeding…" : "Seed Default Categories"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div key={cat.id}>
              {/* Edit form inline */}
              {editingId === cat.id ? (
                <CategoryForm
                  initial={fromCategory(cat)}
                  onSave={(data) => handleUpdate(cat.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                /* Row */
                <div className="border border-gray-light rounded-xl px-4 py-4 bg-ivory flex items-start justify-between gap-4 hover:border-rose/40 transition-colors">
                  <div className="flex flex-col gap-1 min-w-0">
                    {/* Name + order */}
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink text-sm">{cat.name}</p>
                      <span className="text-[10px] text-gray border border-gray-light rounded-full px-1.5 py-0.5">
                        #{cat.order}
                      </span>
                    </div>
                    {/* Slug */}
                    <p className="text-xs text-gray font-mono">{cat.slug}</p>
                    {/* Subcategories */}
                    <p className="text-xs text-gray">
                      <span className="font-medium text-ink">
                        {cat.subcategories.length}
                      </span>{" "}
                      subcategor{cat.subcategories.length === 1 ? "y" : "ies"}
                      {cat.subcategories.length > 0 && (
                        <span className="text-gray">
                          {" "}— {cat.subcategories.join(", ")}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  {canManage && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingId(cat.id)}
                      className="text-xs text-ink border border-gray-light rounded-full px-3 py-1 hover:border-rose hover:text-rose transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="text-xs text-rose border border-rose/30 rounded-full px-3 py-1 hover:bg-rose hover:text-ivory transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <AdminShell>
      <CategoriesContent />
    </AdminShell>
  );
}
