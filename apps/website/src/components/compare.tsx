import { Check } from "lucide-react";
import { Fragment } from "react";

type FeatureValue = true | false | string;

interface CompetitorColumn {
  name: string;
  highlight?: boolean;
}

interface CompareFeature {
  label: string;
  // [timeli.sh, Calendly, Square Appointments, Squarespace+Acuity]
  values: [FeatureValue, FeatureValue, FeatureValue, FeatureValue];
}

interface CompareSection {
  section: string;
  features: CompareFeature[];
}

const competitors: CompetitorColumn[] = [
  { name: "timeli.sh", highlight: true },
  { name: "Calendly" },
  { name: "Square Appointments" },
  { name: "Squarespace + Acuity" },
];

const compareSections: CompareSection[] = [
  {
    section: "Pricing",
    features: [
      {
        label: "Starting paid plan",
        values: ["$29/mo", "$12/mo", "$29/mo/location", "$39+/mo"],
      },
    ],
  },
  {
    section: "Website & branding",
    features: [
      { label: "Full website builder", values: [true, false, false, true] },
      {
        label: "Full branding control",
        values: [true, "limited", "limited", true],
      },
      { label: "Custom domain", values: [true, true, false, true] },
    ],
  },
  {
    section: "Booking",
    features: [
      { label: "Unlimited bookings", values: [true, true, true, true] },
      {
        label: "Calendar sync",
        values: ["Google, Outlook, CalDAV", true, "Google only", true],
      },
      {
        label: "Waitlist management",
        values: [true, false, "paid plan only", true],
      },
      {
        label: "SMS reminders",
        values: ["100 credits/mo included", false, true, "paid add-on"],
      },
    ],
  },
  {
    section: "Payments & revenue",
    features: [
      {
        label: "Payment processors",
        values: [
          "Square, Stripe, PayPal",
          "Stripe only",
          "Square only",
          "multiple",
        ],
      },
      {
        label: "Gift cards",
        values: [true, false, "fees on lower tiers", true],
      },
      {
        label: "Discounts & promotions",
        values: [true, false, "basic", true],
      },
    ],
  },
];

const renderFeatureValue = (value: FeatureValue) => {
  if (value === true) {
    return (
      <Check className="mx-auto h-4 w-4 text-primary" aria-hidden="true" />
    );
  }

  if (value === false) {
    return <span className="text-muted-foreground">-</span>;
  }

  return <span>{value}</span>;
};

export function Compare() {
  return (
    <section id="compare" className="px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            How we compare
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Built for businesses that need more than a booking link
          </h2>
        </div>

        <div className="mx-auto mt-8 max-w-6xl overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-[260px] px-4 py-3 text-left font-semibold text-foreground">
                  Feature
                </th>
                {competitors.map((competitor) => (
                  <th
                    key={competitor.name}
                    className={`px-4 py-3 text-center font-semibold ${
                      competitor.highlight ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {competitor.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {compareSections.map((group) => (
                <Fragment key={group.section}>
                  <tr className="bg-muted/20">
                    <td
                      colSpan={competitors.length + 1}
                      className="px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                    >
                      {group.section}
                    </td>
                  </tr>

                  {group.features.map((feature) => (
                    <tr
                      key={`${group.section}-${feature.label}`}
                      className="border-t border-border"
                    >
                      <td className="px-4 py-3 text-left text-foreground">
                        {feature.label}
                      </td>
                      {feature.values.map((value, valueIndex) => (
                        <td
                          key={`${feature.label}-${competitors[valueIndex]?.name}`}
                          className={`px-4 py-3 text-center text-foreground ${
                            competitors[valueIndex]?.highlight
                              ? "font-medium"
                              : ""
                          }`}
                        >
                          {renderFeatureValue(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
