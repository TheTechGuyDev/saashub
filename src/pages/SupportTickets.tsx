import { Ticket } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function SupportTickets() {
  return (
    <div>
      <PageHeader
        title="Support Tickets"
        description="Manage customer support requests."
        icon={Ticket}
        action={{
          label: "New Ticket",
          onClick: () => console.log("New ticket"),
        }}
      />
      <PlaceholderContent
        title="Support Tickets Module Coming Soon"
        description="This module will include ticket creation, assignment, tracking, resolution workflows, and customer communication."
        icon={Ticket}
      />
    </div>
  );
}
