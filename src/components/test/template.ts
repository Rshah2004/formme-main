export type HoodieSize = "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "4XL";
export type SupportedPrintSize = Exclude<HoodieSize, "4XL">;
export type HoodieSide = "front" | "back";

export type PrintAreaTemplate = {
  canvasWidth: number;
  canvasHeight: number;
  mockupUrl: string;
  printAreaOnCanvas: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  printAreaReal: {
    widthPx: number;
    heightPx: number;
    widthIn: number;
    heightIn: number;
    dpi: number;
  };
};

const baseCanvas = {
  canvasWidth: 900,
  canvasHeight: 900,
  printAreaOnCanvas: {
    x: 280,
    y: 170,
    width: 340,
    height: 340,
  },
};

const frontTemplates: Record<SupportedPrintSize, PrintAreaTemplate> = {
  S: {
    ...baseCanvas,
    mockupUrl: "/mockupHoodieFront.png",
    printAreaReal: { widthIn: 11.5, heightIn: 11.5, widthPx: 3450, heightPx: 3450, dpi: 300 },
  },
  M: {
    ...baseCanvas,
    mockupUrl: "/mockupHoodieFront.png",
    printAreaReal: { widthIn: 11.5, heightIn: 11.5, widthPx: 3450, heightPx: 3450, dpi: 300 },
  },
  L: {
    ...baseCanvas,
    mockupUrl: "/mockupHoodieFront.png",
    printAreaReal: { widthIn: 13, heightIn: 13, widthPx: 3900, heightPx: 3900, dpi: 300 },
  },
  XL: {
    ...baseCanvas,
    mockupUrl: "/mockupHoodieFront.png",
    printAreaReal: { widthIn: 13, heightIn: 13, widthPx: 3900, heightPx: 3900, dpi: 300 },
  },
  "2XL": {
    ...baseCanvas,
    mockupUrl: "/mockupHoodieFront.png",
    printAreaReal: { widthIn: 14, heightIn: 14, widthPx: 4200, heightPx: 4200, dpi: 300 },
  },
  "3XL": {
    ...baseCanvas,
    mockupUrl: "/mockupHoodieFront.png",
    printAreaReal: { widthIn: 14, heightIn: 14, widthPx: 4200, heightPx: 4200, dpi: 300 },
  },
};

// The garment spec does not define an official back print template. These back print sizes follow
// the same provider sizing groups as the front and remain configurable defaults.
const backTemplates: Record<SupportedPrintSize, PrintAreaTemplate> = {
  S: {
    ...baseCanvas,
    mockupUrl: "/mockupHoodieBack.png",
    printAreaReal: { widthIn: 11.5, heightIn: 11.5, widthPx: 3450, heightPx: 3450, dpi: 300 },
  },
  M: {
    ...baseCanvas,
    mockupUrl: "/mockupHoodieBack.png",
    printAreaReal: { widthIn: 11.5, heightIn: 11.5, widthPx: 3450, heightPx: 3450, dpi: 300 },
  },
  L: {
    ...baseCanvas,
    mockupUrl: "/mockupHoodieBack.png",
    printAreaReal: { widthIn: 13, heightIn: 13, widthPx: 3900, heightPx: 3900, dpi: 300 },
  },
  XL: {
    ...baseCanvas,
    mockupUrl: "/mockupHoodieBack.png",
    printAreaReal: { widthIn: 13, heightIn: 13, widthPx: 3900, heightPx: 3900, dpi: 300 },
  },
  "2XL": {
    ...baseCanvas,
    mockupUrl: "/mockupHoodieBack.png",
    printAreaReal: { widthIn: 14, heightIn: 14, widthPx: 4200, heightPx: 4200, dpi: 300 },
  },
  "3XL": {
    ...baseCanvas,
    mockupUrl: "/mockupHoodieBack.png",
    printAreaReal: { widthIn: 14, heightIn: 14, widthPx: 4200, heightPx: 4200, dpi: 300 },
  },
};

export const hoodieTemplateBySizeAndSide: Record<SupportedPrintSize, Record<HoodieSide, PrintAreaTemplate>> = {
  S: {
    front: frontTemplates.S,
    back: backTemplates.S,
  },
  M: {
    front: frontTemplates.M,
    back: backTemplates.M,
  },
  L: {
    front: frontTemplates.L,
    back: backTemplates.L,
  },
  XL: {
    front: frontTemplates.XL,
    back: backTemplates.XL,
  },
  "2XL": {
    front: frontTemplates["2XL"],
    back: backTemplates["2XL"],
  },
  "3XL": {
    front: frontTemplates["3XL"],
    back: backTemplates["3XL"],
  },
};
