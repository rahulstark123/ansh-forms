import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/auth/profile?email=xxx  — fetch full profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const profile = await db.profile.findUnique({ where: { email } });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: sanitize(profile) });
  } catch (error: any) {
    console.error("GET /api/auth/profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/auth/profile — update editable profile fields
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { email, name, phone, dob, bloodGroup, officeLocation, pincode, state, city, emergencyName, emergencyPhone, accent } = body;

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const existing = await db.profile.findUnique({ where: { email } });
    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updated = await db.profile.update({
      where: { email },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(dob !== undefined && { dob }),
        ...(bloodGroup !== undefined && { bloodGroup }),
        ...(officeLocation !== undefined && { officeLocation }),
        ...(pincode !== undefined && { pincode }),
        ...(state !== undefined && { state }),
        ...(city !== undefined && { city }),
        ...(emergencyName !== undefined && { emergencyName }),
        ...(emergencyPhone !== undefined && { emergencyPhone }),
        ...(accent !== undefined && { accent }),
      },
    });

    return NextResponse.json({ message: "Profile updated successfully", profile: sanitize(updated) });
  } catch (error: any) {
    console.error("PATCH /api/auth/profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Strip password before returning
function sanitize(profile: any) {
  const { password, ...safe } = profile;
  return safe;
}
