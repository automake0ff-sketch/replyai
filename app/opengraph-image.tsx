import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ReplyAI — Respuestas a reseñas de Google en segundos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          backgroundColor: "#FBF9F6",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontStyle: "italic",
            color: "#14110F",
          }}
        >
          ReplyAI
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 40,
            color: "#14110F",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Responde a tus reseñas de Google
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 40,
            fontStyle: "italic",
            color: "#C9603A",
          }}
        >
          en 10 segundos, no en 10 minutos.
        </div>
      </div>
    ),
    { ...size }
  );
}
