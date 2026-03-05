import { IntegrationLogos } from "@/components/landing/IntegrationLogos";
import { CTASection } from "@/components/landing/CTASection";

export default function Integrations() {
  return (
    <>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">Seamless Integrations</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">SaaSHub connects with the tools and platforms your business already relies on.</p>
        </div>
      </section>
      <IntegrationLogos />
      <CTASection />
    </>
  );
}
