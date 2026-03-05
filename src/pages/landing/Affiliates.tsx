import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Gift } from "lucide-react";

export default function Affiliates() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">Affiliate Program</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Earn recurring commissions by recommending SaaSHub to businesses you know.</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: DollarSign, title: "25% Commission", desc: "Earn 25% recurring on every referral's subscription." },
            { icon: Users, title: "No Limits", desc: "Refer as many businesses as you want." },
            { icon: TrendingUp, title: "Real-Time Dashboard", desc: "Track clicks, signups, and earnings live." },
            { icon: Gift, title: "Exclusive Perks", desc: "Top affiliates get early access and premium rewards." },
          ].map((b) => (
            <Card key={b.title} className="text-center border-border/50">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{b.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <Link to="/auth">Join the Affiliate Program</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
