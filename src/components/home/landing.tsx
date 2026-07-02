import { SiteHeader } from "./header";
import { Hero } from "./hero";
import { Features } from "./features";
import { Products } from "./products";
import { Benefits } from "./benefits";
import { Pricing } from "./pricing";
import { Faq } from "./faq";
export function LandingPage({ blogSection }: { blogSection?: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div>
        <Hero />
        <Products />
        <Features />
        <Benefits />
        <Pricing />
        <Faq />
        {blogSection}
      </div>
    </>
  );
}
