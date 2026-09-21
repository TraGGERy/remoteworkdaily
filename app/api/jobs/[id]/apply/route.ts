import { NextResponse } from "next/server";
import { incrementApplies } from "@/lib/jobs-repository";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  incrementApplies(id);
  return NextResponse.json({ success: true });
}
