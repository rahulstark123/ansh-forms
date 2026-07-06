import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "My Forms",
  noIndex: true,
});

export default function FormsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
