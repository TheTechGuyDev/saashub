import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";

export function CompanyDetailsTab() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const { data: company, isLoading } = useQuery({
    queryKey: ["my-company", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.company_id,
  });

  useEffect(() => {
    if (company) {
      setName(company.name ?? "");
      setLogoUrl(company.logo_url ?? "");
    }
  }, [company]);

  const save = useMutation({
    mutationFn: async () => {
      if (!profile?.company_id) throw new Error("No company");
      const { error } = await supabase
        .from("companies")
        .update({ name, logo_url: logoUrl || null })
        .eq("id", profile.company_id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Company updated" });
      qc.invalidateQueries({ queryKey: ["my-company"] });
    },
    onError: (err: any) =>
      toast({ variant: "destructive", title: "Failed to update", description: err.message }),
  });

  if (!profile?.company_id) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          You haven't set up a company yet. Use the "Setup company" option in your profile menu.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" /> Company Details
        </CardTitle>
        <CardDescription>Update your company name and logo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-xl">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="company-name">Company name</Label>
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-logo">Logo URL</Label>
              <Input
                id="company-logo"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !name.trim()}>
              {save.isPending ? "Saving..." : "Save changes"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}