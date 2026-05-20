import { useMemo, useState } from "react";
import { Activity, Download } from "lucide-react";
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
import { useStaffActivities } from "@/hooks/useStaffActivities";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDistanceToNow, format } from "date-fns";

export default function StaffLogs() {
  const { data: activities = [], isLoading } = useStaffActivities({ limit: 500 });
  const { employees } = useEmployees();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");

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

  const filtered = activities.filter((a) => {
    if (typeFilter !== "all" && a.activity_type !== typeFilter) return false;
    if (userFilter !== "all" && a.user_id !== userFilter) return false;
    if (search && !a.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const exportCsv = () => {
    const rows = [
      ["Date", "User", "Type", "Description"],
      ...filtered.map((a) => [
        format(new Date(a.created_at), "yyyy-MM-dd HH:mm:ss"),
        userMap.get(a.user_id) ?? a.user_id,
        a.activity_type,
        a.description.replaceAll('"', '""'),
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