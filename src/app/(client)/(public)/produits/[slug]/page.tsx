import { notFound } from "next/navigation";
import { PRODUCTS } from "@/components/home/landing-data";
import { ProductDetail } from "@/components/products/ProductDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
