import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useNewsletterSubscribers } from "@/hooks/useNewsletterSubscribers";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const { subscribe } = useNewsletterSubscribers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    await subscribe.mutateAsync({ email, source: "landing_page" });
    setEmail("");
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <Mail className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-2xl font-bold text-foreground">Stay in the Loop</h2>
        <p className="mt-2 text-muted-foreground">Get product updates, tips, and insights delivered to your inbox.</p>
        <form onSubmit={handleSubmit} className="mt-6 flex gap-3 sm:mx-auto sm:max-w-md">
          <Input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
          <Button type="submit">Subscribe</Button>
        </form>
      </div>
    </section>
  );
}
