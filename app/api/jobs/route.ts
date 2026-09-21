import { NextResponse } from "next/server";
import { getAllJobs, filterJobs } from "@/lib/jobs-repository";
import { FilterState } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("search") || "";
  const location = searchParams.get("location") || "";
  const category = searchParams.get("category") || "";
  const minSalary = Number(searchParams.get("salary")) || 0;
  const benefits = searchParams.get("benefits") ? searchParams.get("benefits")!.split(",") : [];
  const tags = searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [];
  const sortBy = (searchParams.get("sort") as FilterState["sortBy"]) || "default";

  const allJobs = getAllJobs();
  const filtered = filterJobs(allJobs, {
    query,
    location,
    category,
    minSalary,
    benefits,
    tags,
    sortBy,
  });

  return NextResponse.json({
    count: filtered.length,
    jobs: filtered,
  });
}
