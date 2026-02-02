import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, GripVertical } from "lucide-react";
import { Task, useTasks, Project } from "@/hooks/useProjects";
import { TaskDialog } from "./TaskDialog";

const columns = [
  { id: "todo", label: "To Do", color: "bg-muted" },
  { id: "in_progress", label: "In Progress", color: "bg-info/10" },
  { id: "review", label: "Review", color: "bg-warning/10" },
  { id: "done", label: "Done", color: "bg-success/10" },
];

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

interface TaskBoardProps {
  tasks: Task[];
  isLoading: boolean;
  projects: Project[];
}

export function TaskBoard({ tasks, isLoading, projects }: TaskBoardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const { updateTask } = useTasks();

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    updateTask.mutate({ id: taskId, status: status as Task["status"] });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-96 w-full" />)}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          return (
            <Card 
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className={column.color}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {column.label}
                  <Badge variant="secondary">{columnTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 min-h-[200px]">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setEditTask(task)}
                    className="p-3 bg-background rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={priorityColors[task.priority]} variant="outline">
                            {task.priority}
                          </Badge>
                          {task.employees?.full_name && (
                            <span className="text-xs text-muted-foreground">
                              {task.employees.full_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No tasks
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <TaskDialog
        open={showDialog || !!editTask}
        onOpenChange={(open) => {
          if (!open) {
            setShowDialog(false);
            setEditTask(null);
          }
        }}
        task={editTask}
        projects={projects}
      />
    </>
  );
}
