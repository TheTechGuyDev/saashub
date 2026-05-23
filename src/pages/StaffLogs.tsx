import { useEffect, useMemo, useState } from "react";
import { Activity, Download, CalendarIcon, X } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useStaffActivities } from "@/hooks/useStaffActivities";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDistanceToNow, format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function StaffLogs() {
  const { data: activities = [], isLoading } = useStaffActivities({ limit: 500 });
  const { employees } = useEmployees();
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Realtime subscription
  useEffect(() => {
    if (!profile?.company_id) return;
    const channel = supabase
      .channel("staff-activities-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "staff_activities", filter: `company_id=eq.${profile.company_id}` },
        () => {
          qc.invalidateQueries({ queryKey: ["staff-activities"] });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.company_id, qc]);

  const userMap = useMemo(() => {
    const m = new Map<string, string>();
    employees.forEach((e) => {
      if (e.user_id) m.set(e.user_id, e.full_name);
    });
    return m;
  }, [employees]);

  const activityTypes = useMemo(
    () => Array.from(new Set(activities.map((a) => a.activity_type))),
    [activities],
  );

  const statusValues = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => {
      const s = (a.metadata as any)?.status;
      if (s) set.add(String(s));
    });
    return Array.from(set);
  }, [activities]);

  const filtered = useMemo(() => activities.filter((a) => {
    if (typeFilter !== "all" && a.activity_type !== typeFilter) return false;
    if (userFilter !== "all" && a.user_id !== userFilter) return false;
    if (entityFilter !== "all" && a.entity_type !== entityFilter) return false;
    if (statusFilter !== "all" && (a.metadata as any)?.status !== statusFilter) return false;
    if (search && !a.description.toLowerCase().includes(search.toLowerCase())) return false;
    const created = new Date(a.created_at);
    if (dateFrom && isBefore(created, startOfDay(dateFrom))) return false;
    if (dateTo && isAfter(created, endOfDay(dateTo))) return false;
    return true;
  }), [activities, typeFilter, userFilter, entityFilter, statusFilter, search, dateFrom, dateTo]);

  const clearDates = () => { setDateFrom(undefined); setDateTo(undefined); };

  const exportCsv = () => {
    const rows = [
      ["Date", "User", "Type", "Description"],
      ...filtered.map((a) => [
        format(new Date(a.created_at), "yyyy-MM-dd HH:mm:ss"),
        userMap.get(a.user_id) ?? a.user_id,
        a.activity_type,
        a.description.replace(/"/g, '""'),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `staff-logs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Logs"
        description="Audit trail of every action taken by your team."
        icon={Activity}
        action={{ label: "Export CSV", onClick: exportCsv }}
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All staff</SelectItem>
                {employees
                  .filter((e) => e.user_id)
                  .map((e) => (
                    <SelectItem key={e.user_id!} value={e.user_id!}>
                      {e.full_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {activityTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Linked to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="project">Projects</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusValues.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal w-40", !dateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal w-40", !dateTo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "MMM d, yyyy") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={clearDates}>
                <X className="h-4 w-4 mr-1" /> Clear dates
              </Button>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No activity yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {userMap.get(a.user_id) ?? "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {a.activity_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{a.description}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}