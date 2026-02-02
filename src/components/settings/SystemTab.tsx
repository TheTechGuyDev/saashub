import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cog, Shield, Database, Server } from "lucide-react";

export function SystemTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Platform Information
          </CardTitle>
          <CardDescription>System configuration and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-muted-foreground">PostgreSQL via Lovable Cloud</p>
                </div>
              </div>
              <Badge className="bg-success/10 text-success">Connected</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Row Level Security</p>
                  <p className="text-sm text-muted-foreground">Multi-tenant data isolation</p>
                </div>
              </div>
              <Badge className="bg-success/10 text-success">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Cog className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Authentication</p>
                  <p className="text-sm text-muted-foreground">Email/Password authentication</p>
                </div>
              </div>
              <Badge className="bg-success/10 text-success">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Configuration
          </CardTitle>
          <CardDescription>Role hierarchy and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border">
              <h4 className="font-medium text-destructive">Super Admin</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Full platform access. Can manage all companies, users, and system settings.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <h4 className="font-medium text-primary">Company Admin</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Full access to their company. Can manage employees, customers, and company settings.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <h4 className="font-medium text-accent">Staff</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Can create and manage customers, projects, and tasks within their company.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <h4 className="font-medium text-muted-foreground">User</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Basic read access to company data. Limited write permissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
