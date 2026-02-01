import { Phone } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function CallCentre() {
  return (
    <div>
      <PageHeader
        title="Call Centre"
        description="Manage call queues and agent assignments."
        icon={Phone}
      />
      <PlaceholderContent
        title="Call Centre Module Coming Soon"
        description="This module will include softphone interface, call queue management, agent assignment, and real-time monitoring."
        icon={Phone}
      />
    </div>
  );
}
