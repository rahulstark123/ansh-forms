import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(UPLOAD_DIR);
    const fileList = files.map((fileName) => {
      const filePath = path.join(UPLOAD_DIR, fileName);
      const stat = fs.statSync(filePath);
      
      let fileType = "unknown";
      const ext = path.extname(fileName).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"].includes(ext)) {
        fileType = "image";
      } else if ([".pdf", ".doc", ".docx", ".txt"].includes(ext)) {
        fileType = "document";
      } else if ([".zip", ".rar", ".tar", ".gz"].includes(ext)) {
        fileType = "archive";
      }

      return {
        name: fileName,
        url: `/uploads/${fileName}`,
        size: stat.size,
        createdAt: stat.birthtime.toISOString(),
        type: fileType,
      };
    });

    // Sort by most recent
    fileList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ files: fileList });
  } catch (error: any) {
    console.error("List files error:", error);
    return NextResponse.json({ error: "Failed to list files." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("name");

    if (!fileName) {
      return NextResponse.json({ error: "Filename is required." }, { status: 400 });
    }

    const filePath = path.join(UPLOAD_DIR, fileName);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: "Invalid file path access." }, { status: 403 });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ message: "File deleted successfully" });
    } else {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Delete file error:", error);
    return NextResponse.json({ error: "Failed to delete file." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
