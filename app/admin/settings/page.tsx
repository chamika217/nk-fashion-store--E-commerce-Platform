"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  getStoreSettings,
  saveStoreSettings,
  type StoreSettings,
  DEFAULT_STORE_SETTINGS,
} from "@/lib/settingsService";

const inp =
  "w-full rounded-lg border border-gray-light px-3 py-2.5 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose transition-colors";

function SettingsContent() {
  const [form, setForm]         = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    getStoreSettings()
      .then(setForm)
      .finally(() => setLoading(false));
  }, []);

  function setField(key: keyof StoreSettings, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await saveStoreSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray py-12 text-center">Loading settings…</p>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-ink">Settings</h1>
        <p className="text-xs text-gray mt-1">
          Store configuration — changes are reflected live across the storefront.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">

        {/* ── Store Info ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-ink uppercase tracking-wider border-b border-gray-light pb-2">
            Store Info
          </h2>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">Store Name</label>
            <input type="text" value={form.storeName} onChange={(e) => setField("storeName", e.target.value)} className={inp} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider">Phone / WhatsApp</label>
              <input type="text" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="071 017 9823" className={inp} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider">Email</label>
              <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="nimzkp@gmail.com" className={inp} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">Location</label>
            <input type="text" value={form.location} onChange={(e) => setField("location", e.target.value)} placeholder="Tangalle, Sri Lanka" className={inp} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">Response Time</label>
            <input type="text" value={form.responseTime} onChange={(e) => setField("responseTime", e.target.value)} placeholder="We respond within 24 hours" className={inp} />
          </div>
        </section>

        {/* ── Social Links ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-ink uppercase tracking-wider border-b border-gray-light pb-2">
            Social Media Links
          </h2>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">Facebook URL</label>
            <input type="url" value={form.facebookUrl} onChange={(e) => setField("facebookUrl", e.target.value)} className={inp} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">TikTok URL</label>
            <input type="url" value={form.tiktokUrl} onChange={(e) => setField("tiktokUrl", e.target.value)} className={inp} />
          </div>
        </section>

        {/* ── Delivery ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-ink uppercase tracking-wider border-b border-gray-light pb-2">
            Delivery
          </h2>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Delivery Fee (Rs.)
            </label>
            <input
              type="number"
              min={0}
              value={form.deliveryFee}
              onChange={(e) => setField("deliveryFee", Number(e.target.value))}
              className={`${inp} max-w-[160px]`}
            />
            <p className="text-xs text-gray">Applied to all orders at checkout.</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">Delivery Note</label>
            <input
              type="text"
              value={form.deliveryNote}
              onChange={(e) => setField("deliveryNote", e.target.value)}
              placeholder="Free island-wide delivery via courier"
              className={inp}
            />
            <p className="text-xs text-gray">Shown in the CTA strip and checkout page.</p>
          </div>
        </section>

        {/* ── Submit ── */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-ink text-ivory text-sm font-medium px-8 py-2.5 rounded-full hover:bg-rose transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
          {saved && <p className="text-sm text-green-600">Settings saved ✓</p>}
          {error && <p className="text-sm text-rose">{error}</p>}
        </div>
      </form>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <SettingsContent />
    </AdminShell>
  );
}
