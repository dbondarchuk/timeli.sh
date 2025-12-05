"use client";

import { Button, Input, Spinner, toast } from "@timelish/ui";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { joinWaitlist } from "./actions";

export function WaitlistBanner() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (email) {
        const result = await joinWaitlist(email);
        if (result.success) {
          setSubmitted(true);
          setEmail("");
          toast.success(
            "You're on the waitlist! We'll send you an email as soon as spots open up.",
          );
        } else {
          toast.error(
            result.message || "Something went wrong, please try again later.",
          );
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-dark px-6 py-12 lg:px-8">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-1/4 top-0 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-1/3 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white mb-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Launching Soon
            </div>
            <h3 className="text-xl font-semibold text-white sm:text-2xl">
              Get early access to Timeli.sh
            </h3>
            <p className="mt-1 text-white/70">
              Join the waitlist and be among the first to simplify your
              scheduling.
            </p>
          </div>

          <div className="flex-shrink-0 lg:w-96">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                />
                <Button
                  type="submit"
                  className="bg-white text-primary hover:bg-white/90 shrink-0 gap-2 font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner className="size-4" /> : null}
                  Join
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <p className="text-sm font-medium text-white">
                  You're on the list! We'll be in touch soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
