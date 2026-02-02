import { useState } from "react";
import { BarChart3, Users, DollarSign, TrendingUp, Ticket, Plus, Settings, Database, PieChart, LineChart } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useAdminData";
import { useCustomers } from "@/hooks/useCustomers";
import { useInvoices, useExpenses } from "@/hooks/useFinance";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DataSource {
  id: string;
  name: string;
  type: "manual" | "automated" | "api";
  lastUpdated: Date;
  recordCount: number;
  status: "active" | "paused";
}

interface MetricTarget {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
}

export default function Analytics() {
  const { data: stats, isLoading } = useDashboardStats();
  const { customers } = useCustomers();
  const { invoices } = useInvoices();
  const { expenses } = useExpenses();
  const [showAddSource, setShowAddSource] = useState(false);
  const [showAddTarget, setShowAddTarget] = useState(false);

  // Data sources for collection
  const [dataSources, setDataSources] = useState<DataSource[]>([
    { id: "1", name: "Customer Data", type: "automated", lastUpdated: new Date(), recordCount: customers.length, status: "active" },
    { id: "2", name: "Sales Pipeline", type: "automated", lastUpdated: new Date(), recordCount: customers.filter(c => ["opportunity", "deal"].includes(c.status)).length, status: "active" },
    { id: "3", name: "Financial Records", type: "automated", lastUpdated: new Date(), recordCount: invoices.length + expenses.length, status: "active" },
  ]);

  // Metric targets for monitoring
  const [metricTargets, setMetricTargets] = useState<MetricTarget[]>([
    { id: "1", name: "Monthly Revenue", current: stats?.totalRevenue || 0, target: 100000, unit: "₦" },
    { id: "2", name: "New Customers", current: customers.filter(c => c.status === "lead").length, target: 50, unit: "" },
    { id: "3", name: "Ticket Resolution", current: 85, target: 95, unit: "%" },
    { id: "4", name: "Employee Satisfaction", current: 78, target: 90, unit: "%" },
  ]);

  const pipelineData = [
    { status: "lead", label: "Leads", count: customers.filter(c => c.status === "lead").length, color: "bg-blue-500" },
    { status: "opportunity", label: "Opportunities", count: customers.filter(c => c.status === "opportunity").length, color: "bg-purple-500" },
    { status: "deal", label: "Deals", count: customers.filter(c => c.status === "deal").length, color: "bg-orange-500" },
    { status: "closed_won", label: "Won", count: customers.filter(c => c.status === "closed_won").length, color: "bg-green-500" },
    { status: "closed_lost", label: "Lost", count: customers.filter(c => c.status === "closed_lost").length, color: "bg-red-500" },
  ];

  const totalPipeline = pipelineData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <PageHeader
        title="Data Analysis"
        description="Collect, analyze, and monitor your business data."
        icon={BarChart3}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collection">Data Collection</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
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

          {/* Sales Pipeline Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sales Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                  {pipelineData.map((stage) => (
                    <div
                      key={stage.status}
                      className={`${stage.color} transition-all`}
                      style={{ width: `${totalPipeline > 0 ? (stage.count / totalPipeline) * 100 : 20}%` }}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Collection Tab */}
        <TabsContent value="collection" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Data Sources</h3>
              <p className="text-sm text-muted-foreground">Configure where your analytics data comes from</p>
            </div>
            <Button onClick={() => setShowAddSource(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Data Source
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {dataSources.map((source) => (
              <Card key={source.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{source.name}</CardTitle>
                    <Badge variant={source.status === "active" ? "default" : "secondary"}>
                      {source.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span className="capitalize">{source.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Records</span>
                      <span>{source.recordCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{source.lastUpdated.toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Manual Data Entry
              </CardTitle>
              <CardDescription>
                Add custom data points for tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Metric Name</Label>
                  <Input placeholder="e.g., Website Visitors" />
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input type="number" placeholder="e.g., 1500" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Data Point
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Metric Targets</h3>
              <p className="text-sm text-muted-foreground">Track progress towards your business goals</p>
            </div>
            <Button onClick={() => setShowAddTarget(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Target
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {metricTargets.map((metric) => {
              const progress = Math.min((metric.current / metric.target) * 100, 100);
              const isOnTrack = progress >= 70;
              
              return (
                <Card key={metric.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{metric.name}</CardTitle>
                      <Badge variant={isOnTrack ? "default" : "destructive"}>
                        {isOnTrack ? "On Track" : "Behind"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>
                          {metric.unit}{metric.current.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          Target: {metric.unit}{metric.target.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        {progress.toFixed(0)}% of target achieved
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Analytics Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Refresh Interval</Label>
                  <Select defaultValue="realtime">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="5min">Every 5 minutes</SelectItem>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Date Range</Label>
                  <Select defaultValue="30days">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="year">This year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency Display</Label>
                  <Select defaultValue="ngn">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ngn">Nigerian Naira (₦)</SelectItem>
                      <SelectItem value="usd">US Dollar ($)</SelectItem>
                      <SelectItem value="eur">Euro (€)</SelectItem>
                      <SelectItem value="gbp">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Data Source Dialog */}
      <Dialog open={showAddSource} onOpenChange={setShowAddSource}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Data Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Source Name</Label>
              <Input placeholder="e.g., Website Analytics" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="automated">Automated (Internal)</SelectItem>
                  <SelectItem value="api">API Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddSource(false)}>Cancel</Button>
              <Button onClick={() => setShowAddSource(false)}>Add Source</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Target Dialog */}
      <Dialog open={showAddTarget} onOpenChange={setShowAddTarget}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Metric Target</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Metric Name</Label>
              <Input placeholder="e.g., Monthly Sales" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Value</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Target Value</Label>
                <Input type="number" placeholder="100" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Unit (optional)</Label>
              <Input placeholder="e.g., ₦, %, items" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddTarget(false)}>Cancel</Button>
              <Button onClick={() => setShowAddTarget(false)}>Add Target</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
