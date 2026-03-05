import { MessageSquare, Mail, Phone, Share2, Database, CreditCard } from "lucide-react";

const integrations = [
  { icon: MessageSquare, name: "WhatsApp Business" },
  { icon: Mail, name: "Resend Email" },
  { icon: Phone, name: "Twilio VoIP" },
  { icon: Share2, name: "Social Media" },
  { icon: Database, name: "Cloud Database" },
  { icon: CreditCard, name: "Payment Gateway" },
];

export function IntegrationLogos() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Integrations That Power Your Workflow</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">Connect the tools you already use.</p>
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {integrations.map((i) => (
            <div key={i.name} className="flex flex-col items-center gap-3 rounded-lg border border-border/50 bg-card p-6 transition-shadow hover:shadow-md">
              <i.icon className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">{i.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
