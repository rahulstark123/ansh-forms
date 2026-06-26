import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: formId } = await params;
    const body = await req.json();
    const { answers } = body;

    if (!answers) {
      return NextResponse.json({ error: "Answers are required." }, { status: 400 });
    }

    // Verify form exists
    const form = await db.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }

    const settings =
      typeof form.settings === "string" ? JSON.parse(form.settings) : form.settings || {};
    const requiresApproval = settings.requiresApproval === true;

    // Generate custom reference tracking ID: ANSH-XXXXX
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const customId = `ANSH-${randomDigits}`;

    // Create submission record
    const submission = await db.submission.create({
      data: {
        formId,
        customId,
        answers: answers || {},
        status: requiresApproval ? "Submitted" : "Received",
        statusComment: ""
      },
    });

    return NextResponse.json({
      message: "Response submitted successfully",
      submission,
      requiresApproval,
    });
  } catch (error: any) {
    console.error("POST Submit response error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
