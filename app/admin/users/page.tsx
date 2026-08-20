"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { hasPermission } from "@/lib/permissions";
import { getAdmins, updateAdminRole } from "@/lib/adminService";
import {
  getRoles,
  addRole,
  updateRole,
  deleteRole,
  seedDefaultRoles,
} from "@/lib/roleService";
import type { AdminUser, Role, Permission } from "@/lib/types";
import AdminShell from "@/components/admin/AdminShell";

// ── Permission groups for checklist UI ────────────────────────────────────────

const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  { label: "Products",   permissions: ["products:view", "products:manage"]     },
  { label: "Orders",     permissions: ["orders:view", "orders:manage"]         },
  { label: "Categories", permissions: ["categories:view", "categories:manage"] },
  { label: "Customers",  permissions: ["customers:view"]                        },
  { label: "Content",    permissions: ["content:view", "content:manage"]       },
  { label: "Reports",    permissions: ["reports:view"]                          },
  { label: "Users",      permissions: ["users:manage"]                          },
];

// ── Shared components ─────────────────────────────────────────────────────────

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

// ── Role form ─────────────────────────────────────────────────────────────────

interface RoleFormProps {
  initial: { name: string; permissions: Permission[] };
  onSave: (name: string, permissions: Permission[]) => Promise<void>;
  onCancel: () => void;
}

