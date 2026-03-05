import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, HelpCircle, MessageSquare, FileText } from "lucide-react";

const resources = [
  { icon: BookOpen, title: "Getting Started", desc: "Quick start guide for new users.", href: "/knowledge-base" },
  { icon: FileText, title: "Feature Guides", desc: "Detailed walkthroughs for every module.", href: "/knowledge-base" },
  { icon: MessageSquare, title: "API Reference", desc: "Technical docs for developers.", href: "/knowledge-base" },
  { icon: HelpCircle, title: "FAQ", desc: "Answers to common questions.", href: "/faq" },
];

export default function Docs() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">Documentation & Help Center</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">Everything you need to get the most out of SaaSHub.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {resources.map((r) => (
            <Link key={r.title} to={r.href}>
              <Card className="group h-full border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <r.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{r.title}</CardTitle>
                  <CardDescription>{r.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button variant="outline" asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
