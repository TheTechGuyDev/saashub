import { TestimonialCarousel } from "@/components/landing/TestimonialCarousel";
import { CTASection } from "@/components/landing/CTASection";

export default function Testimonials() {
  return (
    <>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">What Our Customers Say</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Hear from businesses that transformed their operations with SaaSHub.</p>
        </div>
      </section>
      <TestimonialCarousel />
      <CTASection />
    </>
  );
}
