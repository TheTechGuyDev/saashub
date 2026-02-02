import { UserPlus, Target, Users, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers } from "@/hooks/useCustomers";

export default function CustomerAcquisition() {
  const { customers } = useCustomers();
  const leads = customers.filter(c => c.status === "lead");
  const conversions = customers.filter(c => c.status === "closed_won");
  const conversionRate = customers.length > 0 ? ((conversions.length / customers.length) * 100).toFixed(1) : 0;

  return (
    <div>
      <PageHeader
        title="Customer Acquisition"
        description="Manage leads, campaigns, and conversion funnels."
        icon={UserPlus}
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{leads.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold">{customers.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">{conversions.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-info" />
              <span className="text-2xl font-bold">{conversionRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Lead capture forms and campaign tracking coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
