import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Adebayo O.", role: "CEO, TechVentures", text: "SaaSHub transformed how we manage our sales. WhatsApp automation alone doubled our response rate.", initials: "AO" },
  { name: "Fatima K.", role: "Operations Manager", text: "We went from 3 different tools to just SaaSHub. The CRM and invoicing integration is seamless.", initials: "FK" },
  { name: "James M.", role: "Founder, QuickServe", text: "The AI auto-replies handle 70% of our customer questions. Our team can now focus on closing deals.", initials: "JM" },
  { name: "Chioma E.", role: "Marketing Lead", text: "Broadcast campaigns through WhatsApp get us 5x more engagement than email. Game changer.", initials: "CE" },
];

export function TestimonialCarousel() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Loved by Businesses</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">See what our customers say about SaaSHub.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">"{t.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-xs">{t.initials}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
