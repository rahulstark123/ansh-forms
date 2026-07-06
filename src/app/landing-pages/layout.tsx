import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "Landing Pages Manager",
  noIndex: true,
});

export default function LandingPagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
