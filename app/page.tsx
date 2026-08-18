import HomeClient from "@/components/HomeClient";
// Page is a thin shell — all data fetching happens client-side in HomeClient
// to avoid server-side Firebase gRPC/SSL issues in Next.js Server Components.
export const dynamic = "force-dynamic";

export default function Home() {
  return <HomeClient />;
}
