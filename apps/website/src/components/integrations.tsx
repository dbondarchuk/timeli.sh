const INTEGRATIONS = [
  { name: "Google Calendar", logo: "/logos/google_calendar.svg" },
  { name: "Google Meet", logo: "/logos/google_meet.svg" },
  { name: "Outlook", logo: "/logos/outlook.svg" },
  { name: "Zoom", logo: "/logos/zoom.svg" },
  { name: "PayPal", logo: "/logos/paypal.svg" },
  { name: "Square", logo: "/logos/square.svg" },
  { name: "Stripe", logo: "/logos/stripe.svg" },
] as const;

function IntegrationCard({
  integration,
  duplicate,
}: {
  integration: (typeof INTEGRATIONS)[number];
  duplicate?: boolean;
}) {
  return (
    <div
      className="flex w-44 shrink-0 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 py-6 transition-colors hover:border-primary/50 hover:shadow-md"
      aria-hidden={duplicate ? true : undefined}
    >
      <img
        src={integration.logo || "/placeholder.svg"}
        alt={duplicate ? "" : integration.name}
        className="h-12 w-12 object-contain"
      />
      <span className="text-center text-sm font-medium text-foreground">
        {integration.name}
      </span>
    </div>
  );
}

export function Integrations() {
  const listLabel = INTEGRATIONS.map((i) => i.name).join(", ");

  return (
    <section id="integrations" className="px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            Works With
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Plays nicely with tools you already use
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Your calendar, video calls, and payments all stay in sync. No
            copying and pasting.
          </p>
        </div>

        <p className="sr-only">Supported integrations: {listLabel}.</p>

        <div className="mt-16 hidden flex-wrap justify-center gap-4">
          {INTEGRATIONS.map((integration) => (
            <IntegrationCard key={integration.name} integration={integration} />
          ))}
        </div>

        <div
          className="relative -mx-6 mt-16 overflow-hidden sm:-mx-8"
          aria-hidden
        >
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-24"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-24"
            aria-hidden
          />
          <div className="flex w-max animate-marquee-scroll gap-4 py-1 will-change-transform">
            {INTEGRATIONS.map((integration) => (
              <IntegrationCard
                key={integration.name}
                integration={integration}
              />
            ))}
            {INTEGRATIONS.map((integration) => (
              <IntegrationCard
                key={`${integration.name}-dup`}
                integration={integration}
                duplicate
              />
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">And more coming soon!</p>
        </div>
      </div>
    </section>
  );
}
