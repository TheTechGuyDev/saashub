import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PermissionModule =
  | "crm"
  | "projects"
  | "documents"
  | "calendar"
  | "knowledge_base"
  | "whatsapp"
  | "call_logs"
  | "tickets";

export type PermissionAction = "view" | "create" | "edit" | "delete";

export interface RolePermissionRow {
  id: string;
  company_id: string;
  role: string;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export const PERMISSION_MODULES: { value: PermissionModule; label: string }[] = [
  { value: "crm", label: "CRM" },
  { value: "projects", label: "Projects" },
  { value: "documents", label: "Documents" },
  { value: "calendar", label: "Calendar" },
  { value: "knowledge_base", label: "Knowledge Base" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "call_logs", label: "Call Logs" },
  { value: "tickets", label: "Tickets" },
];

export const PERMISSION_ROLES = ["company_admin", "staff", "user"] as const;

export function useRolePermissions() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["role-permissions", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [] as RolePermissionRow[];
      const { data, error } = await (supabase as any)
        .from("role_permissions")
        .select("*")
        .eq("company_id", profile.company_id);
      if (error) throw error;
      return (data ?? []) as RolePermissionRow[];
    },
    enabled: !!profile?.company_id,
  });
}

/**
 * Client-side permission check. Mirrors the DB default behavior of has_permission().
 * For sensitive operations always rely on RLS server-side; this is for UI gating only.
 */
export function usePermissions() {
  const { roles, isSuperAdmin } = useAuth();
  const { data: permissions = [] } = useRolePermissions();

  const can = (module: PermissionModule, action: PermissionAction): boolean => {
    if (isSuperAdmin()) return true;
    if (roles.includes("company_admin")) return true;

    for (const role of roles) {
      const row = permissions.find((p) => p.role === role && p.module === module);
      if (row) {
        const allowed =
          action === "view" ? row.can_view :
          action === "create" ? row.can_create :
          action === "edit" ? row.can_edit :
          row.can_delete;
        if (allowed) return true;
      } else {
        // Defaults
        if (role === "staff" && (action === "view" || action === "create" || action === "edit")) return true;
        if (role === "user" && action === "view") return true;
      }
    }
    return false;
  };

  return { can };
}