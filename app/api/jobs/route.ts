import { NextResponse } from "next/server";
import { getAllJobs, filterJobs } from "@/lib/jobs-repository";
import { FilterState } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const shouldRefresh = searchParams.get("refresh") === "true" || searchParams.has("_t");
  const query = searchParams.get("search") || "";
  const location = searchParams.get("location") || "";
  const category = searchParams.get("category") || "";
  const minSalary = Number(searchParams.get("salary")) || 0;
  const benefits = searchParams.get("benefits") ? searchParams.get("benefits")!.split(",") : [];
  const tags = searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [];
  const sortBy = (searchParams.get("sort") as FilterState["sortBy"]) || "default";
  const freshness = (searchParams.get("freshness") as FilterState["freshness"]) || "all";
  const directAtsOnly = searchParams.get("directAtsOnly") === "true";
  const workplace = (searchParams.get("workplace") as FilterState["workplaceType"]) || undefined;

  const allJobs = getAllJobs(shouldRefresh);
  const filtered = filterJobs(allJobs, {
    query,
    location,
    category,
    workplaceType: workplace,
    minSalary,
    benefits,
    tags,
    sortBy,
    freshness,
    directAtsOnly,
  });


  return NextResponse.json({
    count: filtered.length,
    jobs: filtered,
  });
}
