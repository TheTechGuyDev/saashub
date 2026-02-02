import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects, Project } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

export function ProjectDialog({ open, onOpenChange, project }: ProjectDialogProps) {
  const { profile } = useAuth();
  const { createProject, updateProject } = useProjects();
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      status: project?.status || "planning",
      start_date: project?.start_date || "",
      end_date: project?.end_date || "",
      budget: project?.budget?.toString() || "",
    },
  });

  const onSubmit = (data: any) => {
    const projectData = {
      name: data.name,
      description: data.description || null,
      status: data.status,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      budget: data.budget ? parseFloat(data.budget) : null,
      company_id: profile?.company_id || "",
      created_by: profile?.id || null,
    };

    if (project) {
      updateProject.mutate({ id: project.id, ...projectData });
    } else {
      createProject.mutate(projectData);
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" {...register("name", { required: true })} placeholder="Enter project name" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Project description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={watch("status")} onValueChange={(v: "planning" | "active" | "on_hold" | "completed" | "cancelled") => setValue("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="budget">Budget (₦)</Label>
              <Input id="budget" type="number" {...register("budget")} placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" {...register("start_date")} />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" type="date" {...register("end_date")} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{project ? "Update" : "Create"} Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
