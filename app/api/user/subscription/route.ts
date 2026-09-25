import { NextResponse } from "next/server";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ active: false, error: "Email query parameter is required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("candidate_passes")
          .select("id, email, status, created_at")
          .ilike("email", normalizedEmail)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Supabase candidate pass check error:", error);
        } else if (data) {
          return NextResponse.json({ active: true, pass: data });
        }
      }
    }

    return NextResponse.json({ active: false, pass: null });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json({ active: false, error: "Internal server error" }, { status: 500 });
  }
}
