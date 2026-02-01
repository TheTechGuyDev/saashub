import { Mail } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function EmailMarketing() {
  return (
    <div>
      <PageHeader
        title="Email Marketing"
        description="Create and manage email campaigns."
        icon={Mail}
        action={{
          label: "New Campaign",
          onClick: () => console.log("New campaign"),
        }}
      />
      <PlaceholderContent
        title="Email Marketing Module Coming Soon"
        description="This module will include email templates, campaign management, analytics, and automation workflows."
        icon={Mail}
      />
    </div>
  );
}
