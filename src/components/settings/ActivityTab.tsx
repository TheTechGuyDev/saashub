import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, UserPlus, Users, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ActivityTab() {
  const { data: recentSignups, isLoading: signupsLoading } = useQuery({
    queryKey: ["recent-signups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, companies:company_id(name)")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [todayUsers, weekUsers, todayCompanies, weekCompanies] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
        supabase.from("companies").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("companies").select("id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
      ]);

      return {
        usersToday: todayUsers.count ?? 0,
        usersThisWeek: weekUsers.count ?? 0,
        companiesToday: todayCompanies.count ?? 0,
        companiesThisWeek: weekCompanies.count ?? 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Users Today</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold">{stats?.usersToday}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Users This Week</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats?.usersThisWeek}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Companies Today</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold">{stats?.companiesToday}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Companies This Week</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-info" />
                <span className="text-2xl font-bold">{stats?.companiesThisWeek}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Signups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {signupsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentSignups && recentSignups.length > 0 ? (
            <div className="space-y-4">
              {recentSignups.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {(user.full_name ?? user.email ?? 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name ?? 'New User'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {user.companies?.name && (
                      <p className="text-sm font-medium">{user.companies.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent signups.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
