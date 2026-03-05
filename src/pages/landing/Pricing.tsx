import { PricingCards } from "@/components/landing/PricingCards";
import { CTASection } from "@/components/landing/CTASection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Can I switch plans later?", a: "Yes, you can upgrade or downgrade at any time. Changes take effect on your next billing cycle." },
  { q: "Is there a free trial?", a: "Yes! Every plan comes with a 14-day free trial, no credit card required." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, bank transfers, and mobile money." },
  { q: "Can I cancel anytime?", a: "Absolutely. No contracts, no cancellation fees. Cancel anytime from your dashboard." },
];

export default function Pricing() {
  return (
    <>
      <PricingCards />
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold text-foreground text-center">Pricing FAQ</h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      <CTASection />
    </>
  );
}
