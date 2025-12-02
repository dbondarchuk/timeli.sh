"use client";

import type React from "react";

import { Button, Input } from "@timelish/ui";
import { Bell, CheckCircle2, Sparkles, Users } from "lucide-react";
import { useState } from "react";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section
      id="waitlist"
      className="bg-gradient-dark px-6 py-24 sm:py-32 lg:px-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/90">
          <Sparkles className="h-4 w-4" />
          <span>Coming Soon</span>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
          Be the first to try Timeli.sh
        </h2>
        <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
          We're putting the finishing touches on something special. Join the
          waitlist and you'll be among the first to know when we open the doors.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              h="lg"
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
            />
            <Button
              type="submit"
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 shrink-0"
            >
              Join the Waitlist
            </Button>
          </form>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/10">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg font-medium text-white">
              You're on the list!
            </p>
            <p className="text-white/70">
              We'll send you an email as soon as spots open up.
            </p>
          </div>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>500+ people already waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Get early access perks</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Free for early members</span>
          </div>
        </div>
      </div>
    </section>
  );
}
