import { NextResponse } from "next/server";
import { getJobById, incrementApplies } from "@/lib/jobs-repository";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJobById(id);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  incrementApplies(id);
  return NextResponse.json({ success: true, applyUrl: job.applyUrl });
}
