import { useState } from "react";
import { UsersRound, Briefcase, Clock, Calendar } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeList } from "@/components/staff/EmployeeList";
import { EmployeeDialog } from "@/components/staff/EmployeeDialog";
import { AttendanceTable } from "@/components/staff/AttendanceTable";
import { LeaveRequestList } from "@/components/staff/LeaveRequestList";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type Employee = Database["public"]["Tables"]["employees"]["Row"];

export default function StaffManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { employees } = useEmployees();
  const { profile } = useAuth();

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    onLeave: employees.filter((e) => e.status === "on_leave").length,
    departments: new Set(employees.map((e) => e.department).filter(Boolean)).size,
  };

  // Find current user's employee record
  const currentEmployee = employees.find((e) => e.user_id === profile?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Manage employees, attendance, and performance."
        icon={UsersRound}
        action={{
          label: "Add Employee",
          onClick: () => {
            setSelectedEmployee(null);
            setDialogOpen(true);
          },
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <UsersRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold">{stats.onLeave}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{stats.departments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directory">Employee Directory</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <EmployeeList
            onAddEmployee={() => {
              setSelectedEmployee(null);
              setDialogOpen(true);
            }}
            onEditEmployee={(employee) => {
              setSelectedEmployee(employee);
              setDialogOpen(true);
            }}
            onViewEmployee={(employee) => {
              setSelectedEmployee(employee);
              setDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTable 
            employeeId={currentEmployee?.id}
            companyId={profile?.company_id ?? undefined}
          />
        </TabsContent>

        <TabsContent value="leave">
          <LeaveRequestList
            employeeId={currentEmployee?.id}
            companyId={profile?.company_id ?? undefined}
          />
        </TabsContent>
      </Tabs>

      {/* Employee Dialog */}
      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={selectedEmployee}
      />
    </div>
  );
}
