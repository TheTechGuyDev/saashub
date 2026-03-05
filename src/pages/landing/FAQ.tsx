import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CTASection } from "@/components/landing/CTASection";

const faqs = [
  { q: "What is SaaSHub?", a: "SaaSHub is an all-in-one business management platform that combines CRM, WhatsApp automation, invoicing, staff management, analytics, and more into a single dashboard." },
  { q: "Who is SaaSHub built for?", a: "SaaSHub is designed for small and medium businesses, especially those in Africa and emerging markets, who need affordable yet powerful tools to manage and grow their operations." },
  { q: "Do I need technical skills to use SaaSHub?", a: "Not at all! SaaSHub is designed to be user-friendly. Our onboarding wizard and guided tooltips will help you get started in minutes." },
  { q: "How does WhatsApp automation work?", a: "Connect your WhatsApp Business account, set up auto-reply rules, create templates, and let AI handle common customer queries. You can also send broadcast campaigns and collect orders directly through WhatsApp." },
  { q: "Is my data secure?", a: "Absolutely. We use enterprise-grade security with row-level data isolation, encrypted connections, and role-based access control. Your data is never shared between companies." },
  { q: "Can I manage multiple branches?", a: "Yes! SaaSHub supports multi-branch management. You can assign branch managers, track per-branch performance, and manage everything from one dashboard." },
  { q: "What payment methods are accepted?", a: "We accept credit cards, bank transfers, and mobile money payments." },
  { q: "Is there a free plan?", a: "Yes, our Starter plan is completely free and includes basic CRM, up to 100 contacts, and 5 WhatsApp auto-replies." },
  { q: "Can I import my existing data?", a: "Yes, you can import contacts, products, and other data via CSV upload or through our API." },
  { q: "How do I get support?", a: "You can reach our support team via email, the in-app chat, or by visiting our Contact page. Pro plan users get priority support." },
];

export default function FAQ() {
  return (
    <>
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">Frequently Asked Questions</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">Find answers to the most common questions about SaaSHub.</p>
          </div>
          <Accordion type="single" collapsible className="mt-12">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      <CTASection />
    </>
  );
}
