import { useState } from "react";
import { Settings as SettingsIcon, Building2, Users, Activity, Cog, Link } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { CompaniesTab } from "@/components/settings/CompaniesTab";
import { UsersTab } from "@/components/settings/UsersTab";
import { ActivityTab } from "@/components/settings/ActivityTab";
import { SystemTab } from "@/components/settings/SystemTab";
import { IntegrationsTab } from "@/components/settings/IntegrationsTab";

export default function Settings() {
  const { isSuperAdmin, hasRole } = useAuth();
  const superAdmin = isSuperAdmin();
  const companyAdmin = hasRole ? hasRole("company_admin") : false;
  const [activeTab, setActiveTab] = useState(superAdmin ? "companies" : "users");

  if (!superAdmin && !companyAdmin) {
    return (
      <div>
        <PageHeader
          title="Settings"
          description="You don't have permission to access this page."
          icon={SettingsIcon}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={superAdmin ? "Super Admin Settings" : "Company Settings"}
        description={
          superAdmin
            ? "Manage all companies, users, and platform settings."
            : "Manage your team, integrations, and company settings."
        }
        icon={SettingsIcon}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full max-w-3xl ${superAdmin ? "grid-cols-5" : "grid-cols-4"}`}>
          {superAdmin && (
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Companies</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        {superAdmin && (
          <TabsContent value="companies">
            <CompaniesTab />
          </TabsContent>
        )}

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTab />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="system">
          <SystemTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
