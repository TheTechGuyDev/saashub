import { useState } from "react";
import { Users, TrendingUp, DollarSign, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerList } from "@/components/crm/CustomerList";
import { CustomerDialog } from "@/components/crm/CustomerDialog";
import { SalesPipeline } from "@/components/crm/SalesPipeline";
import { CustomerDetail } from "@/components/crm/CustomerDetail";
import { useCustomers } from "@/hooks/useCustomers";
import type { Database } from "@/integrations/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

export default function CRM() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const { customers } = useCustomers();

  const stats = {
    total: customers.length,
    leads: customers.filter((c) => c.status === "lead").length,
    pipeline: customers
      .filter((c) => ["opportunity", "deal"].includes(c.status))
      .reduce((acc, c) => acc + (Number(c.value) || 0), 0),
    won: customers
      .filter((c) => c.status === "closed_won")
      .reduce((acc, c) => acc + (Number(c.value) || 0), 0),
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  // If viewing a customer detail, show that instead
  if (viewingCustomer) {
    return (
      <CustomerDetail
        customer={viewingCustomer}
        onBack={() => setViewingCustomer(null)}
        onEdit={() => {
          setSelectedCustomer(viewingCustomer);
          setDialogOpen(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM"
        description="Manage your customers, leads, and sales pipeline."
        icon={Users}
        action={{
          label: "Add Customer",
          onClick: () => {
            setSelectedCustomer(null);
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
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Leads</p>
                <p className="text-2xl font-bold">{stats.leads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.pipeline)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Won Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.won)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Customer List</TabsTrigger>
          <TabsTrigger value="pipeline">Sales Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <CustomerList
            onAddCustomer={() => {
              setSelectedCustomer(null);
              setDialogOpen(true);
            }}
            onEditCustomer={(customer) => {
              setSelectedCustomer(customer);
              setDialogOpen(true);
            }}
            onViewCustomer={setViewingCustomer}
          />
        </TabsContent>

        <TabsContent value="pipeline">
          <SalesPipeline onViewCustomer={setViewingCustomer} />
        </TabsContent>
      </Tabs>

      {/* Customer Dialog */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
      />
    </div>
  );
}
