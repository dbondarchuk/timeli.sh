import { ArrowLeft, BookOpen, Github, Mail } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support — Timeli.sh",
  description:
    "How to get help with Timeli.sh: hours, response times, email, docs, and creating a support case.",
};

/** Public repo for tracked support requests via GitHub Issues. */
const SUPPORT_CASE_URL = "https://github.com/dbondarchuk/timeli.sh/issues/new";
const DOCS_URL = "https://docs.timelish.com";
const SUPPORT_EMAIL = "support@timelish.com";

const contactCards = [
  {
    title: "Create a support case",
    description:
      "Open a GitHub issue so we can track your request and follow up until it's resolved.",
    href: SUPPORT_CASE_URL,
    icon: Github,
    cta: "Open GitHub Issues",
    opensNewTab: true,
  },
  {
    title: "Email support",
    description:
      "Reach the team directly. Include your workspace name and a brief summary of what you need.",
    href: `mailto:${SUPPORT_EMAIL}`,
    icon: Mail,
    cta: SUPPORT_EMAIL,
    opensNewTab: false,
  },
  {
    title: "Knowledge base",
    description:
      "Browse product documentation for setup guides, integrations, apps, and day-to-day use.",
    href: DOCS_URL,
    icon: BookOpen,
    cta: "Go to Docs",
    opensNewTab: true,
  },
] as const;

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg">
                <Image src="/logo.png" alt="Timeli.sh" width={36} height={36} />
              </div>
              <span className="text-3xl font-bold tracking-tight">
                timeli<span className="text-primary">.sh</span>
              </span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Support
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Timeli.sh is built for busy teams who depend on scheduling every
            day. You deserve a dependable way to reach us when something blocks
            you. Below you'll find our hours, targets for first responses, and
            the channels we monitor. Our developers make commercially reasonable
            efforts to reply promptly with clear, actionable help.
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-12 grid gap-6 sm:grid-cols-1">
            {contactCards.map((card) => {
              const Icon = card.icon;
              return (
                <a
                  key={card.title}
                  href={card.href}
                  className="group flex gap-5 rounded-xl border border-border bg-muted/20 p-6 transition-colors hover:border-primary/40 hover:bg-muted/40 no-underline"
                  {...(card.opensNewTab
                    ? {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      }
                    : {})}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background border border-border text-primary">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold text-foreground m-0 group-hover:text-primary transition-colors">
                      {card.title}
                    </h2>
                    <p className="mt-2 text-muted-foreground text-base leading-relaxed m-0">
                      {card.description}
                    </p>
                    <p className="mt-3 text-sm font-medium text-primary m-0">
                      {card.cta}
                      {card.opensNewTab ? " →" : ""}
                    </p>
                  </div>
                </a>
              );
            })}
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Hours of operation
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Support is staffed{" "}
              <strong className="text-foreground font-medium">
                Monday through Friday
              </strong>
              ,{" "}
              <strong className="text-foreground font-medium">
                9:00 a.m. to 6:00 p.m. Eastern Time (US)
              </strong>
              , excluding major US holidays. Automated systems (sign-up,
              billing, confirmations) continue to operate at all times.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              First response SLA
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For tickets sent through{" "}
              <a
                href={SUPPORT_CASE_URL}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Issues
              </a>{" "}
              or{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              during support hours above, our target is an initial reply within{" "}
              <strong className="text-foreground font-medium">
                one business day
              </strong>{" "}
              (same calendar day whenever practicable). Messages received
              outside those hours roll to the next business morning. Severity-1
              outages (the service broadly unavailable or data at risk) are
              prioritized ahead of routine questions—describe impact in your
              subject line so we can triage quickly.
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm">
              This SLA describes the response window you should plan for for a
              first acknowledgment and initial guidance. Complex bugs or feature
              work may take longer to fully resolve after we reply.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Phone support
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not publish a telephone support line at this time. Email and
              GitHub Issues give us enough context—including screenshots and
              logs when needed—to help you faster without keeping you on hold.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()}{" "}
            <span className="font-bold">
              timeli
              <span className="text-primary">.sh</span>
            </span>
            . All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
