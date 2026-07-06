import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "Sign In",
  description: "Sign in to your ANSH Forms workspace to manage your forms, view response analytics, and more.",
  path: "/login",
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
