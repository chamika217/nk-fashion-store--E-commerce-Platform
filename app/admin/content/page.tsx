"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { hasPermission } from "@/lib/permissions";
import AdminShell from "@/components/admin/AdminShell";
import {
  getContentSettings,
  saveContentSettings,
  type ContentSettings,
  DEFAULT_CONTENT_SETTINGS,
} from "@/lib/settingsService";
import { getProducts } from "@/lib/productService";
import type { Product } from "@/lib/types";

const inp =
  "w-full rounded-lg border border-gray-light px-3 py-2.5 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose transition-colors";

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

function ContentPageContent() {
  const { adminProfile, role } = useAdminAuth();

  const [form, setForm]         = useState<ContentSettings>(DEFAULT_CONTENT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    Promise.all([getContentSettings(), getProducts()])
      .then(([settings, prods]) => {
        setForm(settings);
        setProducts(prods.filter((p) => p.status !== "hidden"));
      })
      .finally(() => setLoading(false));
  }, []);

  if (adminProfile && !hasPermission(role, "content:view")) {
    return <AccessDenied />;
  }

  const canManage = hasPermission(role, "content:manage");

  function setField(key: keyof ContentSettings, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function toggleFeatured(productId: string) {
    setForm((prev) => {
      const ids = prev.featuredProductIds;
      const updated = ids.includes(productId)
        ? ids.filter((id) => id !== productId)
        : [...ids, productId];
      return { ...prev, featuredProductIds: updated };
    });
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await saveContentSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray py-12 text-center">Loading content settings…</p>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-ink">Content & Promotions</h1>
        <p className="text-xs text-gray mt-1">
          Control what appears on the home page hero, featured products, and CTA strip.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">

        {/* ── Hero Section ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-ink uppercase tracking-wider border-b border-gray-light pb-2">
            Hero Section
          </h2>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Heading
            </label>
            <input
              type="text"
              value={form.heroHeading}
              onChange={(e) => setField("heroHeading", e.target.value)}
              placeholder="Timeless Style, Sri Lankan Made"
              className={inp}
              disabled={!canManage}
            />
            <p className="text-xs text-gray">Use \n for a line break (e.g. "Line 1\nLine 2").</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Subtext / Tagline
            </label>
            <textarea
              value={form.heroSubtext}
              onChange={(e) => setField("heroSubtext", e.target.value)}
              rows={2}
              placeholder="Curated fashion for women, men & kids…"
              className={`${inp} resize-none`}
              disabled={!canManage}
            />
          </div>
        </section>

        {/* ── CTA Strip ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-ink uppercase tracking-wider border-b border-gray-light pb-2">
            CTA Strip (Bottom of Home Page)
          </h2>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">Strip Text</label>
            <input
              type="text"
              value={form.ctaText}
              onChange={(e) => setField("ctaText", e.target.value)}
              placeholder="Free island-wide delivery via courier — Cash on Delivery available"
              className={inp}
              disabled={!canManage}
            />
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-ink uppercase tracking-wider border-b border-gray-light pb-2">
            Featured / New Arrivals
          </h2>
          <p className="text-xs text-gray">
            Select products to pin at the top of "New Arrivals" on the home page.
            If none selected, the most recent products are shown automatically.
          </p>

          {products.length === 0 ? (
            <p className="text-sm text-gray">No products available.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {products.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                    form.featuredProductIds.includes(p.id)
                      ? "border-rose bg-rose-light/30"
                      : "border-gray-light hover:border-rose"
                  } ${!canManage ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={form.featuredProductIds.includes(p.id)}
                    onChange={() => canManage && toggleFeatured(p.id)}
                    className="accent-rose w-4 h-4"
                    disabled={!canManage}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                    <p className="text-xs text-gray">Rs. {p.price.toLocaleString()} · {p.category}</p>
                  </div>
                  {form.featuredProductIds.includes(p.id) && (
                    <span className="ml-auto text-[10px] font-semibold text-rose uppercase">
                      Featured
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}

          {form.featuredProductIds.length > 0 && (
            <p className="text-xs text-gray">
              {form.featuredProductIds.length} product{form.featuredProductIds.length !== 1 ? "s" : ""} selected.
            </p>
          )}
        </section>

        {/* ── Submit ── */}
        {canManage && (
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-ink text-ivory text-sm font-medium px-8 py-2.5 rounded-full hover:bg-rose transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Save Content"}
            </button>
            {saved && <p className="text-sm text-green-600">Content saved ✓</p>}
            {error && <p className="text-sm text-rose">{error}</p>}
          </div>
        )}
        {!canManage && (
          <p className="text-xs text-gray italic">You have view-only access to this section.</p>
        )}
      </form>
    </div>
  );
}

export default function AdminContentPage() {
  return (
    <AdminShell>
      <ContentPageContent />
    </AdminShell>
  );
}
