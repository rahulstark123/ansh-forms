import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "Sign Up",
  description: "Create your free ANSH Forms workspace in under two minutes. No credit card required.",
  path: "/signup",
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
