import { Link } from "@timelish/ui";
import { ArrowRight } from "lucide-react";
import { getSignUpUrl } from "@/lib/admin-app-urls";

export function SignupBanner() {
  const signUpUrl = getSignUpUrl();

  return (
    <section className="relative overflow-hidden bg-gradient-dark px-6 py-12 lg:px-8">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-1/4 top-0 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-1/3 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              7-day free trial
            </div>
            <h3 className="text-xl font-semibold text-white sm:text-2xl">
              Ready to run bookings on your own site?
            </h3>
            <p className="mt-1 text-white/70">
              Create an account, pick your plan, and go live. Cancel anytime
              from your billing settings.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href={signUpUrl}
              className="gap-2 whitespace-nowrap font-semibold"
              variant="brand"
              size="lg"
              button
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#pricing"
              className="whitespace-nowrap text-white/90 hover:text-white"
              variant="ghost"
              size="lg"
              button
            >
              See pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
