"use client";

import { Link } from "@timelish/ui";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const phrases = [
  "what you love",
  "your clients",
  "growing your business",
  "your family",
  "your craft",
];

const screenshots = [
  {
    url: "/dashboard.png",
    label: "Dashboard",
    path: "app.timelish.com/dashboard",
  },
  {
    url: "/booking-page.png",
    label: "Booking Website",
    path: "yourname.timeli.sh",
  },
  {
    url: "/page-builder.png",
    label: "Page Builder",
    path: "app.timelish.com/page-builder",
  },
  {
    url: "/email-builder.png",
    label: "Email Builder",
    path: "app.timelish.com/email-builder",
  },
  {
    url: "/app-store.png",
    label: "App Store",
    path: "app.timelish.com/apps/store",
  },
];

function TypewriterText() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState(phrases[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  const longestPhrase = phrases.reduce((a, b) => (a.length > b.length ? a : b));

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (displayText.length < currentPhrase.length) {
            setDisplayText(currentPhrase.slice(0, displayText.length + 1));
          } else {
            // Finished typing, wait then start deleting
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          // Deleting
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            // Finished deleting, move to next phrase
            setIsDeleting(false);
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          }
        }
      },
      isDeleting ? 50 : 100,
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentPhraseIndex]);

  return (
    <span className="inline-grid text-primary">
      <span className="invisible col-start-1 row-start-1">{longestPhrase}</span>
      <span className="col-start-1 row-start-1">
        {displayText}
        <span className="inline-block w-[3px] h-[1em] bg-primary ml-1 animate-blink align-middle" />
      </span>
    </span>
  );
}

export function Hero() {
  const [currentScreenshot, setCurrentScreenshot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreenshot((prev) => (prev + 1) % screenshots.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(216_100%_50%_/_0.08),transparent)]" />

      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm">
          <span className="flex h-2 w-2 rounded-full bg-gradient-primary animate-pulse" />
          <span className="text-muted-foreground">
            Coming soon — Join the waitlist
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
          Spend less time on bookings, more time on <TypewriterText />
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto text-pretty">
          Let your clients book appointments online, 24/7. You get a beautiful
          booking website, automatic reminders, and even online payments. No
          tech skills needed—if you can use email, you can use Timeli.sh.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            size="lg"
            className="gap-2 px-8 border-0 hover:opacity-90"
            variant="brand-dark"
            href="#waitlist"
            button
          >
            Join the Waitlist
            <ArrowRight className="h-4 w-4" />
          </Link>
          {/* <Button size="lg" variant="outline" className="gap-2 bg-transparent">
            <Play className="h-4 w-4" />
            See How It Works
          </Button> */}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Discounts for early members</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>No credit card needed</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Be the first to know</span>
          </div>
        </div>
      </div>

      {/* Hero Image / App Preview */}
      <div className="relative mt-16 sm:mt-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {screenshots.map((screenshot, index) => (
              <button
                key={screenshot.label}
                onClick={() => setCurrentScreenshot(index)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  currentScreenshot === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {screenshot.label}
              </button>
            ))}
          </div>

          <div className="relative rounded-xl bg-foreground/5 p-2 ring-1 ring-primary/20">
            <div className="overflow-hidden rounded-lg bg-card shadow-2xl ring-1 ring-border">
              <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground">
                    {screenshots[currentScreenshot].path}
                  </span>
                </div>
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-muted/50 to-muted relative overflow-hidden">
                {screenshots.map((screenshot, index) => (
                  <img
                    key={screenshot.label}
                    src={screenshot.url || "/placeholder.svg"}
                    alt={`Timeli.sh ${screenshot.label} Preview`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      currentScreenshot === index ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-1.5 mt-4">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentScreenshot(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentScreenshot === index
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-muted-foreground/30"
                }`}
                aria-label={`Go to screenshot ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
