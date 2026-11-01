import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const headline = searchParams.get("title") || "Stop Being Applicant #500 on LinkedIn";
  const subheadline =
    searchParams.get("sub") || "Apply directly via Greenhouse & Lever ATS portals with 100% verified transparent pay.";
  const ctaText = searchParams.get("cta") || "Unlock Direct ATS Feeds →";
  const badgeText = searchParams.get("badge") || "⚡ 6-HOUR EARLY ACCESS";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0B0F17",
          padding: "54px 64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-80px",
            width: "550px",
            height: "550px",
            background: "radial-gradient(circle, rgba(255, 71, 66, 0.28) 0%, rgba(255, 71, 66, 0) 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-140px",
            right: "-100px",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0) 70%)",
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
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "24px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
                Remote Work <span style={{ color: "#FF4742" }}>Daily</span>
              </span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "1px" }}>
                VERIFIED CAREER PORTALS
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.18)",
              border: "1px solid rgba(16, 185, 129, 0.5)",
              color: "#34D399",
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "0.5px",
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
            <span>DIRECT ATS VERIFIED</span>
          </div>
        </div>

        {/* Center Main Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            maxWidth: "1050px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              alignSelf: "flex-start",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              color: "#FBBF24",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "0.5px",
            }}
          >
            <span>{badgeText}</span>
          </div>

          <div
            style={{
              fontSize: "52px",
              fontWeight: 900,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
            }}
          >
            {headline}
          </div>

          <div
            style={{
              fontSize: "20px",
              color: "#9CA3AF",
              lineHeight: 1.4,
              maxWidth: "880px",
            }}
          >
            {subheadline}
          </div>
        </div>

        {/* Bottom Split Proof & CTA Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
            gap: "24px",
          }}
        >
          {/* Comparison summary */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "14px 20px",
                borderRadius: "16px",
                backgroundColor: "rgba(31, 41, 55, 0.6)",
                border: "1px solid rgba(75, 85, 99, 0.4)",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#EF4444" }}>✕ TRADITIONAL BOARDS</span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#D1D5DB", marginTop: "4px" }}>
                500+ applicants • Ghost posts
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "14px 20px",
                borderRadius: "16px",
                backgroundColor: "rgba(6, 78, 59, 0.5)",
                border: "1px solid rgba(16, 185, 129, 0.5)",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#34D399" }}>✓ REMOTE WORK DAILY PRO</span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginTop: "4px" }}>
                Top 15 applicants • Direct ATS
              </span>
            </div>
          </div>

          {/* Bold Clickable CTA Box */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 32px",
              borderRadius: "18px",
              backgroundColor: "#FF4742",
              boxShadow: "0 12px 28px rgba(255, 71, 66, 0.45)",
            }}
          >
            <span style={{ fontSize: "20px", fontWeight: 900, color: "#FFFFFF" }}>{ctaText}</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#FEE2E2", marginTop: "4px" }}>
              Plans from $6.99/wk • 7-Day Guarantee
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
