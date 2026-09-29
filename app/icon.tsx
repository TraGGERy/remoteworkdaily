import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FF524D 0%, #FF4742 50%, #D92D28 100%)",
          borderRadius: "16px",
          position: "relative",
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="24" cy="24" r="14" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.95" />
          <ellipse cx="24" cy="24" rx="7" ry="14" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.85" />
          <line x1="10" y1="24" x2="38" y2="24" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.85" />
          <circle cx="24" cy="24" r="3.5" fill="#FFFFFF" />
          <circle cx="35" cy="13" r="3" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
