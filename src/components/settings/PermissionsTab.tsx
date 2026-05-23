import { useEffect, useMemo, useState } from "react";
import { Shield, Save, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  PERMISSION_MODULES,
  PERMISSION_ROLES,
  useRolePermissions,
  type PermissionAction,
  type PermissionModule,
} from "@/hooks/usePermissions";

type Key = `${string}:${PermissionModule}`;
type Matrix = Record<Key, { view: boolean; create: boolean; edit: boolean; delete: boolean }>;

const ACTIONS: PermissionAction[] = ["view", "create", "edit", "delete"];

function defaultsFor(role: string): { view: boolean; create: boolean; edit: boolean; delete: boolean } {
  if (role === "company_admin") return { view: true, create: true, edit: true, delete: true };
  if (role === "staff") return { view: true, create: true, edit: true, delete: false };
  return { view: true, create: false, edit: false, delete: false };
}

export function PermissionsTab() {
  const { profile } = useAuth();
  const { data: rows = [], isLoading } = useRolePermissions();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [matrix, setMatrix] = useState<Matrix>({});
  const [saving, setSaving] = useState(false);

  // Build matrix from DB rows + defaults
  useEffect(() => {
    const next: Matrix = {};
    for (const role of PERMISSION_ROLES) {
      for (const mod of PERMISSION_MODULES) {
        const key = `${role}:${mod.value}` as Key;
        const row = rows.find((r) => r.role === role && r.module === mod.value);
        next[key] = row
          ? { view: row.can_view, create: row.can_create, edit: row.can_edit, delete: row.can_delete }
          : defaultsFor(role);
      }
    }
    setMatrix(next);
  }, [rows]);

  const dirty = useMemo(() => {
    for (const role of PERMISSION_ROLES) {
      for (const mod of PERMISSION_MODULES) {
        const key = `${role}:${mod.value}` as Key;
        const row = rows.find((r) => r.role === role && r.module === mod.value);
        const current = matrix[key];
        if (!current) continue;
        const baseline = row
          ? { view: row.can_view, create: row.can_create, edit: row.can_edit, delete: row.can_delete }
          : defaultsFor(role);
        if (
          baseline.view !== current.view ||
          baseline.create !== current.create ||
          baseline.edit !== current.edit ||
          baseline.delete !== current.delete
        ) return true;
      }
    }
    return false;
  }, [matrix, rows]);

  const toggle = (role: string, mod: PermissionModule, action: PermissionAction) => {
    if (role === "company_admin") return; // Always full
    const key = `${role}:${mod}` as Key;
    setMatrix((m) => ({
      ...m,
      [key]: { ...m[key], [action]: !m[key][action] },
    }));
  };

  const resetDefaults = () => {
    const next: Matrix = {};
    for (const role of PERMISSION_ROLES) {
      for (const mod of PERMISSION_MODULES) {
        next[`${role}:${mod.value}` as Key] = defaultsFor(role);
      }
    }
    setMatrix(next);
  };

  const save = async () => {
    if (!profile?.company_id) return;
    setSaving(true);
    try {
      const payload = PERMISSION_ROLES.flatMap((role) =>
        PERMISSION_MODULES.map((mod) => {
          const v = matrix[`${role}:${mod.value}` as Key];
          return {
            company_id: profile.company_id,
            role,
            module: mod.value,
            can_view: v.view,
            can_create: v.create,
            can_edit: v.edit,
            can_delete: v.delete,
          };
        }),
      );
      const { error } = await (supabase as any)
        .from("role_permissions")
        .upsert(payload, { onConflict: "company_id,role,module" });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["role-permissions"] });
      toast({ title: "Permissions saved" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to save", description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" /> Role Permissions
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button size="sm" onClick={save} disabled={!dirty || saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Configure what each role can do across modules. Company admins always have full access.
        </p>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  {PERMISSION_ROLES.map((role) => (
                    <TableHead key={role} colSpan={4} className="text-center border-l">
                      <div className="capitalize">{role.replace("_", " ")}</div>
                    </TableHead>
                  ))}
                </TableRow>
                <TableRow>
                  <TableHead></TableHead>
                  {PERMISSION_ROLES.flatMap((role) =>
                    ACTIONS.map((a, i) => (
                      <TableHead
                        key={`${role}-${a}`}
                        className={`text-center text-xs capitalize ${i === 0 ? "border-l" : ""}`}
                      >
                        {a}
                      </TableHead>
                    )),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSION_MODULES.map((mod) => (
                  <TableRow key={mod.value}>
                    <TableCell className="font-medium">{mod.label}</TableCell>
                    {PERMISSION_ROLES.flatMap((role) =>
                      ACTIONS.map((action, i) => {
                        const key = `${role}:${mod.value}` as Key;
                        const v = matrix[key];
                        const isAdminRow = role === "company_admin";
                        return (
                          <TableCell
                            key={`${role}-${action}-${mod.value}`}
                            className={`text-center ${i === 0 ? "border-l" : ""}`}
                          >
                            <Checkbox
                              checked={isAdminRow ? true : !!v?.[action]}
                              disabled={isAdminRow}
                              onCheckedChange={() => toggle(role, mod.value, action)}
                            />
                          </TableCell>
                        );
                      }),
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Defaults</Badge>
          <span>Staff: view/create/edit · User: view only · Company Admin: full access</span>
        </div>
      </CardContent>
    </Card>
  );
}