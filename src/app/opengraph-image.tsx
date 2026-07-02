import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1f36 0%, #2d2d2d 100%)",
          color: "white",
          fontFamily: "sans-serif",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#fbbf24",
              boxShadow: "0 0 20px rgba(251,191,36,0.5)",
            }}
          />
          <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: "0.05em" }}>
            JC Import Express
          </span>
        </div>
        <span style={{ fontSize: 28, opacity: 0.8, marginTop: 8 }}>
          Import Export Afrique — Devis en 24h
        </span>
      </div>
    ),
    size,
  );
}
