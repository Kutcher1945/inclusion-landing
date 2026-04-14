import { Nav } from "@/components/ui/nav";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Analytics } from "@/components/sections/analytics";
import { Impact } from "@/components/sections/impact";
import { MapPreview } from "@/components/sections/map-preview";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Analytics />
        <Impact />
        <MapPreview />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
