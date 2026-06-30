import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { PRO_PRICING } from "@/lib/pricing";

type SubStatus = "Active" | "Pending" | "Expired" | "Cancelled";

function resolveWorkspacePlan(profiles: { pricingPlan: string; trialEndsAt: Date | null }[]) {
  if (profiles.some((p) => p.pricingPlan === "Pro")) {
    return { plan: "Pro", status: "Active" as SubStatus };
  }

  const trialProfile = profiles.find((p) => p.pricingPlan === "Free Trial");
  if (trialProfile) {
    const trialActive =
      trialProfile.trialEndsAt && new Date(trialProfile.trialEndsAt) > new Date();
    return {
      plan: "Free Trial",
      status: (trialActive ? "Pending" : "Expired") as SubStatus,
    };
  }

  return { plan: "Free", status: "Active" as SubStatus };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const workspaces = await db.workspace.findMany({
      include: {
        profiles: {
          select: {
            pricingPlan: true,
            trialEndsAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const subscriptions = workspaces.map((ws) => {
      const { plan, status } = resolveWorkspacePlan(ws.profiles);
      const seats = ws.profiles.length;
      const startsAt = ws.createdAt;
      const trialProfile = ws.profiles.find((p) => p.pricingPlan === "Free Trial");
      const proProfile = ws.profiles.find((p) => p.pricingPlan === "Pro");
      const expiresAt =
        plan === "Free Trial" && trialProfile?.trialEndsAt
          ? trialProfile.trialEndsAt
          : null;

      return {
        workspaceId: ws.wid,
        workspace: ws.name,
        plan,
        status,
        seats,
        amount: plan === "Pro" ? PRO_PRICING.IN.amount : 0,
        amountDisplay: plan === "Pro" ? PRO_PRICING.IN.display : "₹0",
        cycle: plan === "Pro" ? "Monthly" : "—",
        startsAt: startsAt.toISOString(),
        expiresAt: expiresAt?.toISOString() ?? null,
        transactions: proProfile ? 1 : 0,
        upgradedAt: proProfile?.updatedAt.toISOString() ?? null,
      };
    });

    const active = subscriptions.filter((s) => s.status === "Active" && s.plan === "Pro");
    const pending = subscriptions.filter((s) => s.status === "Pending");
    const monthlyRecurring = active.reduce((sum, s) => sum + s.amount, 0);
    const newThisMonth = subscriptions.filter((s) => {
      if (s.plan !== "Pro" || !s.upgradedAt) return false;
      return new Date(s.upgradedAt) >= monthStart;
    }).length;
    const cancelledOrExpired = subscriptions.filter(
      (s) => s.status === "Expired" || s.status === "Cancelled"
    ).length;
    const activeWorkspaces = subscriptions.filter(
      (s) => s.status === "Active" || s.status === "Pending"
    ).length;
    const totalSeats = active.reduce((sum, s) => sum + s.seats, 0);
    const avgSeats = active.length > 0 ? Math.round((totalSeats / active.length) * 10) / 10 : 0;

    return NextResponse.json({
      subscriptions,
      summary: {
        activeCount: active.length,
        totalCount: subscriptions.length,
        pendingCount: pending.length,
        monthlyRecurring,
        monthlyRecurringDisplay: `₹${monthlyRecurring.toFixed(2)}`,
        newThisMonth,
        cancelledOrExpired,
        avgSeats,
        activeWorkspaces,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load subscriptions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
