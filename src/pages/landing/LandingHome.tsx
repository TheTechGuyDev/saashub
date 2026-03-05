import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { PricingCards } from "@/components/landing/PricingCards";
import { TestimonialCarousel } from "@/components/landing/TestimonialCarousel";
import { IntegrationLogos } from "@/components/landing/IntegrationLogos";
import { NewsletterSignup } from "@/components/landing/NewsletterSignup";
import { CTASection } from "@/components/landing/CTASection";
import { Bot, TrendingUp, Clock, Globe } from "lucide-react";

export default function LandingHome() {
  return (
    <>
      <HeroSection />

      {/* Product overview */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">One Platform, Infinite Possibilities</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">From customer acquisition to order fulfillment — manage every aspect of your business from a single dashboard.</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Bot, title: "AI Automation", desc: "Automate replies, reports, and workflows with built-in AI." },
              { icon: TrendingUp, title: "Growth Analytics", desc: "Track revenue, conversion rates, and customer behavior." },
              { icon: Clock, title: "Save 10+ Hours/Week", desc: "Eliminate manual tasks with smart automation rules." },
              { icon: Globe, title: "Multi-Branch Ready", desc: "Manage multiple locations from one unified dashboard." },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeatureGrid />
      <IntegrationLogos />
      <TestimonialCarousel />
      <PricingCards />
      <NewsletterSignup />
      <CTASection />
    </>
  );
}
