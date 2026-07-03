import { notFound } from "next/navigation";
import { callAuraServer } from "@/aura/server/call";
import { ProductDetail } from "@/components/products/ProductDetail";
import type { ProductView } from "@/features/catalog/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await callAuraServer<{ product: ProductView | null }>({
    operationName: "catalog.productBySlug",
    params: { slug },
    source: "rsc",
  }).catch(() => ({ product: null }));
  const product = data.product;
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
