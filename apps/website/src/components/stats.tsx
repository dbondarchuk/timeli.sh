const stats = [
  {
    value: "10,000+",
    label: "Happy Customers",
    sublabel: "Businesses like yours",
  },
  { value: "85%", label: "Less No-Shows", sublabel: "Thanks to reminders" },
  { value: "5 min", label: "Setup Time", sublabel: "Really, that fast" },
  { value: "24/7", label: "Bookings", sublabel: "Even while you sleep" },
];

export function Stats() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center lg:text-left">
              <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {stat.label}
              </p>
              <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
