import { Settings as SettingsIcon } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function Settings() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="System configuration and administration."
        icon={SettingsIcon}
      />
      <PlaceholderContent
        title="Settings Module Coming Soon"
        description="This module will include company management, user roles, permission configuration, and system settings."
        icon={SettingsIcon}
      />
    </div>
  );
}
