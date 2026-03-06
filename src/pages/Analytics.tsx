import { BarChart3, Users, DollarSign, TrendingUp, Ticket } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useAdminData";
import { useCustomers } from "@/hooks/useCustomers";
import { useInvoices, useExpenses } from "@/hooks/useFinance";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function Analytics() {
  const { data: stats, isLoading } = useDashboardStats();
  const { customers } = useCustomers();
  const { invoices } = useInvoices();
  const { expenses } = useExpenses();

  const pipelineData = [
    { status: "lead", label: "Leads", count: customers.filter(c => c.status === "lead").length, color: "bg-blue-500" },
    { status: "opportunity", label: "Opportunities", count: customers.filter(c => c.status === "opportunity").length, color: "bg-purple-500" },
    { status: "deal", label: "Deals", count: customers.filter(c => c.status === "deal").length, color: "bg-orange-500" },
    { status: "closed_won", label: "Won", count: customers.filter(c => c.status === "closed_won").length, color: "bg-green-500" },
    { status: "closed_lost", label: "Lost", count: customers.filter(c => c.status === "closed_lost").length, color: "bg-red-500" },
  ];

  const totalPipeline = pipelineData.reduce((sum, d) => sum + d.count, 0);
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const paidInvoices = invoices.filter(i => i.status === "paid").length;
  const overdueInvoices = invoices.filter(i => i.status === "overdue").length;

  return (
    <div>
      <PageHeader
        title="Data Analysis"
        description="Real-time insights from your business data."
        icon={BarChart3}
      />

      {/* Key Metrics */}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold">₦{totalExpenses.toLocaleString()}</span>
            </div>
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

      {/* Sales Pipeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalPipeline > 0 ? (
            <div className="space-y-4">
              <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                {pipelineData.map((stage) => (
                  <div
                    key={stage.status}
                    className={`${stage.color} transition-all`}
                    style={{ width: `${(stage.count / totalPipeline) * 100}%` }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-5 gap-4">
                {pipelineData.map((stage) => (
                  <div key={stage.status} className="text-center">
                    <p className="text-2xl font-bold">{stage.count}</p>
                    <p className="text-sm text-muted-foreground">{stage.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No customer data yet. Add customers in the CRM to see pipeline analytics.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Invoice & Finance Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Invoices</span>
                  <span className="font-medium">{invoices.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium text-success">{paidInvoices}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overdue</span>
                  <span className="font-medium text-destructive">{overdueInvoices}</span>
                </div>
                {invoices.length > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Collection Rate</span>
                      <span>{((paidInvoices / invoices.length) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(paidInvoices / invoices.length) * 100} className="h-2" />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No invoices yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Employees</span>
                  <span className="font-medium">{stats?.totalEmployees ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Projects</span>
                  <span className="font-medium">{stats?.activeProjects ?? 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
