import { NextResponse } from "next/server";
import { incrementViews } from "@/lib/jobs-repository";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  incrementViews(id);
  return NextResponse.json({ success: true });
}
