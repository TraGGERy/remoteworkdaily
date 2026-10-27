import { NextResponse } from "next/server";
import { z } from "zod";
import { saveCandidateLead, LeadSource } from "@/lib/candidate-leads-repository";
import { saveSubscriber } from "@/lib/subscribers-repository";
import { notifyUserOnboarding } from "@/lib/telegram";

export const dynamic = "force-dynamic";

const LeadSchema = z.object({
  email: z.string().email("A valid email address is required"),
  source: z.enum([
    "onboarding_step_8",
    "onboarding_abandoned_checkout",
    "apply_modal",
    "visitor_modal",
    "employer_job_post_draft",
    "newsletter_popup",
  ] as [LeadSource, ...LeadSource[]]),
  targetRoles: z.array(z.string()).optional(),
  seniority: z.string().optional(),
  minSalary: z.number().optional(),
  workType: z.string().optional(),
  workArrangement: z.string().optional(),
  frustrations: z.array(z.string()).optional(),
  platformsTried: z.array(z.string()).optional(),
  selectedPlan: z.string().optional(),
  jobId: z.string().optional(),
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  ml_visitor_id: z.string().optional(),
  ml_session_id: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = LeadSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const data = result.data;
    const cleanEmail = data.email.toLowerCase().trim();

    // 1. Save lead in candidate-leads repository
    const lead = await saveCandidateLead({
      email: cleanEmail,
      source: data.source,
      target_roles: data.targetRoles,
      seniority: data.seniority,
      min_salary: data.minSalary,
      work_type: data.workType,
      work_arrangement: data.workArrangement,
      frustrations: data.frustrations,
      platforms_tried: data.platformsTried,
      selected_plan: data.selectedPlan,
      job_id: data.jobId,
      job_title: data.jobTitle,
      company_name: data.companyName,
      ml_visitor_id: data.ml_visitor_id,
      ml_session_id: data.ml_session_id,
    });

    // 2. Also register in subscribers for ongoing daily job alerts
    await saveSubscriber({
      email: cleanEmail,
      category: data.targetRoles?.[0] || "lead_captured",
    }).catch(() => {});

    // 3. Dispatch real-time Telegram alert for unconverted lead capture
    notifyUserOnboarding({
      flow: "candidate_13_step",
      email: cleanEmail,
      targetRoles: data.targetRoles,
      experienceLevel: data.seniority,
      salaryExpectation: data.minSalary ? `$${data.minSalary}+` : undefined,
      jobTypes: data.workType ? [data.workType] : undefined,
      frustrations: data.frustrations,
      platformsTried: data.platformsTried,
      selectedPlan: data.selectedPlan || "unconverted_lead",
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: "Lead recorded successfully for win-back automation",
    });
  } catch (error) {
    console.error("[Leads API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to capture lead" },
      { status: 500 }
    );
  }
}
