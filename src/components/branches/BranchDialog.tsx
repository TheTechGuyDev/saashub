import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/contexts/AuthContext";

type Branch = {
  id?: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  manager_id: string | null;
  is_headquarters: boolean;
};

type BranchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Branch | null;
};

export function BranchDialog({ open, onOpenChange, branch }: BranchDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { employees } = useEmployees();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Branch>({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    phone: "",
    email: "",
    manager_id: null,
    is_headquarters: false,
  });

  useEffect(() => {
    if (branch) {
      setFormData(branch);
    } else {
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        country: "",
        phone: "",
        email: "",
        manager_id: null,
        is_headquarters: false,
      });
    }
  }, [branch]);

  const saveMutation = useMutation({
    mutationFn: async (data: Branch) => {
      // Get user's company_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user?.id)
        .single();

      if (!profile?.company_id) throw new Error("Company not found");

      if (data.id) {
        // Update existing branch
        const { error } = await supabase
          .from("branches")
          .update({
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            country: data.country,
            phone: data.phone,
            email: data.email,
            manager_id: data.manager_id,
            is_headquarters: data.is_headquarters,
          })
          .eq("id", data.id);
        
        if (error) throw error;
      } else {
        // Create new branch
        const { error } = await supabase
          .from("branches")
          .insert({
            ...data,
            company_id: profile.company_id,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({ 
        title: branch ? "Branch updated" : "Branch created",
        description: "Branch saved successfully"
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to save branch",
        description: error.message 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{branch ? "Edit Branch" : "Create Branch"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Downtown Branch"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Manager</Label>
              <Select
                value={formData.manager_id || ""}
                onValueChange={(value) => setFormData({ ...formData, manager_id: value || null })}
              >
                <SelectTrigger id="manager">
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="branch@company.com"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state || ""}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="NY"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country || ""}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="USA"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="headquarters"
                checked={formData.is_headquarters}
                onCheckedChange={(checked) => setFormData({ ...formData, is_headquarters: checked })}
              />
              <Label htmlFor="headquarters">Headquarters</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Branch"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
