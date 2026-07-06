import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "Onboarding",
  noIndex: true,
});

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
