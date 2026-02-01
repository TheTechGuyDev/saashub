import { BookOpen } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function KnowledgeBase() {
  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        description="Manage FAQs and documentation."
        icon={BookOpen}
        action={{
          label: "New Article",
          onClick: () => console.log("New article"),
        }}
      />
      <PlaceholderContent
        title="Knowledge Base Module Coming Soon"
        description="This module will include FAQ management, article creation, search functionality, and categories."
        icon={BookOpen}
      />
    </div>
  );
}
