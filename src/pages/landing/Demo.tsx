import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";
import { CTASection } from "@/components/landing/CTASection";

export default function Demo() {
  return (
    <>
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">See SaaSHub in Action</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Watch a quick walkthrough of how SaaSHub helps businesses manage everything from one dashboard.</p>

          {/* Video placeholder */}
          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="flex h-[400px] items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 lg:h-[500px]">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Play className="h-8 w-8 ml-1" />
                </div>
                <span className="text-muted-foreground font-medium">Product Demo Video</span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/auth">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">Request Live Demo</Link>
            </Button>
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
