import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "Dashboard",
  noIndex: true,
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
