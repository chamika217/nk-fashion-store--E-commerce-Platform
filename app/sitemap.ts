import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/productService";

// TODO: Replace with the real production domain once deployed
const BASE_URL = "https://nkfashionstore.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url:              `${BASE_URL}/`,
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         1,
    },
    {
      url:              `${BASE_URL}/shop`,
      lastModified:     new Date(),
      changeFrequency:  "daily",
      priority:         0.9,
    },
    {
      url:              `${BASE_URL}/about`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.5,
    },
    {
      url:              `${BASE_URL}/contact`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.5,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p) => p.status !== "hidden")
    .map((p) => ({
      url:             `${BASE_URL}/product/${p.id}`,
      lastModified:    p.createdAt ? new Date(p.createdAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority:        0.8,
    }));

  return [...staticRoutes, ...productRoutes];
}
