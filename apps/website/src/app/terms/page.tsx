import { ArrowLeft, Calendar } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Timeli.sh",
  description:
    "Read the terms and conditions for using Timeli.sh appointment scheduling platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">Timeli.sh</span>
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
            Terms of Service
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: December 4, 2025
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Agreement to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Timeli.sh, you agree to be bound by these
              Terms of Service and all applicable laws and regulations. If you
              do not agree with any of these terms, you are prohibited from
              using or accessing this platform. The materials contained in this
              platform are protected by applicable copyright and trademark law.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Use License
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Permission is granted to temporarily access and use Timeli.sh for
              personal or commercial business purposes, subject to the following
              conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                You must not use the service for any illegal or unauthorized
                purpose
              </li>
              <li>You must not transmit any harmful code or malware</li>
              <li>
                You must not attempt to gain unauthorized access to any part of
                the service
              </li>
              <li>
                You must not interfere with the proper working of the platform
              </li>
              <li>You must not copy or modify the service's software</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Account Responsibilities
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your
              account and password, and for restricting access to your computer.
              You agree to accept responsibility for all activities that occur
              under your account. You must notify us immediately of any
              unauthorized use of your account or any other breach of security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Service Description
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Timeli.sh provides an appointment scheduling platform that enables
              businesses to manage bookings, communicate with clients, process
              payments, and build booking websites. We reserve the right to
              modify, suspend, or discontinue any part of the service at any
              time without prior notice.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Payment Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For paid features and subscriptions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Payments are processed securely through our payment providers
              </li>
              <li>
                Subscription fees are billed in advance on a recurring basis
              </li>
              <li>You may cancel your subscription at any time</li>
              <li>Refunds are provided according to our refund policy</li>
              <li>
                We reserve the right to change pricing with 30 days notice
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              User Content
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any content you submit, post, or display
              on or through the service. By submitting content, you grant us a
              worldwide, non-exclusive, royalty-free license to use, reproduce,
              modify, and distribute that content solely for the purpose of
              providing and improving the service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall Timeli.sh or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the service, even if we have been notified
              orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Indemnification
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless Timeli.sh and
              its officers, directors, employees, agents, and suppliers from and
              against any claims, liabilities, damages, losses, and expenses
              arising out of or in any way connected with your access to or use
              of the service or your violation of these Terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Termination
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the service
              immediately, without prior notice or liability, for any reason
              whatsoever, including without limitation if you breach the Terms.
              Upon termination, your right to use the service will immediately
              cease.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed and construed in accordance with
              applicable laws, without regard to its conflict of law provisions.
              Our failure to enforce any right or provision of these Terms will
              not be considered a waiver of those rights.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time.
              If a revision is material, we will provide at least 30 days notice
              prior to any new terms taking effect. What constitutes a material
              change will be determined at our sole discretion.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us at{" "}
              <a
                href="mailto:legal@timeli.sh"
                className="text-primary hover:underline"
              >
                legal@timeli.sh
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Timeli.sh. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
