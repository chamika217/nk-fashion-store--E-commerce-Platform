import ProductDetailClient from "@/components/ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// generateMetadata removed — server-side Firestore fetch fails in this environment.
// Basic fallback metadata is served from root layout's title template.

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
