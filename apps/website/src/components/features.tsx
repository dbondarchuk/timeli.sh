"use client";

import {
  Bell,
  Calendar,
  Check,
  CreditCard,
  Globe,
  MessageCircle,
  Shield,
  Smile,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const features = [
  {
    icon: Globe,
    title: "Your Own Booking Website",
    description:
      "Get a professional website where clients can book you. Just drag, drop, and publish—no designer needed.",
    details: {
      headline: "Look professional in minutes",
      bullets: [
        "Drag-and-drop page builder",
        "Add your logo, colors, and photos",
        "Use your own domain name",
        "Mobile-friendly design built in",
      ],
      image: "/drag-and-drop-website-builder-with-booking-page-pr.jpg",
    },
  },
  {
    icon: Calendar,
    title: "Your Calendar, Sorted",
    description:
      "Clients pick a time that works for both of you. No more back-and-forth emails or phone tag. Your calendar stays organized automatically.",
    details: {
      headline: "Say goodbye to scheduling chaos",
      bullets: [
        "Syncs with Google Calendar, Outlook, CalDAV, and iCal",
        "Automatically works with your time zone",
        "Use smart scheduling algorithm to maximize amount of bookings and your income",
        "Set your weekly availability and block off personal time with one click",
      ],
      image: "/calendar-sync-interface-with-multiple-calendars-co.jpg",
    },
  },
  {
    icon: Bell,
    title: "Automatic Reminders and Follow-ups",
    description:
      "Clients get friendly reminders before their appointment. You'll never have to chase anyone down again.",
    details: {
      headline: "Reduce no-shows by up to 85%",
      bullets: [
        "Send reminders 24 hours and 1 hour before (or any time you want)",
        "Follow-up with clients after their appointment",
        "Customize the message to match your voice",
        "Use email or SMS (or both)",
      ],
      image: "/email-reminder-preview-with-appointment-details-an.jpg",
    },
  },
  {
    icon: CreditCard,
    title: "Get Paid Upfront",
    description:
      "Take payments or deposits when clients book. Fewer no-shows, better cash flow, and one less thing to worry about.",
    details: {
      headline: "Secure payments, happy clients",
      bullets: [
        "Accept credit cards and PayPal",
        "Require deposits or full payment upfront",
        "Automatic refunds based on your policy",
        "See all your earnings in one dashboard",
      ],
      image: "/payment-dashboard-with-earnings-chart-and-transact.jpg",
    },
  },
  {
    icon: Users,
    title: "Easy Customer Management",
    description:
      "Manage your customers and their bookings easily. Automatically tracks your customers and their bookings",
    details: {
      headline: "Easy customer management",
      bullets: [
        "Automatically connect booking to existing customer by email or phone number",
        "View all your customers and their bookings",
        "Set payment requirements for each customer",
        "Do not like a customer? Easily block them from booking",
      ],
      image: "/customer-management-dashboard-with-search-and-filter.jpg",
    },
  },
  {
    icon: MessageCircle,
    title: "Text Message Updates",
    description:
      "Send appointment reminders straight to your clients' phones. Most people check texts within 3 minutes!",
    details: {
      headline: "Reach clients where they are",
      bullets: [
        "SMS reminders have 98% open rate",
        "Use built-in SMS provider or connect your own (TextBelt, Twilio, etc.)",
        "Two-way messaging with clients",
        "Works in USA and Canada (more countries coming soon)",
      ],
      image: "/phone-showing-sms-appointment-reminder-notificatio.jpg",
    },
  },
  {
    icon: Shield,
    title: "You Set the Rules",
    description:
      "Decide your cancellation policy, booking notice, and refund terms. Clients see them clearly before booking.",
    details: {
      headline: "Your business, your policies",
      bullets: [
        "Custom cancellation deadlines",
        "Flexible refund options",
        "Minimum booking notice required",
        "Automatic policy enforcement",
      ],
      image: "/booking-policy-settings-interface-with-toggle-opti.jpg",
    },
  },
  {
    icon: Smile,
    title: "Clients Love It",
    description:
      "A smooth booking experience makes you look professional. Happy clients book again and tell their friends.",
    details: {
      headline: "Create fans, not just clients",
      bullets: [
        "Book in under 60 seconds",
        "Easy rescheduling and cancellation (by clients or you)",
        "Prevent duplicate bookings by clients by letting them know when they are already have an appointment",
        "Don't have open slots? Allow them to join the waitlist!",
      ],
      image: "/happy-client-booking-confirmation-screen-with-chec.jpg",
    },
  },
];

export function Features() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [columnsPerRow, setColumnsPerRow] = useState(4);

  useEffect(() => {
    const calculateColumns = () => {
      if (window.innerWidth >= 1024) return 4;
      if (window.innerWidth >= 640) return 2;
      return 1;
    };

    setColumnsPerRow(calculateColumns());

    const handleResize = () => {
      setColumnsPerRow(calculateColumns());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderFeaturesWithExpandedPanel = () => {
    const rows: { features: typeof features; startIndex: number }[] = [];

    for (let i = 0; i < features.length; i += columnsPerRow) {
      rows.push({
        features: features.slice(i, i + columnsPerRow),
        startIndex: i,
      });
    }

    return rows.map((row, rowIndex) => {
      const rowStartIndex = row.startIndex;
      const rowEndIndex = rowStartIndex + row.features.length - 1;
      const shouldShowExpanded =
        expandedIndex !== null &&
        expandedIndex >= rowStartIndex &&
        expandedIndex <= rowEndIndex;
      const expandedFeature = shouldShowExpanded
        ? features[expandedIndex]
        : null;

      return (
        <div key={rowIndex}>
          {/* Feature cards row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {row.features.map((feature, featureIndex) => {
              const actualIndex = rowStartIndex + featureIndex;
              const isExpanded = expandedIndex === actualIndex;
              return (
                <button
                  key={actualIndex}
                  onClick={() => toggleExpand(actualIndex)}
                  className={`group relative flex flex-col items-center justify-between rounded-2xl border p-6 text-center transition-all duration-300 ${
                    isExpanded
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${
                      isExpanded
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    }`}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  <span className="mt-4 text-xs font-medium text-primary">
                    {isExpanded ? "Click to close" : "Learn more"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expanded panel appears directly under this row */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              expandedFeature
                ? "grid-rows-[1fr] opacity-100 mt-4"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              {expandedFeature && (
                <div className="rounded-2xl border border-primary bg-card p-6 shadow-lg">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <expandedFeature.icon className="h-5 w-5" />
                          </div>
                          <h3 className="text-xl font-semibold text-foreground">
                            {expandedFeature.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => setExpandedIndex(null)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-lg font-medium text-foreground">
                        {expandedFeature.details.headline}
                      </p>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {expandedFeature.details.bullets.map(
                          (bullet, bulletIndex) => (
                            <li
                              key={bulletIndex}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                              <span>{bullet}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                    {/* <div className="lg:w-[400px] shrink-0">
                      <div className="overflow-hidden rounded-xl border border-border bg-muted/50">
                        <img
                          src={
                            expandedFeature.details.image || "/placeholder.svg"
                          }
                          alt={expandedFeature.title}
                          className="w-full h-auto"
                        />
                      </div>
                    </div> */}
                  </div>
                </div>
              )}
            </div>
          </div>

          {rowIndex < rows.length - 1 && <div className="h-4" />}
        </div>
      );
    });
  };

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

        <div className="mx-auto mt-16 max-w-6xl">
          {renderFeaturesWithExpandedPanel()}
        </div>
      </div>
    </section>
  );
}
