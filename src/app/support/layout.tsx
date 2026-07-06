import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "Support",
  description: "Get in touch with the ANSH Forms support team. We are here to help you build and manage better forms.",
  path: "/support",
});

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
