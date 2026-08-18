import type { MetadataRoute } from "next";

// TODO: Replace with the real production domain once deployed
const BASE_URL = "https://nkfashionstore.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
        disallow:  [
          "/admin/",           // Internal admin panel — never index
          "/cart",             // No SEO value
          "/checkout",         // No SEO value
          "/order-confirmation/", // No SEO value
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
