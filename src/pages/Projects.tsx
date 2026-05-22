import { useState } from "react";
import { FolderKanban, Plus, LayoutGrid, List } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects, useTasks } from "@/hooks/useProjects";
import { ProjectList } from "@/components/projects/ProjectList";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { TaskBoard } from "@/components/projects/TaskBoard";
import { useAuth } from "@/contexts/AuthContext";

export default function Projects() {
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const { projects, isLoading: projectsLoading } = useProjects();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { isAdmin, isSuperAdmin } = useAuth();
  const canManage = isAdmin() || isSuperAdmin();

  return (
    <div>
      <PageHeader
        title={canManage ? "Project Management" : "My Projects & Tasks"}
        description={canManage ? "Manage projects, tasks, and milestones." : "View projects and tasks assigned to you."}
        icon={FolderKanban}
        action={canManage ? {
          label: "New Project",
          onClick: () => setShowProjectDialog(true),
        } : undefined}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Task Board
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <ProjectList projects={projects} isLoading={projectsLoading} />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskBoard tasks={tasks} isLoading={tasksLoading} projects={projects} />
        </TabsContent>
      </Tabs>

      <ProjectDialog
        open={showProjectDialog}
        onOpenChange={setShowProjectDialog}
      />
    </div>
  );
}
