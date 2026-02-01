import {
  LayoutDashboard,
  Users,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Ticket,
  FolderKanban,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    changeType: "positive" as const,
    icon: DollarSign,
  },
  {
    title: "Active Customers",
    value: "2,350",
    change: "+180",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Sales",
    value: "12,234",
    change: "+19%",
    changeType: "positive" as const,
    icon: ShoppingCart,
  },
  {
    title: "Conversion Rate",
    value: "3.2%",
    change: "+0.5%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
];

const recentActivity = [
  { id: 1, action: "New lead created", user: "John Doe", time: "2 min ago" },
  { id: 2, action: "Invoice paid", user: "Jane Smith", time: "15 min ago" },
  { id: 3, action: "Task completed", user: "Mike Johnson", time: "1 hour ago" },
  { id: 4, action: "New customer signed up", user: "Sarah Williams", time: "2 hours ago" },
  { id: 5, action: "Project milestone reached", user: "Alex Brown", time: "3 hours ago" },
];

const pendingTasks = [
  { id: 1, title: "Review customer proposal", priority: "High", due: "Today" },
  { id: 2, title: "Follow up with leads", priority: "Medium", due: "Tomorrow" },
  { id: 3, title: "Prepare quarterly report", priority: "High", due: "This week" },
  { id: 4, title: "Update pricing page", priority: "Low", due: "Next week" },
];

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your business."
        icon={LayoutDashboard}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs ${
                  stat.changeType === "positive"
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {stat.change} from last month
              </p>
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
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === "High"
                        ? "bg-destructive/10 text-destructive"
                        : task.priority === "Medium"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
