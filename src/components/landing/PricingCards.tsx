import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "Free",
    desc: "For solo entrepreneurs getting started.",
    features: ["Up to 100 contacts", "Basic CRM", "5 WhatsApp auto-replies", "Email support", "1 user"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Growth",
    price: "$29",
    period: "/mo",
    desc: "For growing teams that need automation.",
    features: ["Unlimited contacts", "Full CRM & pipeline", "WhatsApp broadcasts", "AI auto-replies", "Staff assignment", "5 users", "Priority support"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    desc: "For established businesses at scale.",
    features: ["Everything in Growth", "Unlimited automation", "Advanced analytics", "Product catalog", "Order management", "Unlimited users", "Dedicated support", "Custom integrations"],
    cta: "Start Free Trial",
    popular: false,
  },
];

export function PricingCards() {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">Start free. Scale as you grow. No hidden fees.</p>
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.name} className={cn("relative flex flex-col", p.popular && "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary")}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{p.name}</CardTitle>
                <CardDescription>{p.desc}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-foreground">{p.price}</span>
                  {p.period && <span className="text-muted-foreground">{p.period}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" variant={p.popular ? "default" : "outline"} asChild>
                  <Link to="/auth">{p.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
