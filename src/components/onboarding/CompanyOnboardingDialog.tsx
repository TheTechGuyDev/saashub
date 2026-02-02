import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Rocket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompanyOnboarding } from "@/hooks/useCompanyOnboarding";

const companySchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyOnboardingDialogProps {
  open: boolean;
  onComplete?: () => void;
}

export function CompanyOnboardingDialog({ open, onComplete }: CompanyOnboardingDialogProps) {
  const { createCompany, isLoading } = useCompanyOnboarding();
  const [step, setStep] = useState(1);

  // Check for pending company name from signup
  const pendingCompanyName = localStorage.getItem("pending_company_name");

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: { companyName: pendingCompanyName || "" },
  });

  // If there's a pending company name, auto-create it
  useEffect(() => {
    if (open && pendingCompanyName) {
      localStorage.removeItem("pending_company_name");
      createCompany(pendingCompanyName).then((result) => {
        if (result) {
          onComplete?.();
        }
      });
    }
  }, [open, pendingCompanyName]);

  const onSubmit = async (data: CompanyFormData) => {
    const result = await createCompany(data.companyName);
    if (result) {
      onComplete?.();
    }
  };

  // If auto-creating, show loading
  if (pendingCompanyName && isLoading) {
    return (
      <Dialog open={open}>
        <DialogContent className="sm:max-w-lg" hideCloseButton>
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-foreground border-t-transparent" />
            </div>
            <DialogTitle className="text-2xl">Setting Up Your Company</DialogTitle>
            <DialogDescription>
              Please wait while we create your company...
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg" hideCloseButton>
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4">
            {step === 1 ? (
              <Rocket className="h-8 w-8 text-primary-foreground" />
            ) : (
              <Building2 className="h-8 w-8 text-primary-foreground" />
            )}
          </div>
          <DialogTitle className="text-2xl">
            {step === 1 ? "Welcome to SaasHub! 🎉" : "Create Your Company"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Let's get you set up in just a moment. You'll be the admin of your company."
              : "Enter your company name to get started. You can change this later."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium">Create your company</p>
                  <p className="text-sm text-muted-foreground">
                    Set up your company profile to start using SaasHub
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium">Become the Company Admin</p>
                  <p className="text-sm text-muted-foreground">
                    You'll have full access to manage your company's data
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium">Invite your team</p>
                  <p className="text-sm text-muted-foreground">
                    Add staff members and assign roles as needed
                  </p>
                </div>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={() => setStep(2)}>
              Let's Get Started
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Enter your company name"
                {...form.register("companyName")}
                className="h-12"
                autoFocus
              />
              {form.formState.errors.companyName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.companyName.message}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </div>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Create Company
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
