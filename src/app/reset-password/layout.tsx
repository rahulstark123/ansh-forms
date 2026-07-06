import { buildSiteMetadata } from "@/lib/seo";

export const metadata = buildSiteMetadata({
  title: "Reset Password",
  description: "Reset your password for your ANSH Forms account.",
  path: "/reset-password",
});

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
