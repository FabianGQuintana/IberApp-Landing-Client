import { DEMO_MODE } from "@/lib/rangers/demo";
import { adminApi as apiFetch } from "@/lib/admin/session";
import { demoServer } from "@/lib/demo-server";
import type { StaffMember } from "@/types/admin/report";

/** Roles that report from the field (RoleNames.FieldStaff) */
const FIELD_ROLES = ["Ranger", "Helper"];

/** The people who can have reports (for the "reportado por" filter), by last name. Admin only. */
export async function getStaff(): Promise<StaffMember[]> {
  const users = DEMO_MODE ? await demoServer.getUsers() : await apiFetch<StaffMember[]>("/api/users");
  return users
    .filter((u) => FIELD_ROLES.includes(u.role))
    // UserResponseDTO also carries phone, DNI and role id: keep only what the panel uses
    .map(({ id, name, lastName, email, portal, role, isActive }) => ({ id, name, lastName, email, portal, role, isActive }));
}
