import { Link } from "@timelish/ui";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Great for trying it out",
    features: [
      "Your own booking page",
      "Up to 50 bookings a month",
      "Email confirmations and reminders",
      "Calendar sync",
      "Full branding control",
      "Free subdomain (yourname.timeli.sh)",
    ],
    cta: "Join the Waitlist",
    ctaLink: "#waitlist",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Most popular choice",
    features: [
      "Everything in Free",
      "Unlimited bookings",
      "Take payments online",
      "Text message confirmations and reminders",
      "50 free SMS credits per month",
      "Waitlist for busy times",
      "Use your own domain name",
      "Priority help when you need it",
    ],
    cta: "Join the Waitlist",
    ctaLink: "#waitlist",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$25",
    period: "/person/month",
    description: "For businesses with staff",
    features: [
      "Everything in Pro",
      "Multiple team members",
      "See how you're doing",
      "Connect other tools",
      "Dedicated support person",
    ],
    cta: "Talk to Us",
    ctaLink: "mailto:sales@timelish.com",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            Pricing
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Simple pricing, no surprises
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-primary bg-primary/5 shadow-lg ring-1 ring-primary"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-primary px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-start gap-3 text-sm"
                  >
                    <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaLink}
                className="mt-8 w-full"
                variant={plan.highlighted ? "brand" : "outline"}
                button
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
