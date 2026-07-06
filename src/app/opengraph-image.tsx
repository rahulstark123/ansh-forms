import { ImageResponse } from "next/og";
import { SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from "@/lib/site";

export const runtime = "edge";
export const alt = "ANSH Forms";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#8b5cf6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            F
          </div>
          <span
            style={{
              fontSize: "32px",
              fontWeight: "900",
              color: "#ffffff",
              letterSpacing: "0.15em",
            }}
          >
            ANSH FORMS
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "52px",
            fontWeight: "bold",
            color: "#ffffff",
            textAlign: "center",
            marginBottom: "24px",
            lineHeight: 1.25,
            paddingLeft: "40px",
            paddingRight: "40px",
          }}
        >
          {DEFAULT_TITLE}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: "20px",
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "960px",
            lineHeight: 1.6,
          }}
        >
          {DEFAULT_DESCRIPTION}
        </p>

        {/* Footer Tagline */}
        <div
          style={{
            marginTop: "60px",
            fontSize: "14px",
            fontWeight: "bold",
            color: "#52525b",
            letterSpacing: "0.2em",
          }}
        >
          BY ANSH APPS • BUILT FOR BHARAT, READY FOR THE WORLD
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
