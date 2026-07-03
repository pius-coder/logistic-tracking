import { buildMetadata } from "@/lib/metadata";
import { callAuraServer } from "@/aura/server/call";
import { LandingPage } from "@/components/home/landing";
import { BlogSection } from "@/components/home/blog-section";
import type { LandingContent } from "@/components/home/types";
import type { ProductTestimonialView, ProductView } from "@/features/catalog/types";
import type { SiteContentMap } from "@/features/site";
import { contentJson, contentText } from "@/lib/site-content";

export async function generateMetadata() {
  const data = await callAuraServer<{ values: SiteContentMap }>({
    operationName: "site.content",
    params: { sections: ["metadata"] },
    source: "rsc",
  }).catch(() => ({ values: {} }));

  return buildMetadata({
    title: contentText(data.values, "metadata.homeTitle"),
    description: contentText(data.values, "metadata.homeDescription"),
  });
}

export default async function HomePage() {
  const [contentData, productsData, testimonialsData] = await Promise.all([
    callAuraServer<{ values: SiteContentMap }>({
      operationName: "site.content",
      params: {
        sections: ["header", "hero", "products", "features", "benefits", "faq", "pricing", "blog"],
      },
      source: "rsc",
    }).catch(() => ({ values: {} })),
    callAuraServer<{ products: ProductView[] }>({
      operationName: "catalog.products",
      source: "rsc",
    }).catch(() => ({ products: [] })),
    callAuraServer<{ testimonials: ProductTestimonialView[] }>({
      operationName: "catalog.landingTestimonials",
      source: "rsc",
    }).catch(() => ({ testimonials: [] })),
  ]);

  const content = buildLandingContent(contentData.values);
  const blogSection = <BlogSection content={content.blog} />;

  return (
    <LandingPage
      blogSection={blogSection}
      content={content}
      products={productsData.products}
      testimonials={testimonialsData.testimonials}
    />
  );
}

function buildLandingContent(values: SiteContentMap): LandingContent {
  return {
    header: {
      brandName: contentText(values, "header.brandName"),
      phone: contentText(values, "header.phone"),
      navLinks: contentJson(values, "header.navLinks", []),
    },
    hero: {
      badge: contentText(values, "hero.badge"),
      title: contentText(values, "hero.title"),
      accent: contentText(values, "hero.accent"),
      description: contentText(values, "hero.description"),
      desktopImage: contentText(values, "hero.desktopImage"),
      mobileImage: contentText(values, "hero.mobileImage"),
      trackingPlaceholder: contentText(values, "hero.trackingPlaceholder"),
      trackingButton: contentText(values, "hero.trackingButton"),
      stats: contentJson(values, "hero.stats", []),
    },
    products: {
      eyebrow: contentText(values, "products.eyebrow"),
      title: contentText(values, "products.title"),
      accent: contentText(values, "products.accent"),
      description: contentText(values, "products.description"),
    },
    features: {
      eyebrow: contentText(values, "features.eyebrow"),
      title: contentText(values, "features.title"),
      accent: contentText(values, "features.accent"),
      description: contentText(values, "features.description"),
      stats: contentJson(values, "features.stats", []),
      services: contentJson(values, "features.services", []),
      trackingSteps: contentJson(values, "features.trackingSteps", []),
      testimonialEyebrow: contentText(values, "features.testimonialEyebrow"),
      testimonialTitle: contentText(values, "features.testimonialTitle"),
      testimonialDescription: contentText(values, "features.testimonialDescription"),
    },
    benefits: {
      eyebrow: contentText(values, "benefits.eyebrow"),
      title: contentText(values, "benefits.title"),
      accent: contentText(values, "benefits.accent"),
      description: contentText(values, "benefits.description"),
      items: contentJson(values, "benefits.items", []),
    },
    faq: {
      eyebrow: contentText(values, "faq.eyebrow"),
      title: contentText(values, "faq.title"),
      description: contentText(values, "faq.description"),
      items: contentJson(values, "faq.items", []),
    },
    pricing: {
      eyebrow: contentText(values, "pricing.eyebrow"),
      title: contentText(values, "pricing.title"),
      description: contentText(values, "pricing.description"),
      panelTitle: contentText(values, "pricing.panelTitle"),
      panelDescription: contentText(values, "pricing.panelDescription"),
      addressLabel: contentText(values, "pricing.addressLabel"),
      address: contentText(values, "pricing.address"),
      phoneLabel: contentText(values, "pricing.phoneLabel"),
      phone: contentText(values, "pricing.phone"),
      emailLabel: contentText(values, "pricing.emailLabel"),
      email: contentText(values, "pricing.email"),
      availabilityTitle: contentText(values, "pricing.availabilityTitle"),
      availabilityBody: contentText(values, "pricing.availabilityBody"),
      formEyebrow: contentText(values, "pricing.formEyebrow"),
      formTitle: contentText(values, "pricing.formTitle"),
      formDescription: contentText(values, "pricing.formDescription"),
      privacy: contentText(values, "pricing.privacy"),
    },
    blog: {
      eyebrow: contentText(values, "blog.eyebrow"),
      title: contentText(values, "blog.title"),
      accent: contentText(values, "blog.accent"),
      description: contentText(values, "blog.description"),
      cta: contentText(values, "blog.cta"),
    },
  };
}
