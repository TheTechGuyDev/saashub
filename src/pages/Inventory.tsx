import { Package } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function Inventory() {
  return (
    <div>
      <PageHeader
        title="Inventory Management"
        description="Track and manage inventory items."
        icon={Package}
        action={{
          label: "Add Item",
          onClick: () => console.log("Add item"),
        }}
      />
      <PlaceholderContent
        title="Inventory Module Coming Soon"
        description="This module will include item tracking, stock levels, purchase orders, and inventory reports."
        icon={Package}
      />
    </div>
  );
}
