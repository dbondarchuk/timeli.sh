import { getSignUpUrl } from "@/lib/admin-app-urls";
import { Button, Link } from "@timelish/ui";
import { Check } from "lucide-react";

export function Pricing() {
  const signUpUrl = getSignUpUrl();

  const plans = [
    {
      name: "Pro",
      price: "$20",
      period: "/month",
      description: "Everything you need to run and grow your booking business",
      features: [
        "Unlimited bookings and clients",
        "Custom booking page with your branding",
        "Use your own domain or a timeli.sh subdomain",
        "Calendar sync (Google, Outlook, CalDAV)",
        "Payments (PayPal, Square, and more)",
        "Email and text message notifications",
        "100 SMS credits included every month",
        "Waitlist for busy times",
        "And much more!",
      ],
      cta: "Start free trial",
      ctaLink: signUpUrl,
      highlighted: true,
      comingSoon: false,
    },
    {
      name: "Team",
      price: "$25",
      period: "/person/month",
      description: "For businesses with staff and more advanced needs",
      features: [
        "Everything in Pro",
        "Multiple team members and roles",
        "Reporting and business insights",
        "Deeper integrations and workflows",
        "Dedicated support for your org",
      ],
      highlighted: false,
      comingSoon: true,
    },
  ] as const;

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
            7-day free trial, then a simple monthly plan. Cancel anytime.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-primary bg-primary/5 shadow-lg ring-1 ring-primary"
                  : "border-border bg-card"
              } ${plan.comingSoon ? "border-dashed" : ""}`}
            >
              {plan.highlighted && !plan.comingSoon && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-primary px-4 py-1 text-xs font-semibold text-white">
                    Everything included
                  </span>
                </div>
              )}

              {plan.comingSoon && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full border border-border bg-muted px-4 py-1 text-xs font-semibold text-muted-foreground">
                    Coming soon
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
                <div className="mt-4">
                  <div className="flex items-baseline gap-0.5">
                    <span
                      className={`text-4xl font-bold tabular-nums ${
                        plan.comingSoon
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {plan.price}
                    </span>
                    {"period" in plan && plan.period ? (
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-start gap-3 text-sm"
                  >
                    <Check
                      className={`h-5 w-5 flex-shrink-0 ${
                        plan.comingSoon
                          ? "text-muted-foreground"
                          : "text-primary"
                      }`}
                    />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.comingSoon ? (
                <Button
                  className="mt-8 w-full"
                  size="lg"
                  variant="outline"
                  disabled
                >
                  Coming soon
                </Button>
              ) : "cta" in plan && "ctaLink" in plan ? (
                <Link
                  href={plan.ctaLink}
                  className="mt-8 w-full"
                  variant={plan.highlighted ? "brand" : "outline"}
                  button
                >
                  {plan.cta}
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
