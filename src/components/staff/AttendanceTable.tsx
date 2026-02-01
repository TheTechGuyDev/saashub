import { format } from "date-fns";
import { Clock, LogIn, LogOut, CheckCircle, XCircle, Clock4, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAttendance } from "@/hooks/useEmployees";
import type { Database } from "@/integrations/supabase/types";

type AttendanceStatus = Database["public"]["Enums"]["attendance_status"];

const statusConfig: Record<AttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present: { 
    label: "Present", 
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: <CheckCircle className="h-4 w-4" />
  },
  absent: { 
    label: "Absent", 
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: <XCircle className="h-4 w-4" />
  },
  late: { 
    label: "Late", 
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <Clock4 className="h-4 w-4" />
  },
  half_day: { 
    label: "Half Day", 
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: <AlertCircle className="h-4 w-4" />
  },
};

interface AttendanceTableProps {
  employeeId?: string;
  companyId?: string;
}

export function AttendanceTable({ employeeId, companyId }: AttendanceTableProps) {
  const { attendance, isLoading, clockIn, clockOut } = useAttendance();

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return format(new Date(time), "h:mm a");
  };

  const handleClockIn = () => {
    if (employeeId && companyId) {
      clockIn.mutate({ employeeId, companyId });
    }
  };

  const handleClockOut = () => {
    if (employeeId) {
      clockOut.mutate({ employeeId });
    }
  };

  // Find today's record for current employee
  const today = new Date().toISOString().split("T")[0];
  const todayRecord = attendance.find(
    (record: any) => record.employee_id === employeeId && record.date === today
  );

  return (
    <div className="space-y-4">
      {/* Clock In/Out Card */}
      {employeeId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Clock In</p>
                  <p className="font-medium">{formatTime(todayRecord?.clock_in)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clock Out</p>
                  <p className="font-medium">{formatTime(todayRecord?.clock_out)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleClockIn}
                  disabled={!!todayRecord?.clock_in || clockIn.isPending}
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Clock In
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClockOut}
                  disabled={!todayRecord?.clock_in || !!todayRecord?.clock_out || clockOut.isPending}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Clock Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead className="hidden sm:table-cell">Clock In</TableHead>
                <TableHead className="hidden sm:table-cell">Clock Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {format(new Date(record.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{record.employees?.full_name || "Unknown"}</p>
                        {record.employees?.employee_number && (
                          <p className="text-xs text-muted-foreground">
                            #{record.employees.employee_number}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatTime(record.clock_in)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatTime(record.clock_out)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[record.status as AttendanceStatus].color} variant="secondary">
                        <span className="flex items-center gap-1">
                          {statusConfig[record.status as AttendanceStatus].icon}
                          {statusConfig[record.status as AttendanceStatus].label}
                        </span>
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
