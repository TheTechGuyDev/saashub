import {
  LayoutDashboard,
  Users,
  DollarSign,
  TrendingUp,
  Building2,
  Ticket,
  FolderKanban,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats, useRecentActivity } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { isSuperAdmin, profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const superAdminStats = isSuperAdmin() ? [
    {
      title: "Total Companies",
      value: stats?.totalCompanies ?? 0,
      icon: Building2,
      color: "text-primary",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-accent",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "Total Employees",
      value: stats?.totalEmployees ?? 0,
      icon: Users,
      color: "text-info",
    },
  ] : [
    {
      title: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Total Employees",
      value: stats?.totalEmployees ?? 0,
      icon: Users,
      color: "text-accent",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Open Tickets",
      value: stats?.openTickets ?? 0,
      icon: Ticket,
      color: "text-warning",
    },
  ];

  return (
    <div>
      <PageHeader
        title={isSuperAdmin() ? "Super Admin Dashboard" : "Dashboard"}
        description={isSuperAdmin() 
          ? "Manage all companies and users across the platform." 
          : `Welcome back${profile?.full_name ? `, ${profile.full_name}` : ''}! Here's an overview of your business.`}
        icon={LayoutDashboard}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {superAdminStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity. Start by adding customers or creating projects.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              {isSuperAdmin() ? "Platform Overview" : "Quick Stats"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <p className="text-sm font-medium">Total Revenue</p>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </div>
                  <span className="text-lg font-semibold text-success">
                    {formatCurrency(stats?.totalRevenue ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <p className="text-sm font-medium">Open Tickets</p>
                    <p className="text-xs text-muted-foreground">Needs attention</p>
                  </div>
                  <span className={`text-lg font-semibold ${(stats?.openTickets ?? 0) > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                    {stats?.openTickets ?? 0}
                  </span>
                </div>
                {isSuperAdmin() && (
                  <>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <p className="text-sm font-medium">Registered Companies</p>
                        <p className="text-xs text-muted-foreground">Active tenants</p>
                      </div>
                      <span className="text-lg font-semibold text-primary">
                        {stats?.totalCompanies ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Platform Users</p>
                        <p className="text-xs text-muted-foreground">All companies</p>
                      </div>
                      <span className="text-lg font-semibold text-accent">
                        {stats?.totalUsers ?? 0}
                      </span>
                    </div>
                  </>
                )}
                {!isSuperAdmin() && (
                  <>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <p className="text-sm font-medium">Active Projects</p>
                        <p className="text-xs text-muted-foreground">In progress</p>
                      </div>
                      <span className="text-lg font-semibold text-primary">
                        {stats?.activeProjects ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Team Size</p>
                        <p className="text-xs text-muted-foreground">Active employees</p>
                      </div>
                      <span className="text-lg font-semibold text-accent">
                        {stats?.totalEmployees ?? 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
