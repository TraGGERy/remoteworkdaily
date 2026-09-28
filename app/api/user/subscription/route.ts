import { NextResponse } from "next/server";
import { getActiveCandidatePass } from "@/lib/candidate-passes-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ active: false, error: "Email query parameter is required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const pass = await getActiveCandidatePass(normalizedEmail);
    if (pass && pass.status === "active") {
      return NextResponse.json({ active: true, pass });
    }

    return NextResponse.json({ active: false, pass: null });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json({ active: false, error: "Internal server error" }, { status: 500 });
  }
}
