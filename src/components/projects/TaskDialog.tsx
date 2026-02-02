import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, useTasks, Project } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  projects: Project[];
}

export function TaskDialog({ open, onOpenChange, task, projects }: TaskDialogProps) {
  const { profile } = useAuth();
  const { createTask, updateTask, deleteTask } = useTasks();
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "todo",
      priority: task?.priority || "medium",
      project_id: task?.project_id || "",
      due_date: task?.due_date || "",
    },
  });

  const onSubmit = (data: any) => {
    const taskData = {
      title: data.title,
      description: data.description || null,
      status: data.status,
      priority: data.priority,
      project_id: data.project_id || null,
      due_date: data.due_date || null,
      company_id: profile?.company_id || "",
      assigned_to: null,
    };

    if (task) {
      updateTask.mutate({ id: task.id, ...taskData });
    } else {
      createTask.mutate(taskData);
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" {...register("title", { required: true })} placeholder="Enter task title" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Task description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={watch("status")} onValueChange={(v: "todo" | "in_progress" | "review" | "done") => setValue("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={watch("priority")} onValueChange={(v: "low" | "medium" | "high" | "urgent") => setValue("priority", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project_id">Project</Label>
              <Select value={watch("project_id") || ""} onValueChange={(v) => setValue("project_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" type="date" {...register("due_date")} />
            </div>
          </div>
          <div className="flex justify-between">
            {task && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => {
                  deleteTask.mutate(task.id);
                  onOpenChange(false);
                }}
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{task ? "Update" : "Create"} Task</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
