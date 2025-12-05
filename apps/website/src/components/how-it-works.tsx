import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Tell Us About Your Business",
    description:
      "Answer a few quick questions about what you do and when you're available. Takes about 2 minutes.",
    features: ["Your business info", "Your working hours", "Your services"],
  },
  {
    step: "02",
    title: "Make It Yours",
    description:
      "Choose colors, add your logo, and write a welcome message. Drag and drop to create your perfect booking page.",
    features: [
      "Pick your style",
      "Add your branding",
      "No design skills needed",
    ],
  },
  {
    step: "03",
    title: "Connect Your Tools",
    description:
      "Link your Google or Outlook calendar so everything stays in sync. Set up text reminders if you want.",
    features: [
      "Calendar syncs both ways",
      "Automatic reminders",
      "Video calls included",
    ],
  },
  {
    step: "04",
    title: "Share and Relax",
    description:
      "Send your booking link to clients or add it to your social media. Bookings come in while you focus on your work.",
    features: ["Share anywhere", "Clients book 24/7", "You get notified"],
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/30 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            Getting Started
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Up and running in minutes, not hours
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Most people finish setup during their coffee break.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex gap-6 rounded-2xl border border-border bg-card p-8"
            >
              <div className="flex-shrink-0">
                <span className="text-4xl font-bold text-primary/20">
                  {step.step}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {step.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
