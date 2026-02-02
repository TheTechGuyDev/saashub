import { useState } from "react";
import { Settings as SettingsIcon, Building2, Users, Activity, Cog } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { CompaniesTab } from "@/components/settings/CompaniesTab";
import { UsersTab } from "@/components/settings/UsersTab";
import { ActivityTab } from "@/components/settings/ActivityTab";
import { SystemTab } from "@/components/settings/SystemTab";

export default function Settings() {
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("companies");

  if (!isSuperAdmin()) {
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
        title="Super Admin Settings"
        description="Manage all companies, users, and platform settings."
        icon={SettingsIcon}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Companies</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <CompaniesTab />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTab />
        </TabsContent>

        <TabsContent value="system">
          <SystemTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
