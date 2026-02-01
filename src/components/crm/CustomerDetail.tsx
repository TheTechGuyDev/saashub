import { useState } from "react";
import { format } from "date-fns";
import { 
  Mail, Phone, Building2, DollarSign, Calendar, Edit, 
  ArrowLeft, MessageSquare, PhoneCall, Video, StickyNote,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerActivities } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type ActivityType = Database["public"]["Enums"]["activity_type"];

interface CustomerDetailProps {
  customer: Customer;
  onBack: () => void;
  onEdit: () => void;
}

const statusColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  opportunity: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  deal: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  closed_won: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  closed_lost: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const activityIcons: Record<ActivityType, React.ReactNode> = {
  call: <PhoneCall className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <Video className="h-4 w-4" />,
  note: <StickyNote className="h-4 w-4" />,
};

const activityColors: Record<ActivityType, string> = {
  call: "bg-green-100 text-green-600 dark:bg-green-900/30",
  email: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
  meeting: "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
  note: "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
};

export function CustomerDetail({ customer, onBack, onEdit }: CustomerDetailProps) {
  const { profile } = useAuth();
  const { activities, isLoading, createActivity } = useCustomerActivities(customer.id);
  const [activityType, setActivityType] = useState<ActivityType>("note");
  const [activityDescription, setActivityDescription] = useState("");
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  const handleAddActivity = async () => {
    if (!activityDescription.trim() || !profile?.company_id) return;

    await createActivity.mutateAsync({
      customer_id: customer.id,
      company_id: profile.company_id,
      type: activityType,
      description: activityDescription,
    });

    setActivityDescription("");
    setIsAddingActivity(false);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Button>
        <Button onClick={onEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Customer
        </Button>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {customer.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{customer.name}</h1>
                  <Badge className={statusColors[customer.status]} variant="secondary">
                    {customer.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                {customer.company_name && (
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <Building2 className="h-4 w-4" />
                    {customer.company_name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                      {customer.email}
                    </a>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${customer.phone}`} className="text-primary hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatCurrency(Number(customer.value))}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Added {format(new Date(customer.created_at), "MMM d, yyyy")}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          {/* Add Activity */}
          {!isAddingActivity ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setActivityType("call"); setIsAddingActivity(true); }}>
                <PhoneCall className="h-4 w-4 mr-1" /> Log Call
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setActivityType("email"); setIsAddingActivity(true); }}>
                <Mail className="h-4 w-4 mr-1" /> Log Email
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setActivityType("meeting"); setIsAddingActivity(true); }}>
                <Video className="h-4 w-4 mr-1" /> Log Meeting
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setActivityType("note"); setIsAddingActivity(true); }}>
                <StickyNote className="h-4 w-4 mr-1" /> Add Note
              </Button>
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => setIsAddingActivity(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder="Describe the activity..."
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsAddingActivity(false)}>
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleAddActivity}
                    disabled={!activityDescription.trim() || createActivity.isPending}
                  >
                    {createActivity.isPending ? "Saving..." : "Save Activity"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No activities yet. Log your first interaction above.
                </p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity: any) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activityColors[activity.type as ActivityType]}`}>
                        {activityIcons[activity.type as ActivityType]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium capitalize">{activity.type}</span>
                          <span className="text-muted-foreground">
                            {format(new Date(activity.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{activity.description}</p>
                        {activity.profiles?.full_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            by {activity.profiles.full_name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.notes ? (
                <p className="whitespace-pre-wrap">{customer.notes}</p>
              ) : (
                <p className="text-muted-foreground">No notes added yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
