import { Wallet } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function Finance() {
  return (
    <div>
      <PageHeader
        title="Finance & Settlements"
        description="Manage billing, invoicing, and financial reports."
        icon={Wallet}
        action={{
          label: "New Invoice",
          onClick: () => console.log("New invoice"),
        }}
      />
      <PlaceholderContent
        title="Finance Module Coming Soon"
        description="This module will include invoicing, payment integration with Paystack, expense tracking, and financial reports."
        icon={Wallet}
      />
    </div>
  );
}
