import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const posts = [
  { title: "How WhatsApp Automation Can 3x Your Response Rate", category: "Automation", date: "Mar 1, 2026", excerpt: "Learn how small businesses are using AI-powered WhatsApp replies to close deals faster." },
  { title: "The Ultimate CRM Setup Guide for SMEs", category: "CRM", date: "Feb 20, 2026", excerpt: "A step-by-step guide to setting up your sales pipeline for maximum efficiency." },
  { title: "5 Invoicing Mistakes That Cost You Money", category: "Finance", date: "Feb 12, 2026", excerpt: "Avoid these common pitfalls and keep your cash flow healthy." },
  { title: "Multi-Branch Management: A Complete Playbook", category: "Operations", date: "Feb 5, 2026", excerpt: "How to scale your business across multiple locations without losing control." },
  { title: "AI in Business: Beyond the Hype", category: "AI", date: "Jan 28, 2026", excerpt: "Practical use cases of AI that actually save time and money for small businesses." },
  { title: "Customer Retention Strategies That Work", category: "Growth", date: "Jan 15, 2026", excerpt: "Keep your customers coming back with these proven tactics." },
];

export default function Blog() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">Blog</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">Insights, tips, and strategies to grow your business.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Card key={p.title} className="group cursor-pointer border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{p.category}</Badge>
                  <span className="text-xs text-muted-foreground">{p.date}</span>
                </div>
                <CardTitle className="mt-2 text-lg group-hover:text-primary transition-colors">{p.title}</CardTitle>
                <CardDescription>{p.excerpt}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
