import { FolderKanban } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function Projects() {
  return (
    <div>
      <PageHeader
        title="Project Management"
        description="Manage projects, tasks, and milestones."
        icon={FolderKanban}
        action={{
          label: "New Project",
          onClick: () => console.log("New project"),
        }}
      />
      <PlaceholderContent
        title="Project Management Module Coming Soon"
        description="This module will include project boards, Kanban views, task assignment, deadlines, and file sharing."
        icon={FolderKanban}
      />
    </div>
  );
}
