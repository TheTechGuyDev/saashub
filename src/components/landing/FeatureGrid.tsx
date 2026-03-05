import { BarChart3, MessageSquare, Users, FileText, ShieldCheck, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  { icon: Users, title: "CRM & Sales Pipeline", desc: "Track leads, manage deals, and close more sales with a visual pipeline." },
  { icon: MessageSquare, title: "WhatsApp Automation", desc: "Auto-reply, broadcast campaigns, and collect orders through WhatsApp." },
  { icon: BarChart3, title: "Analytics & Reports", desc: "Real-time dashboards and data-driven insights for better decisions." },
  { icon: FileText, title: "Invoicing & Finance", desc: "Create invoices, track expenses, and manage your finances effortlessly." },
  { icon: Zap, title: "AI-Powered Automation", desc: "Let AI handle customer queries, generate reports, and automate workflows." },
  { icon: ShieldCheck, title: "Multi-Tenant Security", desc: "Enterprise-grade security with role-based access and data isolation." },
];

export function FeatureGrid() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Run Your Business
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            One platform. Every tool. Built for ambitious businesses.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="group border-border/50 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
