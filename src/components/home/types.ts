import type { ProductTestimonialView, ProductView } from "@/features/catalog/types";

export interface NavLink {
  label: string;
  href: string;
}

export interface HeaderContent {
  brandName: string;
  phone: string;
  navLinks: NavLink[];
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroContent {
  badge: string;
  title: string;
  accent: string;
  description: string;
  desktopImage: string;
  mobileImage: string;
  trackingPlaceholder: string;
  trackingButton: string;
  stats: HeroStat[];
}

export interface ProductsContent {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
}

export interface ServiceContent {
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface TrackingStepContent {
  label: string;
  time: string;
  done: boolean;
}

export interface FeaturesContent {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  stats: Array<{ value: string; label: string; icon: string }>;
  services: ServiceContent[];
  trackingSteps: TrackingStepContent[];
  testimonialEyebrow: string;
  testimonialTitle: string;
  testimonialDescription: string;
}

export interface BenefitContent {
  title: string;
  description: string;
  icon: string;
}

export interface BenefitsContent {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  items: BenefitContent[];
}

export interface FaqContent {
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{ question: string; answer: string }>;
}

export interface PricingContent {
  eyebrow: string;
  title: string;
  description: string;
  panelTitle: string;
  panelDescription: string;
  addressLabel: string;
  address: string;
  phoneLabel: string;
  phone: string;
  emailLabel: string;
  email: string;
  availabilityTitle: string;
  availabilityBody: string;
  formEyebrow: string;
  formTitle: string;
  formDescription: string;
  privacy: string;
}

export interface BlogPreviewContent {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  cta: string;
}

export interface LandingContent {
  header: HeaderContent;
  hero: HeroContent;
  products: ProductsContent;
  features: FeaturesContent;
  benefits: BenefitsContent;
  faq: FaqContent;
  pricing: PricingContent;
  blog: BlogPreviewContent;
}

export type LandingProduct = ProductView;
export type LandingTestimonial = ProductTestimonialView;
