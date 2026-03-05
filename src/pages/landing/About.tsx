import { CTASection } from "@/components/landing/CTASection";
import { Users, Target, Globe, Heart } from "lucide-react";

const values = [
  { icon: Target, title: "Mission-Driven", desc: "We build tools that empower businesses to compete and thrive in the digital economy." },
  { icon: Users, title: "Customer-First", desc: "Every feature we build starts with a real customer need." },
  { icon: Globe, title: "Africa-Focused, Globally Ready", desc: "Built for the unique challenges of African businesses, but designed for the world." },
  { icon: Heart, title: "Community", desc: "We believe in growing together. Our success is tied to your success." },
];

export default function About() {
  return (
    <>
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">About SaaSHub</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              SaaSHub was born from a simple observation: small businesses deserve enterprise-grade tools without the enterprise-grade complexity or price tag. We're building the all-in-one platform that makes running a business effortless.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <v.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">Our Numbers</h2>
            <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { stat: "500+", label: "Businesses" },
                { stat: "50K+", label: "Messages Sent" },
                { stat: "10K+", label: "Invoices Created" },
                { stat: "99.9%", label: "Uptime" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-extrabold text-primary">{s.stat}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
