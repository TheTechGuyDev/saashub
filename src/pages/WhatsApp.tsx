import { MessageCircle } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function WhatsApp() {
  return (
    <div>
      <PageHeader
        title="WhatsApp Management"
        description="Manage WhatsApp conversations and campaigns."
        icon={MessageCircle}
      />
      <PlaceholderContent
        title="WhatsApp Module Coming Soon"
        description="This module will include WhatsApp API integration, bulk messaging, automated responses, and conversation history tracking."
        icon={MessageCircle}
      />
    </div>
  );
}
