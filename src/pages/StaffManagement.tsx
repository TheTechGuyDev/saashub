import { UsersRound } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function StaffManagement() {
  return (
    <div>
      <PageHeader
        title="Staff Management"
        description="Manage employees, attendance, and performance."
        icon={UsersRound}
        action={{
          label: "Add Employee",
          onClick: () => console.log("Add employee"),
        }}
      />
      <PlaceholderContent
        title="Staff Management Module Coming Soon"
        description="This module will include employee profiles, attendance tracking, leave management, and performance reviews."
        icon={UsersRound}
      />
    </div>
  );
}
