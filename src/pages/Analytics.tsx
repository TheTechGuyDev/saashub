import { BarChart3 } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function Analytics() {
  return (
    <div>
      <PageHeader
        title="Data Analysis"
        description="Interactive dashboards with charts and KPIs."
        icon={BarChart3}
      />
      <PlaceholderContent
        title="Analytics Module Coming Soon"
        description="This module will include interactive dashboards, custom report builder, export options, and AI-powered insights."
        icon={BarChart3}
      />
    </div>
  );
}
