import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { Plus, Check, X, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeaveRequests } from "@/hooks/useEmployees";
import { useAuth } from "@/contexts/AuthContext";
import { LeaveRequestDialog } from "./LeaveRequestDialog";
import type { Database } from "@/integrations/supabase/types";

type LeaveStatus = Database["public"]["Enums"]["leave_status"];
type LeaveType = Database["public"]["Enums"]["leave_type"];

const statusColors: Record<LeaveStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const leaveTypeLabels: Record<LeaveType, string> = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  personal: "Personal Leave",
  unpaid: "Unpaid Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
};

interface LeaveRequestListProps {
  employeeId?: string;
  companyId?: string;
}

export function LeaveRequestList({ employeeId, companyId }: LeaveRequestListProps) {
  const { leaveRequests, isLoading, updateLeaveStatus } = useLeaveRequests();
  const { isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const calculateDays = (start: string, end: string) => {
    return differenceInDays(new Date(end), new Date(start)) + 1;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Leave Requests</h3>
        {employeeId && (
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Request Leave
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {leaveRequests.filter((r: any) => r.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">
                  {leaveRequests.filter((r: any) => r.status === "approved").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30">
                <X className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">
                  {leaveRequests.filter((r: any) => r.status === "rejected").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden sm:table-cell">Dates</TableHead>
                <TableHead className="hidden md:table-cell">Days</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin() && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : leaveRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                leaveRequests.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.employees?.full_name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {leaveTypeLabels[request.leave_type as LeaveType]}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(request.start_date), "MMM d")} - {format(new Date(request.end_date), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {calculateDays(request.start_date, request.end_date)} days
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[request.status as LeaveStatus]} variant="secondary">
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    {isAdmin() && (
                      <TableCell className="text-right">
                        {request.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => updateLeaveStatus.mutate({ id: request.id, status: "approved" })}
                              disabled={updateLeaveStatus.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => updateLeaveStatus.mutate({ id: request.id, status: "rejected" })}
                              disabled={updateLeaveStatus.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Leave Request Dialog */}
      {employeeId && companyId && (
        <LeaveRequestDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          employeeId={employeeId}
          companyId={companyId}
        />
      )}
    </div>
  );
}
