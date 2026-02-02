import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const ONBOARDING_STEPS = [
  {
    id: "dashboard",
    title: "Welcome to Your Dashboard",
    description: "This is your command center. See all your key metrics at a glance - customers, revenue, tickets, and more.",
    selector: "[data-tour='dashboard']",
    position: "bottom" as const,
  },
  {
    id: "crm",
    title: "Manage Your Customers",
    description: "The CRM module helps you track leads, opportunities, and deals. Drag customers through your sales pipeline.",
    selector: "[data-tour='crm']",
    position: "right" as const,
  },
  {
    id: "email",
    title: "Email Marketing",
    description: "Create and send email campaigns to your customers. Add customers in the CRM first, then create campaigns here.",
    selector: "[data-tour='email']",
    position: "right" as const,
  },
  {
    id: "staff",
    title: "Staff Management",
    description: "Track your employees, manage attendance, and handle leave requests all in one place.",
    selector: "[data-tour='staff']",
    position: "right" as const,
  },
  {
    id: "knowledge-base",
    title: "Need Help?",
    description: "Our Knowledge Base has guides and documentation for every feature. Check it out anytime!",
    selector: "[data-tour='knowledge-base']",
    position: "right" as const,
  },
];

const STORAGE_KEY = "saashub_onboarding_completed";

export function OnboardingTooltips() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const { profile, roles } = useAuth();

  // Check if onboarding was already completed
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    const isSuperAdmin = roles.includes("super_admin");
    
    // Only show for company users who haven't completed onboarding
    if (!completed && profile?.company_id && !isSuperAdmin) {
      // Delay to let the page render
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [profile, roles]);

  // Position the tooltip
  useEffect(() => {
    if (!isVisible) return;

    const step = ONBOARDING_STEPS[currentStep];
    const element = document.querySelector(step.selector);

    if (element) {
      const rect = element.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 180;

      let top = 0;
      let left = 0;

      switch (step.position) {
        case "bottom":
          top = rect.bottom + 12;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + 12;
          break;
      }

      // Keep within viewport
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

      setPosition({ top, left });
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50" />

      {/* Tooltip */}
      <Card
        className="fixed z-50 w-80 shadow-xl border-primary/20"
        style={{ top: position.top, left: position.left }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <h4 className="font-semibold mb-2">{step.title}</h4>
          <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip Tour
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentStep === ONBOARDING_STEPS.length - 1 ? (
                  "Finish"
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
