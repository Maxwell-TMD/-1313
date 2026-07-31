import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
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
          borderRadius: 14,
          background: "#16879a",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 4,
            paddingBottom: 5,
            border: "3px solid white",
            borderRadius: 10,
          }}
        >
          {[10, 17, 24].map((height) => (
            <div
              key={height}
              style={{
                width: 5,
                height,
                borderRadius: 3,
                background: "white",
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
