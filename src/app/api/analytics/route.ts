import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthProfile } from "@/lib/api-auth";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function lastSixMonthKeys() {
  const keys: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MONTH_LABELS[d.getMonth()],
    });
  }
  return keys;
}

function buildTrend(
  submissions: { createdAt: Date }[],
  totalViews: number
) {
  const months = lastSixMonthKeys();
  const responsesByKey = new Map<string, number>();

  for (const sub of submissions) {
    const d = new Date(sub.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    responsesByKey.set(key, (responsesByKey.get(key) || 0) + 1);
  }

  const totalResponses = submissions.length;

  return months.map(({ key, label }) => {
    const responses = responsesByKey.get(key) || 0;
    const views =
      totalResponses > 0
        ? Math.round(totalViews * (responses / totalResponses))
        : key === `${new Date().getFullYear()}-${new Date().getMonth()}`
          ? totalViews
          : 0;

    return { month: label, views, responses };
  });
}

export async function GET(req: Request) {
  try {
    const profile = await getAuthProfile(req);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const forms = await db.form.findMany({
      where: { profile: { wid: profile.wid } },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { submissions: true } },
      },
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const submissions = await db.submission.findMany({
      where: {
        form: { profile: { wid: profile.wid } },
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true },
    });

    const items = forms.map((f) => {
      const settings =
        typeof f.settings === "object" && f.settings !== null
          ? (f.settings as Record<string, unknown>)
          : {};
      const responses = f._count.submissions;
      const views = f.views || 0;
      return {
        id: f.id,
        title: f.title,
        slug: f.slug,
        views,
        isLandingPage: !!settings.isLandingPage,
        connectedFormSlug:
          typeof settings.connectedFormSlug === "string"
            ? settings.connectedFormSlug
            : undefined,
        responses,
        conversion: views > 0 ? Math.round((responses / views) * 1000) / 10 : 0,
        createdAt: f.createdAt.toISOString(),
      };
    });

    const totalViews = items
      .filter((x) => !x.isLandingPage)
      .reduce((acc, x) => acc + x.views, 0);

    const trend = buildTrend(submissions, totalViews);

    return NextResponse.json({
      wid: profile.wid,
      forms: items,
      trend,
    });
  } catch (error: unknown) {
    console.error("GET Analytics error:", error);
    const message = error instanceof Error ? error.message : "Failed to load analytics.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
