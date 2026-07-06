import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "AI Form Builder",
  noIndex: true,
});

export default function AIBuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
