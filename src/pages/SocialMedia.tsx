import { Share2 } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function SocialMedia() {
  return (
    <div>
      <PageHeader
        title="Social Media Management"
        description="Manage social accounts and schedule posts."
        icon={Share2}
        action={{
          label: "New Post",
          onClick: () => console.log("New post"),
        }}
      />
      <PlaceholderContent
        title="Social Media Module Coming Soon"
        description="This module will include multi-platform connection, post scheduling, engagement analytics, and competitor monitoring."
        icon={Share2}
      />
    </div>
  );
}
