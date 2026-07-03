import { SiteHeader } from "./header";
import { Hero } from "./hero";
import { Features } from "./features";
import { Products } from "./products";
import { Benefits } from "./benefits";
import { Pricing } from "./pricing";
import { Faq } from "./faq";
import type { LandingContent, LandingProduct, LandingTestimonial } from "./types";

export function LandingPage({
  blogSection,
  content,
  products,
  testimonials,
}: {
  blogSection?: React.ReactNode;
  content: LandingContent;
  products: LandingProduct[];
  testimonials: LandingTestimonial[];
}) {
  return (
    <>
      <SiteHeader content={content.header} />
      <div>
        <Hero content={content.hero} />
        <Products content={content.products} products={products} />
        <Features content={content.features} testimonials={testimonials} />
        <Benefits content={content.benefits} />
        <Pricing content={content.pricing} />
        <Faq content={content.faq} />
        {blogSection}
      </div>
    </>
  );
}
