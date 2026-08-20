import type { Role, Permission } from "./types";

/**
 * Returns true if the given role includes the requested permission.
 * Safe to call with null (returns false) — used during loading or when
 * the admin profile hasn't resolved yet.
 */
export function hasPermission(
  role: Role | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return role.permissions.includes(permission);
}
