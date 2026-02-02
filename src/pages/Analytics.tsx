import { BarChart3, Users, DollarSign, TrendingUp, Ticket } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useAdminData";
import { useCustomers } from "@/hooks/useCustomers";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
  const { data: stats, isLoading } = useDashboardStats();
  const { customers } = useCustomers();

  const pipelineData = [
    { status: "lead", label: "Leads", count: customers.filter(c => c.status === "lead").length },
    { status: "opportunity", label: "Opportunities", count: customers.filter(c => c.status === "opportunity").length },
    { status: "deal", label: "Deals", count: customers.filter(c => c.status === "deal").length },
    { status: "closed_won", label: "Won", count: customers.filter(c => c.status === "closed_won").length },
    { status: "closed_lost", label: "Lost", count: customers.filter(c => c.status === "closed_lost").length },
  ];

  return (
    <div>
      <PageHeader
        title="Data Analysis"
        description="Interactive dashboards with charts and KPIs."
        icon={BarChart3}
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats?.totalCustomers ?? 0}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold">{stats?.totalEmployees ?? 0}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold">₦{(stats?.totalRevenue ?? 0).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-warning" />
                <span className="text-2xl font-bold">{stats?.openTickets ?? 0}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {pipelineData.map((stage) => (
              <div key={stage.status} className="flex-1 min-w-[120px] p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{stage.count}</p>
                <p className="text-sm text-muted-foreground">{stage.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
