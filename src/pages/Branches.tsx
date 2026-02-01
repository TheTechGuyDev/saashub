import { Building2 } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function Branches() {
  return (
    <div>
      <PageHeader
        title="Branch Management"
        description="Manage company branches and locations."
        icon={Building2}
        action={{
          label: "Add Branch",
          onClick: () => console.log("Add branch"),
        }}
      />
      <PlaceholderContent
        title="Branch Management Module Coming Soon"
        description="This module will include multi-branch structure, staff assignment per branch, and branch-level reporting."
        icon={Building2}
      />
    </div>
  );
}
