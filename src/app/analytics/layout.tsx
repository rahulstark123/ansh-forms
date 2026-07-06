import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "Analytics",
  noIndex: true,
});

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
