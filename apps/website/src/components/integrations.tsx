const integrations = [
  { name: "Google Calendar", logo: "/logos/google_calendar.svg" },
  { name: "Google Meet", logo: "/logos/google_meet.svg" },
  { name: "Outlook", logo: "/logos/outlook.svg" },
  { name: "Zoom", logo: "/logos/zoom.svg" },
  { name: "PayPal", logo: "/logos/paypal.svg" },
];

export function Integrations() {
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

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <img
                src={integration.logo || "/placeholder.svg"}
                alt={integration.name}
                className="h-12 w-12 object-contain"
              />
              <span className="text-sm font-medium text-foreground text-center">
                {integration.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            And more coming soon based on what you ask for
          </p>
        </div>
      </div>
    </section>
  );
}
