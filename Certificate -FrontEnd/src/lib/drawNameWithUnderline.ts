export interface DrawNameWithUnderlineOptions {
  font?: string;
  fillStyle?: string | CanvasGradient | CanvasPattern;
  underlineColor?: string | CanvasGradient | CanvasPattern;
  underlineThicknessPx?: number;
  underlineGapPx?: number;
  underlinePaddingPx?: number;
  underlineWidthPx?: number;
  maxTextWidthPx?: number;
}

export interface DrawNameWithUnderlineResult {
  textWidthPx: number;
  textHeightPx: number;
  textTopY: number;
  baselineY: number;
  textBottomY: number;
  underlineStartX: number;
  underlineEndX: number;
  underlineY: number;
}

const DEFAULT_UNDERLINE_GAP_PX = 5;
const DEFAULT_UNDERLINE_THICKNESS_PX = 1.5;
const DEFAULT_ASCENT_RATIO = 0.8;
const DEFAULT_DESCENT_RATIO = 0.2;

function parseFontSizePx(font: string): number {
  const match = /(\d+(?:\.\d+)?)px/.exec(font);
  return match ? Number(match[1]) : 16;
}

function resolveVerticalMetrics(metrics: TextMetrics, fontSizePx: number): { ascent: number; descent: number; height: number } {
  const ascent =
    metrics.actualBoundingBoxAscent ?? metrics.fontBoundingBoxAscent ?? fontSizePx * DEFAULT_ASCENT_RATIO;
  const descent =
    metrics.actualBoundingBoxDescent ?? metrics.fontBoundingBoxDescent ?? fontSizePx * DEFAULT_DESCENT_RATIO;

  return {
    ascent,
    descent,
    height: ascent + descent,
  };
}

function toCrispY(value: number, lineWidth: number): number {
  const rounded = Math.round(value);
  return lineWidth % 2 === 1 ? rounded + 0.5 : rounded;
}

/**
 * Draws centered text with an underline positioned from real text metrics.
 * startY is the top Y position of the text block (not baseline).
 */
export function drawNameWithUnderline(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  options: DrawNameWithUnderlineOptions = {}
): DrawNameWithUnderlineResult {
  const safeText = text.trim();
  if (!safeText) {
    throw new Error("Text is required for drawNameWithUnderline.");
  }

  ctx.save();
  try {
    if (options.font) {
      ctx.font = options.font;
    }

    if (options.fillStyle) {
      ctx.fillStyle = options.fillStyle;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    const textMetrics = ctx.measureText(safeText);
    const fontSizePx = parseFontSizePx(ctx.font);
    const { ascent, descent, height } = resolveVerticalMetrics(textMetrics, fontSizePx);

    const baselineY = startY + ascent;
    ctx.fillText(safeText, centerX, baselineY, options.maxTextWidthPx);

    const textBottomY = baselineY + descent;

    const underlineGapPx = options.underlineGapPx ?? DEFAULT_UNDERLINE_GAP_PX;
    const underlinePaddingPx = options.underlinePaddingPx ?? 0;
    const underlineThicknessPx = options.underlineThicknessPx ?? DEFAULT_UNDERLINE_THICKNESS_PX;

    const underlineWidth =
      options.underlineWidthPx ?? Math.max(0, textMetrics.width + underlinePaddingPx * 2);

    const underlineStartX = centerX - underlineWidth / 2;
    const underlineEndX = centerX + underlineWidth / 2;
    const underlineY = toCrispY(textBottomY + underlineGapPx, underlineThicknessPx);

    if (options.underlineColor) {
      ctx.strokeStyle = options.underlineColor;
    }

    ctx.lineWidth = underlineThicknessPx;
    ctx.beginPath();
    ctx.moveTo(underlineStartX, underlineY);
    ctx.lineTo(underlineEndX, underlineY);
    ctx.stroke();

    return {
      textWidthPx: textMetrics.width,
      textHeightPx: height,
      textTopY: startY,
      baselineY,
      textBottomY,
      underlineStartX,
      underlineEndX,
      underlineY,
    };
  } finally {
    ctx.restore();
  }
}
