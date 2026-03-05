import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 lg:py-32">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-[300px] w-[400px] rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Now with AI-powered automation
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Manage Your Business.{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            All in One Place.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          CRM, WhatsApp automation, invoicing, staff management, analytics, and more — purpose-built for growing businesses in Africa and beyond.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/auth">
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/demo">
              <Play className="mr-2 h-4 w-4" /> Book Demo
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">No credit card required · Free 14-day trial</p>

        {/* Product screenshot placeholder */}
        <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5">
          <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <div className="h-3 w-3 rounded-full bg-warning/60" />
            <div className="h-3 w-3 rounded-full bg-success/60" />
          </div>
          <div className="flex h-[300px] items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 text-muted-foreground lg:h-[420px]">
            <span className="text-lg font-medium">Dashboard Preview</span>
          </div>
        </div>
      </div>
    </section>
  );
}
