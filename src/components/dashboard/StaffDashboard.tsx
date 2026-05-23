import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckSquare, Users, Clock, Calendar as CalendarIcon, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEmployees, useAttendance } from "@/hooks/useEmployees";
import { useStaffActivities, useLogActivity } from "@/hooks/useStaffActivities";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type TaskStatus = Database["public"]["Enums"]["task_status"];

export function StaffDashboard() {
  const { user, profile } = useAuth();
  const { employees } = useEmployees();
  const { clockIn, clockOut } = useAttendance();
  const logActivity = useLogActivity();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const currentEmployee = useMemo(
    () => employees.find((e) => e.user_id === user?.id),
    [employees, user?.id],
  );

  // Log login activity once on mount
  useEffect(() => {
    if (user?.id && profile?.company_id) {
      const key = `staff_login_logged_${user.id}_${new Date().toDateString()}`;
      if (!sessionStorage.getItem(key)) {
        logActivity.mutate({ activity_type: "login", description: "Signed in" });
        sessionStorage.setItem(key, "1");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile?.company_id]);

  const { data: myTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["my-tasks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", user!.id)
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const updates: any = { status };
      if (status === "done") updates.completed_at = new Date().toISOString();
      else updates.completed_at = null;
      const { error } = await supabase.from("tasks").update(updates).eq("id", id);
      if (error) throw error;
      return { id, status };
    },
    onSuccess: ({ id, status }) => {
      qc.invalidateQueries({ queryKey: ["my-tasks", user?.id] });
      logActivity.mutate({
        activity_type: "task_status_change",
        description: `Updated task status to ${status}`,
        entity_type: "task",
        entity_id: id,
        metadata: { status },
      });
    },
    onError: (e: Error) => {
      toast({ variant: "destructive", title: "Failed to update task", description: e.message });
    },
  });

  const addTaskNote = async (taskId: string) => {
    const text = (noteDrafts[taskId] ?? "").trim();
    if (!text) return;
    await logActivity.mutateAsync({
      activity_type: "task_note",
      description: text,
      entity_type: "task",
      entity_id: taskId,
    });
    setNoteDrafts((d) => ({ ...d, [taskId]: "" }));
    toast({ title: "Note added" });
  };

  const { data: myCustomers } = useQuery({
    queryKey: ["my-customers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("assigned_to", user!.id)
        .order("updated_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const { data: myAttendance } = useQuery({
    queryKey: ["my-attendance-today", currentEmployee?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("employee_id", currentEmployee!.id)
        .eq("date", today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentEmployee?.id,
  });

  const { data: activities, isLoading: activitiesLoading } = useStaffActivities({
    userId: user?.id,
    limit: 10,
  });

  const openTasks = (myTasks ?? []).filter((t) => t.status !== "done");
  const completedToday = (myTasks ?? []).filter(
    (t) => t.status === "done" && t.completed_at?.startsWith(new Date().toISOString().split("T")[0]),
  ).length;

  const handleClockIn = async () => {
    if (!currentEmployee || !profile?.company_id) return;
    await clockIn.mutateAsync({ employeeId: currentEmployee.id, companyId: profile.company_id });
    logActivity.mutate({ activity_type: "clock_in", description: "Clocked in" });
  };

  const handleClockOut = async () => {
    if (!currentEmployee) return;
    await clockOut.mutateAsync({ employeeId: currentEmployee.id });
    logActivity.mutate({ activity_type: "clock_out", description: "Clocked out" });
  };

  const stats = [
    { label: "Open Tasks", value: openTasks.length, icon: CheckSquare, color: "text-primary" },
    { label: "Completed Today", value: completedToday, icon: Activity, color: "text-success" },
    { label: "My Customers", value: myCustomers?.length ?? 0, icon: Users, color: "text-accent" },
    {
      label: "Status",
      value: myAttendance?.clock_in ? (myAttendance.clock_out ? "Off" : "In") : "Off",
      icon: Clock,
      color: myAttendance?.clock_in && !myAttendance?.clock_out ? "text-success" : "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance card */}
      {currentEmployee && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm">
              {myAttendance?.clock_in ? (
                <>
                  Clocked in at{" "}
                  <span className="font-medium">
                    {format(new Date(myAttendance.clock_in), "HH:mm")}
                  </span>
                  {myAttendance.clock_out && (
                    <>
                      {" "}· Out at{" "}
                      <span className="font-medium">
                        {format(new Date(myAttendance.clock_out), "HH:mm")}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">Not clocked in yet today.</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleClockIn}
                disabled={!!myAttendance?.clock_in || clockIn.isPending}
              >
                Clock In
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClockOut}
                disabled={!myAttendance?.clock_in || !!myAttendance?.clock_out || clockOut.isPending}
              >
                Clock Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* My Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" /> My Tasks
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/projects">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <Skeleton className="h-32" />
            ) : openTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No tasks assigned to you. Great job!
              </p>
            ) : (
              <ul className="space-y-3">
                {openTasks.slice(0, 6).map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-col gap-2 border-b border-border pb-3 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.due_date ? `Due ${format(new Date(t.due_date), "MMM d")}` : "No due date"}
                        </p>
                      </div>
                      <Select
                        value={t.status as string}
                        onValueChange={(v) => updateTaskStatus.mutate({ id: t.id, status: v as TaskStatus })}
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To do</SelectItem>
                          <SelectItem value="in_progress">In progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            Note
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-72">
                          <p className="text-sm font-medium mb-2">Add note to task</p>
                          <Textarea
                            rows={3}
                            value={noteDrafts[t.id] ?? ""}
                            onChange={(e) => setNoteDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                            placeholder="Progress, blockers, decisions..."
                          />
                          <div className="flex justify-end mt-2">
                            <Button size="sm" onClick={() => addTaskNote(t.id)} disabled={!(noteDrafts[t.id] ?? "").trim()}>
                              Save
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* My Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> My Customers
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/crm">Open CRM</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {(myCustomers ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No customers assigned to you yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {myCustomers!.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/my-customers/${c.id}`}
                      className="flex items-center justify-between border-b border-border pb-2 last:border-0 hover:bg-muted/40 rounded px-2 -mx-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.company_name ?? c.email ?? ""}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2 capitalize">
                        {String(c.status).replace("_", " ")}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> My Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <Skeleton className="h-24" />
          ) : (activities ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Your actions across the app will appear here.
            </p>
          ) : (
            <ul className="space-y-3">
              {activities!.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="capitalize">
                      {a.activity_type.replace("_", " ")}
                    </Badge>
                    <span className="text-sm truncate">{a.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}