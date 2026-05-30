import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      status: "not_configured",
      message: "AI mockup generation route is reserved for a future text-to-image or prompt-to-3D workflow."
    },
    { status: 501 }
  );
}
