import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Subscribed!", description: "You'll receive our latest updates." });
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
