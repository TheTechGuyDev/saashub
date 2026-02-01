import { Users } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function CRM() {
  return (
    <div>
      <PageHeader
        title="CRM"
        description="Manage your customers, leads, and sales pipeline."
        icon={Users}
        action={{
          label: "Add Customer",
          onClick: () => console.log("Add customer"),
        }}
      />
      <PlaceholderContent
        title="CRM Module Coming Soon"
        description="This module will include customer profiles, sales pipeline tracking, activity logs, and customer segmentation features."
        icon={Users}
      />
    </div>
  );
}
