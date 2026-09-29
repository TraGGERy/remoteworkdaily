import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Verified Remote Jobs & Transparent Pay";
  const subtitle =
    searchParams.get("subtitle") ||
    "Hand-curated remote software engineering, design, marketing, and leadership opportunities updated daily.";

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
          padding: "60px 64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-100px",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(255, 71, 66, 0.25) 0%, rgba(255, 71, 66, 0) 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "550px",
            height: "550px",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 70%)",
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
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                backgroundColor: "#FF4742",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(255, 71, 66, 0.4)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="14" stroke="#FFFFFF" strokeWidth="3" />
                <ellipse cx="24" cy="24" rx="7" ry="14" stroke="#FFFFFF" strokeWidth="2.5" />
                <line x1="10" y1="24" x2="38" y2="24" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="24" cy="24" r="4" fill="#FFFFFF" />
              </svg>
            </div>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
              Remote Work <span style={{ color: "#FF4742" }}>Daily</span>
            </span>
          </div>

          <div
            style={{
              padding: "8px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#34D399",
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            ✓ 100% VERIFIED REMOTE
          </div>
        </div>

        {/* Center Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            zIndex: 10,
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: 900,
              color: "#FFFFFF",
              lineHeight: 1.12,
              letterSpacing: "-1.5px",
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: "22px",
              color: "#a1a1aa",
              lineHeight: 1.45,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </div>

          {/* Key Value Props Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "12px",
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                color: "#e4e4e7",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              <span>💼</span>
              <span>3,500+ Curated Roles</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "12px",
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                color: "#e4e4e7",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              <span>💰</span>
              <span>100% Transparent Salaries</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "12px",
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                color: "#e4e4e7",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              <span>🚀</span>
              <span>Direct Company ATS</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "20px", color: "#a1a1aa", fontSize: "16px" }}>
            <span style={{ color: "#FFFFFF", fontWeight: 700 }}>remoteworkdaily.com</span>
            <span>•</span>
            <span>Updated Daily at 00:00 UTC</span>
          </div>

          <div
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              backgroundColor: "#FF4742",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 800,
              boxShadow: "0 6px 20px rgba(255, 71, 66, 0.35)",
            }}
          >
            Browse Verified Jobs →
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
