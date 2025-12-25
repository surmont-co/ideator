import { NextResponse, type NextRequest } from "next/server";
import { generateProjectSummary } from "@/lib/project-summary";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, reason: "missing id" }, { status: 400 });
  }

  try {
    const updated = await generateProjectSummary(id);
    return NextResponse.json({ ok: updated });
  } catch (error) {
    console.error("Failed to generate project summary", error);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}
