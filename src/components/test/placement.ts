import type { PrintAreaTemplate } from "./template";

export type Placement = {
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PlacementInches = {
  leftIn: number;
  topIn: number;
  widthIn: number;
  heightIn: number;
};

export type PlacementPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PlacementIntersection = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Converts a rect defined on the template canvas into normalized coordinates inside the print area.
// This is the core persistence format: x/y/width/height are all 0..1 relative to the print box only.
export const canvasSpaceToNormalizedPlacement = (
  rectOnCanvas: Rect,
  printAreaOnCanvas: Rect,
  assetId: string,
  rotation = 0
): Placement => ({
  assetId,
  x: (rectOnCanvas.x - printAreaOnCanvas.x) / printAreaOnCanvas.width,
  y: (rectOnCanvas.y - printAreaOnCanvas.y) / printAreaOnCanvas.height,
  width: rectOnCanvas.width / printAreaOnCanvas.width,
  height: rectOnCanvas.height / printAreaOnCanvas.height,
  rotation,
});

// Inches are derived from normalized placement by scaling against the real physical print dimensions.
// Because the saved placement is relative to the print area, preview zoom does not affect these numbers.
export const normalizedPlacementToInches = (
  placement: Placement,
  template: PrintAreaTemplate
): PlacementInches => ({
  leftIn: placement.x * template.printAreaReal.widthIn,
  topIn: placement.y * template.printAreaReal.heightIn,
  widthIn: placement.width * template.printAreaReal.widthIn,
  heightIn: placement.height * template.printAreaReal.heightIn,
});

// Export pixels use the same normalized data, but multiply by the print-ready pixel dimensions instead.
// This is what lets the export target 3600x4800 even if the on-screen preview is much smaller.
export const normalizedPlacementToExportPixels = (
  placement: Placement,
  template: PrintAreaTemplate
): PlacementPixels => ({
  x: Math.round(placement.x * template.printAreaReal.widthPx),
  y: Math.round(placement.y * template.printAreaReal.heightPx),
  width: Math.round(placement.width * template.printAreaReal.widthPx),
  height: Math.round(placement.height * template.printAreaReal.heightPx),
});

// The saved transform can extend outside the print area. Manufacturing/export only uses the
// part that intersects the real print area bounds, which are normalized to 0..1 here.
export const getPlacementIntersectionWithPrintArea = (
  placement: Placement
): PlacementIntersection | null => {
  const left = Math.max(placement.x, 0);
  const top = Math.max(placement.y, 0);
  const right = Math.min(placement.x + placement.width, 1);
  const bottom = Math.min(placement.y + placement.height, 1);

  if (right <= left || bottom <= top) {
    return null;
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

export const clampPlacementToBounds = (
  placement: Placement,
  minWidth: number,
  minHeight: number
): Placement => {
  const width = Math.max(placement.width, minWidth);
  const height = Math.max(placement.height, minHeight);

  return {
    ...placement,
    width,
    height,
    x: placement.x,
    y: placement.y,
  };
};
