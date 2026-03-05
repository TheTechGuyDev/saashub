import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "hello@saashub.com" },
              { icon: Phone, label: "Phone", value: "+234 800 000 0000" },
              { icon: MapPin, label: "Office", value: "Lagos, Nigeria" },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.label}</p>
                  <p className="text-sm text-muted-foreground">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Send a Message</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Name</Label><Input required placeholder="Your name" /></div>
                  <div><Label>Email</Label><Input required type="email" placeholder="you@company.com" /></div>
                </div>
                <div><Label>Subject</Label><Input required placeholder="How can we help?" /></div>
                <div><Label>Message</Label><Textarea required rows={5} placeholder="Tell us more..." /></div>
                <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Message"}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
