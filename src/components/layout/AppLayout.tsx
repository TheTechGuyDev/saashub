import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyOnboardingDialog, OnboardingTooltips } from "@/components/onboarding";
import { Button } from "@/components/ui/button";
import { Building2, Rocket } from "lucide-react";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, roles, loading } = useAuth();

  // Check if user needs company onboarding (not super_admin and no company)
  const isSuperAdmin = roles.includes("super_admin");
  const needsOnboarding = !loading && !isSuperAdmin && !profile?.company_id;
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Auto-open when user needs onboarding; allow dismiss + manual reopen
  useEffect(() => {
    if (needsOnboarding) setOnboardingOpen(true);
  }, [needsOnboarding]);

  return (
    <div className="min-h-screen bg-background">
      {/* Company Onboarding Dialog */}
      <CompanyOnboardingDialog
        open={onboardingOpen && needsOnboarding}
        onOpenChange={setOnboardingOpen}
      />

      {/* Onboarding Tooltips for new company users */}
      <OnboardingTooltips />

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
          <AppSidebar
            collapsed={false}
            onToggle={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Header */}
      <AppHeader
        sidebarCollapsed={sidebarCollapsed}
        onMobileMenuToggle={() => setMobileMenuOpen(true)}
      />

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <div className="p-6">
          {needsOnboarding && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5 p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Finish setting up your company</p>
                  <p className="text-sm text-muted-foreground">
                    Create your company profile to unlock the full dashboard and start adding staff.
                  </p>
                </div>
              </div>
              <Button onClick={() => setOnboardingOpen(true)}>
                <Building2 className="h-4 w-4 mr-2" />
                Setup your company
              </Button>
            </div>
          )}
          <Outlet context={{ needsOnboarding, openOnboarding: () => setOnboardingOpen(true) }} />
        </div>
      </main>
    </div>
  );
}
