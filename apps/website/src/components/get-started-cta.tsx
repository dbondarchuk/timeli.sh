import { Link } from "@timelish/ui";
import { ArrowRight, Sparkles } from "lucide-react";
import { getSignInUrl, getSignUpUrl } from "@/lib/admin-app-urls";

export function GetStartedCta() {
  const signUpUrl = getSignUpUrl();
  const signInUrl = getSignInUrl();

  return (
    <section
      id="get-started"
      className="bg-gradient-dark px-6 py-24 sm:py-32 lg:px-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/90">
          <Sparkles className="h-4 w-4" />
          <span>Pro · 7-day free trial</span>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
          Get your booking page live today
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-lg text-white/80">
          Sign up, subscribe when you are ready, and share your link with
          clients. Questions? We are here to help.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href={signUpUrl}
            size="lg"
            className="w-full min-w-[200px] gap-2 sm:w-auto"
            variant="brand"
            button
          >
            Create account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={signInUrl}
            size="lg"
            className="w-full min-w-[200px] sm:w-auto"
            variant="outline"
            button
          >
            Log in
          </Link>
        </div>
        <p className="mt-6 text-sm text-white/60">
          Prefer to see plans first?{" "}
          <a href="#pricing" className="text-white/90 underline underline-offset-2 hover:text-white">
            View pricing
          </a>
        </p>
      </div>
    </section>
  );
}
