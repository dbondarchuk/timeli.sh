"use client";

import { Button } from "@timelish/ui";
import { ArrowRight, CheckCircle2, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const phrases = [
  "what you love",
  "your clients",
  "growing your business",
  "your craft",
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
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(216_100%_50%_/_0.08),transparent)]" />

      <div className="mx-auto max-w-4xl text-center">
        <a
          href="#waitlist"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground">
            Coming soon — Join the waitlist
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
        </a>

        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
          Spend less time on bookings, more time on <TypewriterText />
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto text-pretty">
          Let your clients book appointments online, 24/7. You get a beautiful
          booking website, automatic reminders, and even online payments. No
          tech skills needed—if you can use email, you can use Timeli.sh.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="gap-2 px-8 bg-gradient-primary border-0 text-white hover:opacity-90"
            asChild
          >
            <a href="#waitlist">
              Join the Waitlist
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="gap-2 bg-transparent">
            <Play className="h-4 w-4" />
            See How It Works
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Free for early members</span>
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
                    app.timelish.com/dashboard
                  </span>
                </div>
              </div>
              <div className="relative aspect-[16/9] bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                <Image
                  src="/dashboard.png"
                  alt="Timeli.sh Dashboard Preview"
                  className="w-full h-full object-contain"
                  fill
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
