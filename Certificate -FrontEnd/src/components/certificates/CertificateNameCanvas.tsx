import { useEffect, useRef } from "react";
import { drawNameWithUnderline } from "@/lib/drawNameWithUnderline";

interface CertificateNameCanvasProps {
  name: string;
  width?: number;
  height?: number;
  fontSizePx?: number;
}

export default function CertificateNameCanvas({
  name,
  width = 900,
  height = 220,
  fontSizePx = 54,
}: CertificateNameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    drawNameWithUnderline(ctx, name, width / 2, height * 0.3, {
      font: `700 ${fontSizePx}px \"Poppins\", \"Times New Roman\", serif`,
      fillStyle: "#0f172a",
      underlineColor: "#0f172a",
      underlineGapPx: Math.max(4, Math.round(fontSizePx * 0.1)),
      underlineThicknessPx: Math.max(1.5, fontSizePx * 0.03),
      underlinePaddingPx: Math.round(fontSizePx * 0.3),
    });
  }, [fontSizePx, height, name, width]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="h-auto w-full rounded-md border border-slate-200"
      aria-label="Certificate name preview"
    />
  );
}
