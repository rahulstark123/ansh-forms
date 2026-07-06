import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "Settings",
  noIndex: true,
});

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
