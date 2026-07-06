import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "Templates Library",
  noIndex: true,
});

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