function RoleForm({ initial, onSave, onCancel }: RoleFormProps) {
  const [name, setName]                 = useState(initial.name);
  const [permissions, setPermissions]   = useState<Permission[]>(initial.permissions);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");

  function togglePermission(p: Permission) {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Role name is required."); return; }
    setSaving(true);
    try {
      await onSave(name.trim(), permissions);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save role.");
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
      className="bg-gray-light/30 border border-gray-light rounded-xl p-5 flex flex-col gap-5"
    >
      {/* Role name */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink uppercase tracking-wider">
          Role Name <span className="text-rose">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Inventory Manager"
          className={inp}
        />
      </div>

      {/* Permission checklist */}
      <div>
        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
          Permissions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray uppercase tracking-wider">
                {group.label}
              </p>
              {group.permissions.map((perm) => (
                <label
                  key={perm}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="accent-rose w-4 h-4"
                  />
                  <span className="text-sm text-ink group-hover:text-rose transition-colors font-mono">
                    {perm}
                  </span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-rose">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-ivory text-sm font-medium px-6 py-2 rounded-full hover:bg-rose transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save Role"}
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

// ── Section 1: Admin Users ────────────────────────────────────────────────────

function AdminUsersSection({ roles }: { roles: Role[] }) {
  const [admins, setAdmins]       = useState<AdminUser[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState<Record<string, boolean>>({});
  const [pending, setPending]     = useState<Record<string, string>>({});
  const [saved, setSaved]         = useState<Record<string, boolean>>({});
  const [errors, setErrors]       = useState<Record<string, string>>({});

  useEffect(() => {
    getAdmins()
      .then((data) => {
        setAdmins(data);
        // seed pending map with current roleId
        const initial: Record<string, string> = {};
        data.forEach((a) => { initial[a.uid] = a.roleId ?? ""; });
        setPending(initial);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(uid: string) {
    const roleId = pending[uid];
    if (!roleId) return;
    setSaving((prev) => ({ ...prev, [uid]: true }));
    setErrors((prev) => ({ ...prev, [uid]: "" }));
    setSaved((prev) => ({ ...prev, [uid]: false }));
    try {
      await updateAdminRole(uid, roleId);
      setAdmins((prev) =>
        prev.map((a) => (a.uid === uid ? { ...a, roleId } : a))
      );
      setSaved((prev) => ({ ...prev, [uid]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [uid]: false })), 2500);
    } catch {
      setErrors((prev) => ({ ...prev, [uid]: "Failed to update role." }));
    } finally {
      setSaving((prev) => ({ ...prev, [uid]: false }));
    }
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-serif text-xl font-bold text-ink">Admin Users</h2>
        <p className="text-xs text-gray mt-1">
          New admin accounts are created manually via Firebase Console. This page manages role assignment only.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray py-8 text-center">Loading admins…</p>
      ) : admins.length === 0 ? (
        <p className="text-sm text-gray py-8 text-center">No admin accounts found.</p>
      ) : (
        <div className="rounded-xl border border-gray-light overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_200px_80px] bg-gray-light/50 px-4 py-3 gap-3 text-xs font-semibold text-gray uppercase tracking-wider">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span />
          </div>

          <div className="divide-y divide-gray-light bg-ivory">
            {admins.map((admin) => (
              <div
                key={admin.uid}
                className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_200px_80px] items-start sm:items-center gap-2 px-4 py-3"
              >
                <span className="text-sm font-medium text-ink">{admin.name}</span>
                <span className="text-sm text-gray truncate">{admin.email}</span>

                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <select
                    value={pending[admin.uid] ?? ""}
                    onChange={(e) =>
                      setPending((prev) => ({ ...prev, [admin.uid]: e.target.value }))
                    }
                    disabled={saving[admin.uid]}
                    className="w-full rounded-lg border border-gray-light px-2 py-1.5 text-sm text-ink bg-ivory focus:outline-none focus:ring-2 focus:ring-rose transition-colors"
                  >
                    <option value="">— No role —</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  {errors[admin.uid] && (
                    <p className="text-xs text-rose">{errors[admin.uid]}</p>
                  )}
                  {saved[admin.uid] && (
                    <p className="text-xs text-green-600">Saved ✓</p>
                  )}
                </div>

                <button
                  onClick={() => handleSave(admin.uid)}
                  disabled={saving[admin.uid] || pending[admin.uid] === admin.roleId}
                  className="text-xs bg-ink text-ivory px-3 py-1.5 rounded-full hover:bg-rose transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {saving[admin.uid] ? "Saving…" : "Save"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Section 2: Roles ──────────────────────────────────────────────────────────

function RolesSection() {
  const [roles, setRoles]         = useState<Role[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteErr, setDeleteErr] = useState<Record<string, string>>({});
  const [seeding, setSeeding]     = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getRoles();
      setRoles(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(name: string, permissions: Permission[]) {
    await addRole({ name, permissions });
    setShowAdd(false);
    await load();
  }

  async function handleUpdate(id: string, name: string, permissions: Permission[]) {
    await updateRole(id, { name, permissions });
    setEditingId(null);
    await load();
  }

  async function handleDelete(role: Role) {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    setDeleteErr((prev) => ({ ...prev, [role.id]: "" }));
    try {
      await deleteRole(role.id);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete role.";
      setDeleteErr((prev) => ({ ...prev, [role.id]: msg }));
    }
  }

  async function handleSeed() {
    if (!confirm("Seed the 5 default roles? Only works if the roles collection is empty.")) return;
    setSeeding(true);
    try {
      await seedDefaultRoles();
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Seed failed.");
    } finally {
      setSeeding(false);
    }
  }

  if (loading) {
    return (
      <section>
        <h2 className="font-serif text-xl font-bold text-ink mb-4">Roles</h2>
        <p className="text-sm text-gray py-8 text-center">Loading roles…</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-serif text-xl font-bold text-ink">Roles</h2>
        {!showAdd && !editingId && (
          <button
            onClick={() => setShowAdd(true)}
            className="bg-ink text-ivory text-sm font-medium px-5 py-2 rounded-full hover:bg-rose transition-colors"
          >
            + Add Role
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-6">
          <RoleForm
            initial={{ name: "", permissions: [] }}
            onSave={handleAdd}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      {roles.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <p className="text-gray text-sm">No roles yet.</p>
          <p className="text-xs text-gray">Add roles manually above, or seed the defaults:</p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="text-sm bg-ink text-ivory px-6 py-2 rounded-full hover:bg-rose transition-colors disabled:opacity-60"
          >
            {seeding ? "Seeding…" : "Seed Default Roles"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <div key={role.id}>
              {editingId === role.id ? (
                <RoleForm
                  initial={{ name: role.name, permissions: role.permissions }}
                  onSave={(name, permissions) => handleUpdate(role.id, name, permissions)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="border border-gray-light rounded-xl px-4 py-4 bg-ivory flex items-start justify-between gap-4 hover:border-rose/40 transition-colors">
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="font-semibold text-ink text-sm">{role.name}</p>
                    <p className="text-xs text-gray">
                      {role.permissions.length} permission{role.permissions.length !== 1 ? "s" : ""}
                    </p>
                    {role.permissions.length > 0 && (
                      <p className="text-xs text-gray font-mono leading-relaxed">
                        {role.permissions.join(", ")}
                      </p>
                    )}
                    {deleteErr[role.id] && (
                      <p className="text-xs text-rose mt-1">{deleteErr[role.id]}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingId(role.id)}
                      className="text-xs text-ink border border-gray-light rounded-full px-3 py-1 hover:border-rose hover:text-rose transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(role)}
                      className="text-xs text-rose border border-rose/30 rounded-full px-3 py-1 hover:bg-rose hover:text-ivory transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function UsersContent() {
  const { adminProfile, role } = useAdminAuth();
  const [roles, setRoles]      = useState<Role[]>([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .finally(() => setRolesLoaded(true));
  }, []);

  if (adminProfile && !hasPermission(role, "users:manage")) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink">Users & Roles</h1>
        <p className="text-xs text-gray mt-1">Manage admin accounts and permission roles.</p>
      </div>

      {rolesLoaded && <AdminUsersSection roles={roles} />}

      <RolesSection />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminShell>
      <UsersContent />
    </AdminShell>
  );
}
