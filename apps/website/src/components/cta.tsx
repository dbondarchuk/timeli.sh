import { Link } from "@timelish/ui";
import { ArrowRight } from "lucide-react";
import { getSignUpUrl } from "@/lib/admin-app-urls";

export function CTA() {
  const signUpUrl = getSignUpUrl();

  return (
    <section className="bg-gradient-dark px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
          Ready to get your time back?
        </h2>
        <p className="mt-4 text-lg text-white/80">
          Join thousands of people who stopped chasing bookings and started
          focusing on what they do best. Pro includes a 7-day free trial—cancel
          anytime.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={signUpUrl}
            size="lg"
            className="gap-2 border-0 bg-white px-8 text-foreground hover:bg-white/90"
            button
          >
            Create account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#pricing"
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            button
          >
            See pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
