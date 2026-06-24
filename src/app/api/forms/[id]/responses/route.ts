import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: formId } = await params;
    const submissions = await db.submission.findMany({
      where: { formId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (error: any) {
    console.error("GET Responses error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { submissionId, status, statusComment } = body;

    if (!submissionId || !status) {
      return NextResponse.json({ error: "Missing submission ID or status." }, { status: 400 });
    }

    const submission = await db.submission.update({
      where: { id: submissionId },
      data: {
        status,
        statusComment: statusComment || "",
      },
    });

    return NextResponse.json({ message: "Submission status updated", submission });
  } catch (error: any) {
    console.error("PUT Responses status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
