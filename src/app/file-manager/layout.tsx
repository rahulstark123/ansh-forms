import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "File Manager",
  noIndex: true,
});

export default function FileManagerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
