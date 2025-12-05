import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Integrations } from "@/components/integrations";
import { Pricing } from "@/components/pricing";
import { Stats } from "@/components/stats";
import { Testimonials } from "@/components/testimonials";
import { Waitlist } from "@/components/waitlist";
import { WaitlistBanner } from "@/components/waitlist-banner";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <WaitlistBanner />
        <Stats />
        <Features />
        <HowItWorks />
        <Integrations />
        <Testimonials />
        <Pricing />
        <Waitlist />
      </main>
      <Footer />
    </div>
  );
}
