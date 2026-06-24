import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/r2";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadFile(file.name, buffer, file.type);

    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error("File upload endpoint error:", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
