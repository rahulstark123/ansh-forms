import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ensureWorkspaceSlug } from "@/lib/workspace-slug";

export default async function LegacyFormRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const form = await db.form.findUnique({
    where: { slug },
    include: {
      profile: {
        include: { workspace: true },
      },
    },
  });

  if (!form) notFound();

  const companySlug = await ensureWorkspaceSlug(form.profile.workspace);
  redirect(`/${companySlug}/${slug}`);
}
