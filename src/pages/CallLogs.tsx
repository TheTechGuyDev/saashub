import { PhoneCall } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function CallLogs() {
  return (
    <div>
      <PageHeader
        title="Call Logs"
        description="View and search call history."
        icon={PhoneCall}
      />
      <PlaceholderContent
        title="Call Logs Module Coming Soon"
        description="This module will include automatic call logging, search and filter options, call duration tracking, and outcome reports."
        icon={PhoneCall}
      />
    </div>
  );
}
