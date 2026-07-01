import { SiteHeader } from "./header";
import { Hero } from "./hero";
import { Features } from "./features";
import { Benefits } from "./benefits";
import { Pricing } from "./pricing";
import { Faq } from "./faq";
export function LandingPage({ blogSection }: { blogSection?: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <Benefits />
        <Pricing />
        <Faq />
        {blogSection}
      </main>
    </>
  );
}
