import type { Workspace } from "@prisma/client";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";

/** Pick a unique workspace slug from a display name. */
export async function resolveUniqueWorkspaceSlug(
  name: string,
  excludeWid?: number,
): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 1;

  while (true) {
    const taken = await db.workspace.findFirst({
      where: {
        slug: candidate,
        ...(excludeWid !== undefined ? { NOT: { wid: excludeWid } } : {}),
      },
    });
    if (!taken) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

/** Ensure a workspace has a unique public slug; backfills existing rows. */
export async function ensureWorkspaceSlug(workspace: Workspace): Promise<string> {
  if (workspace.slug) return workspace.slug;

  const candidate = await resolveUniqueWorkspaceSlug(
    workspace.name || `workspace-${workspace.wid}`,
    workspace.wid,
  );

  const updated = await db.workspace.update({
    where: { wid: workspace.wid },
    data: { slug: candidate },
  });

  return updated.slug!;
}

export async function getWorkspaceSlugForWid(wid: number): Promise<string> {
  const workspace = await db.workspace.findUnique({ where: { wid } });
  if (!workspace) return "workspace";
  return ensureWorkspaceSlug(workspace);
}

export async function getWorkspaceSlugForFormSlug(formSlug: string): Promise<string | null> {
  const form = await db.form.findUnique({
    where: { slug: formSlug },
    include: { profile: { include: { workspace: true } } },
  });
  if (!form) return null;
  return ensureWorkspaceSlug(form.profile.workspace);
}
