import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function CompaniesTab() {
  const { data: companies, isLoading } = useQuery({
    queryKey: ["admin-companies-detailed"],
    queryFn: async () => {
      const { data: companiesData, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      // Get counts for each company
      const companiesWithCounts = await Promise.all(
        companiesData.map(async (company) => {
          const [profilesResult, employeesResult, customersResult] = await Promise.all([
            supabase.from("profiles").select("id", { count: "exact", head: true }).eq("company_id", company.id),
            supabase.from("employees").select("id", { count: "exact", head: true }).eq("company_id", company.id),
            supabase.from("customers").select("id", { count: "exact", head: true }).eq("company_id", company.id),
          ]);

          return {
            ...company,
            usersCount: profilesResult.count ?? 0,
            employeesCount: employeesResult.count ?? 0,
            customersCount: customersResult.count ?? 0,
          };
        })
      );

      return companiesWithCounts;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            All Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          All Companies ({companies?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {companies && companies.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={company.name} 
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      {company.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{company.slug}</Badge>
                  </TableCell>
                  <TableCell>{company.usersCount}</TableCell>
                  <TableCell>{company.employeesCount}</TableCell>
                  <TableCell>{company.customersCount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(company.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No companies registered yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Companies will appear here when users sign up and create their organizations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
