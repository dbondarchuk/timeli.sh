import {
  Bell,
  Calendar,
  Clock,
  CreditCard,
  Globe,
  MessageCircle,
  Shield,
  Smile,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Your Calendar, Sorted",
    description:
      "Clients pick a time that works for both of you. No more back-and-forth emails or phone tag. Your calendar stays organized automatically.",
  },
  {
    icon: CreditCard,
    title: "Get Paid Upfront",
    description:
      "Take payments or deposits when clients book. Fewer no-shows, better cash flow, and one less thing to worry about.",
  },
  {
    icon: Bell,
    title: "Automatic Reminders",
    description:
      "Clients get friendly reminders before their appointment. You'll never have to chase anyone down again.",
  },
  {
    icon: MessageCircle,
    title: "Text Message Updates",
    description:
      "Send appointment reminders straight to your clients' phones. Most people check texts within 3 minutes!",
  },
  {
    icon: Globe,
    title: "Your Own Booking Website",
    description:
      "Get a professional website where clients can book you. Just drag, drop, and publish—no designer needed.",
  },
  {
    icon: Clock,
    title: "Never Double-Book",
    description:
      "Your availability updates in real-time. When a slot is taken, it's taken. Simple as that.",
  },
  {
    icon: Shield,
    title: "You Set the Rules",
    description:
      "Decide your cancellation policy, booking notice, and refund terms.",
  },
  {
    icon: Smile,
    title: "Clients Love It",
    description:
      "A smooth booking experience makes you look professional. Happy clients book again and tell their friends.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            What You Get
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Everything to make booking a breeze
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            No complicated setup. No tech headaches. Just the tools you need to
            focus on your work.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
