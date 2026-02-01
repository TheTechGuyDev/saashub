import { FileText } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function Documents() {
  return (
    <div>
      <PageHeader
        title="Document Management"
        description="Upload, organize, and share documents."
        icon={FileText}
        action={{
          label: "Upload Document",
          onClick: () => console.log("Upload document"),
        }}
      />
      <PlaceholderContent
        title="Documents Module Coming Soon"
        description="This module will include file upload, folder organization, version control, and sharing capabilities."
        icon={FileText}
      />
    </div>
  );
}
