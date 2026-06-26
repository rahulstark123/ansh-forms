import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customId = searchParams.get("customId");
    const slug = searchParams.get("slug");

    if (!customId || !slug) {
      return NextResponse.json({ error: "Missing tracking reference ID or URL slug." }, { status: 400 });
    }

    // Retrieve form by slug to verify ownership
    const form = await db.form.findUnique({
      where: { slug }
    });

    if (!form) {
      return NextResponse.json({ error: "Associated form not found in workspace." }, { status: 404 });
    }

    const settingsObj = typeof form.settings === "string" ? JSON.parse(form.settings) : form.settings || {};
    if (settingsObj.requiresApproval !== true) {
      return NextResponse.json(
        { error: "This form does not use approval tracking." },
        { status: 403 }
      );
    }

    // Retrieve submission by custom ID
    const submission = await db.submission.findFirst({
      where: {
        customId,
        formId: form.id
      }
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission reference ID not found in form records." }, { status: 404 });
    }

    const brandColor = settingsObj.brandColor || "emerald";

    return NextResponse.json({
      formTitle: form.title,
      brandColor,
      submission: {
        customId: submission.customId,
        status: submission.status,
        statusComment: submission.statusComment,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt
      }
    });
  } catch (error: any) {
    console.error("GET Public Status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
