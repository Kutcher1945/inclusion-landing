import { Nav } from "@/components/ui/nav";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Analytics } from "@/components/sections/analytics";
import { Impact } from "@/components/sections/impact";
import { MapPreview } from "@/components/sections/map-preview";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";
import { getSession } from "@/lib/auth/dal";

export default async function Home() {
  const session = await getSession();
  const user = session ? { username: session.user.username } : null;

  return (
    <>
      <Nav user={user} />
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
