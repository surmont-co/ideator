import { NextResponse } from "next/server";
import { generateProjectSummary } from "@/lib/project-summary";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;
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
