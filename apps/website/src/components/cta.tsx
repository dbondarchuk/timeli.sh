import { Button } from "@timelish/ui";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="bg-gradient-dark px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
          Ready to get your time back?
        </h2>
        <p className="mt-4 text-lg text-white/80">
          Join thousands of people who stopped chasing bookings and started
          focusing on what they do best. Your free account is waiting.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="gap-2 px-8 bg-white text-foreground hover:bg-white/90"
          >
            Get Started — It's Free
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white"
          >
            See It In Action
          </Button>
        </div>
      </div>
    </section>
  );
}
