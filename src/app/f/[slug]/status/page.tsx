import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ensureWorkspaceSlug } from "@/lib/workspace-slug";

export default async function LegacyStatusRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { slug } = await params;
  const { id } = await searchParams;

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
  const query = id ? `?id=${encodeURIComponent(id)}` : "";
  redirect(`/${companySlug}/${slug}/status${query}`);
}
