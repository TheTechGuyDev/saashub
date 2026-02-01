import { UserPlus } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function CustomerAcquisition() {
  return (
    <div>
      <PageHeader
        title="Customer Acquisition"
        description="Manage leads, campaigns, and conversion funnels."
        icon={UserPlus}
        action={{
          label: "New Campaign",
          onClick: () => console.log("New campaign"),
        }}
      />
      <PlaceholderContent
        title="Customer Acquisition Module Coming Soon"
        description="This module will include lead capture forms, campaign management, referral tracking, and funnel visualization."
        icon={UserPlus}
      />
    </div>
  );
}
