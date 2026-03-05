import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { CTASection } from "@/components/landing/CTASection";
import { MessageSquare, BarChart3, Users, FileText, Phone, Calendar, FolderOpen, Shield, Zap, Globe, Bot, Workflow } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const detailed = [
  { icon: Users, title: "CRM & Sales Pipeline", desc: "Visual Kanban pipeline, lead tracking, customer segmentation, activity logging, and deal management." },
  { icon: MessageSquare, title: "WhatsApp Business Automation", desc: "AI auto-replies, broadcast campaigns, product catalog, order collection, and conversation assignment." },
  { icon: BarChart3, title: "Analytics & Reporting", desc: "Real-time dashboards, revenue tracking, conversion funnels, and exportable reports." },
  { icon: FileText, title: "Invoicing & Finance", desc: "Professional invoices, expense tracking, payment reminders, and financial summaries." },
  { icon: Phone, title: "Call Centre", desc: "Agent management, call queues, live stats, inbound/outbound tracking, and call logging." },
  { icon: Calendar, title: "Calendar & Events", desc: "Team scheduling, event management, attendee tracking, and calendar sync." },
  { icon: FolderOpen, title: "Document Management", desc: "Cloud file storage, folder organization, and team document sharing." },
  { icon: Shield, title: "Staff Management", desc: "Employee records, attendance tracking, leave requests, and payroll integration." },
  { icon: Zap, title: "AI-Powered Automation", desc: "Smart auto-replies, AI report generation, workflow triggers, and predictive insights." },
  { icon: Globe, title: "Multi-Branch Management", desc: "Manage multiple locations, assign branch managers, and track per-branch performance." },
  { icon: Bot, title: "Knowledge Base", desc: "Self-service help center, article management, and searchable documentation." },
  { icon: Workflow, title: "Project Management", desc: "Task boards, project timelines, team assignment, and progress tracking." },
];

export default function Features() {
  return (
    <>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">Powerful Features for Every Business</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Everything you need to manage, automate, and scale — in one platform.</p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {detailed.map((f) => (
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
      <CTASection />
    </>
  );
}
