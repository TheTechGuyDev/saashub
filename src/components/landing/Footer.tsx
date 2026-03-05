import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const sections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Integrations", href: "/integrations" },
      { label: "Demo", href: "/demo" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Affiliates", href: "/affiliates" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
              <Zap className="h-5 w-5 text-primary" />
              SaaSHub
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              The all-in-one business platform to manage, automate, and grow your business.
            </p>
          </div>
          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
              <ul className="mt-3 space-y-2">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link to={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SaaSHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
