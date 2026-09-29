import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getJobById } from "@/lib/jobs-repository";
import { formatSalary } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const job = id ? getJobById(id) : null;

  const title = job?.title || searchParams.get("title") || "Senior Remote Engineer";
  const company = job?.company || searchParams.get("company") || "Remote First Co";
  const location = job?.location || searchParams.get("location") || "Worldwide";
  const workplaceType = job?.workplaceType || "100% Remote";
  const salary = job
    ? formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)
    : "$120,000 - $180,000 USD";
  const tags = (job?.tags && job.tags.length > 0 ? job.tags.slice(0, 3) : ["Remote", "Full-Time", "Verified"]);

  const companyInitial = company.charAt(0).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          padding: "54px 64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient background glows */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-80px",
            width: "550px",
            height: "550px",
            background: "radial-gradient(circle, rgba(255, 71, 66, 0.22) 0%, rgba(255, 71, 66, 0) 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            right: "-100px",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0) 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Top Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
          }}
        >
          {/* Logo & Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#FF4742",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(255, 71, 66, 0.4)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="14" stroke="#FFFFFF" strokeWidth="3" />
                <ellipse cx="24" cy="24" rx="7" ry="14" stroke="#FFFFFF" strokeWidth="2.5" />
                <line x1="10" y1="24" x2="38" y2="24" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="24" cy="24" r="4" fill="#FFFFFF" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "22px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
                Remote Work <span style={{ color: "#FF4742" }}>Daily</span>
              </span>
              <span style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: 600, letterSpacing: "0.5px" }}>
                VERIFIED REMOTE CAREERS
              </span>
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "9999px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#34D399",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#34D399",
                }}
              />
              <span>VERIFIED DIRECT ATS</span>
            </div>
            <div
              style={{
                padding: "8px 16px",
                borderRadius: "9999px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#e4e4e7",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {workplaceType}
            </div>
          </div>
        </div>

        {/* Center Main Job Details */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            zIndex: 10,
            marginTop: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Company info */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                backgroundColor: "#27272a",
                border: "1px solid #3f3f46",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 800,
                color: "#FFFFFF",
              }}
            >
              {companyInitial}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 700, color: "#d4d4d8" }}>
                {company}
              </span>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 900,
                }}
              >
                ✓
              </div>
            </div>
          </div>

          {/* Job Title */}
          <div
            style={{
              fontSize: title.length > 36 ? "44px" : "54px",
              fontWeight: 900,
              color: "#FFFFFF",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              maxWidth: "1050px",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>

          {/* Metrics & Highlights */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            {/* Salary pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "14px",
                backgroundColor: "rgba(16, 185, 129, 0.18)",
                border: "1.5px solid #10b981",
                color: "#6ee7b7",
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              <span>💰</span>
              <span>{salary}</span>
            </div>

            {/* Location pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "14px",
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                color: "#e4e4e7",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              <span>🌍</span>
              <span>{location}</span>
            </div>

            {/* Tags */}
            {tags.map((tag, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 18px",
                  borderRadius: "14px",
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  color: "#a1a1aa",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "24px",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px", color: "#a1a1aa", fontSize: "15px", fontWeight: 500 }}>
            <span>⚡ Zero Ghost Jobs Policy</span>
            <span>•</span>
            <span>🎯 100% Upfront Transparent Pay</span>
            <span>•</span>
            <span style={{ color: "#FFFFFF", fontWeight: 700 }}>remoteworkdaily.com</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              borderRadius: "12px",
              backgroundColor: "#FF4742",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 800,
              boxShadow: "0 6px 20px rgba(255, 71, 66, 0.35)",
            }}
          >
            <span>Apply Directly</span>
            <span>→</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    }
  );
}
