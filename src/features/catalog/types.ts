export interface ProductTestimonialView {
  id: string;
  name: string;
  advice: string;
  star: number;
  showOnLanding: boolean;
  productId: string | null;
}

export interface ProductView {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  gallery: string[];
  priceXaf: number;
  likes: number;
  features: string[];
  isPublished: boolean;
  sortOrder: number;
  publishedAt: string | null;
  testimonials: ProductTestimonialView[];
  averageRating: number;
  testimonialCount: number;
}
