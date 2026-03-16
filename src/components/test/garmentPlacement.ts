import type { HoodieSide, HoodieSize } from "./template";

export type HoodieGarmentMeasurements = {
  backLengthIn: number;
  chestHalfIn: number;
  sweepHalfIn: number;
  acrossShoulderIn: number;
  acrossFront6_5DownIn: number;
  acrossBack6_5DownIn: number;
  neckWidthIn: number;
  frontNeckDropIn: number;
  backNeckDropIn: number;
  hoodOpeningIn: number;
  hoodDepth6DownIn: number;
  pocketLengthIn: number;
  pocketTopWidthIn: number;
  pocketOpeningWidthIn: number;
  pocketBottomWidthIn: number;
  pocketOpeningCurveIn: number;
  waistbandHeightIn: number;
};

export type PlacementInInches = {
  leftIn: number;
  topIn: number;
  widthIn: number;
  heightIn: number;
};

export type PrintAreaReal = {
  widthIn: number;
  heightIn: number;
  widthPx: number;
  heightPx: number;
  dpi: number;
};

export type PrintAreaGarmentAnchor = {
  centerXFromGarmentCenterIn: number;
  topFromHPSIn: number;
};

export type ManufacturerGarmentRelativeSpec = {
  side?: "front";
  size: HoodieSize;
  garment: {
    backLengthIn: number;
    chestHalfIn: number;
    acrossShoulderIn: number;
    acrossFront6_5DownIn: number;
    neckWidthIn: number;
    frontNeckDropIn: number;
    waistbandHeightIn: number;
  };
  printArea: {
    widthIn: number;
    heightIn: number;
    widthPx: number;
    heightPx: number;
    dpi: number;
    centerXFromGarmentCenterIn: number;
    topFromHPSIn: number;
  };
  artwork: {
    leftFromGarmentCenterIn: number;
    rightFromGarmentCenterIn: number;
    topFromHPSIn: number;
    bottomFromHPSIn: number;
    widthIn: number;
    heightIn: number;
    centerXFromGarmentCenterIn: number;
    centerYFromHPSIn: number;
    leftPctOfChestHalf: number;
    widthPctOfChestHalf: number;
    topPctOfBackLength: number;
    heightPctOfBackLength: number;
  };
  referenceLines: {
    neckWidthIn: number;
    frontNeckDropIn: number;
    acrossFront6_5DownIn: number;
  };
  pocket: {
    lengthIn: number;
    topWidthIn: number;
    openingWidthIn: number;
    bottomWidthIn: number;
    openingCurveIn: number;
    verticalPlacementKnown: false;
  };
};

export type BackManufacturerGarmentRelativeSpec = {
  size: HoodieSize;
  side: "back";
  garment: {
    backLengthIn: number;
    acrossShoulderIn: number;
    acrossBack6_5DownIn: number;
    backNeckDropIn: number;
  };
  printArea: {
    widthIn: number;
    heightIn: number;
    widthPx: number;
    heightPx: number;
    dpi: number;
    centerXFromGarmentCenterIn: number;
    topFromHPSIn: number;
    anchorIsAssumed: true;
  };
  artwork: {
    leftFromGarmentCenterIn: number;
    rightFromGarmentCenterIn: number;
    topFromHPSIn: number;
    bottomFromHPSIn: number;
    widthIn: number;
    heightIn: number;
    centerXFromGarmentCenterIn: number;
    centerYFromHPSIn: number;
    leftPctOfAcrossBack6_5Down: number;
    widthPctOfAcrossBack6_5Down: number;
    topPctOfBackLength: number;
    heightPctOfBackLength: number;
  };
  referenceLines: {
    acrossBack6_5DownIn: number;
    backNeckDropIn: number;
    acrossShoulderIn: number;
  };
};

export type AnyManufacturerGarmentRelativeSpec =
  | ManufacturerGarmentRelativeSpec
  | BackManufacturerGarmentRelativeSpec;

export type GetGarmentRelativePlacementSpecParams = {
  size: HoodieSize;
  placementInInches: PlacementInInches;
  printAreaReal: PrintAreaReal;
  printAreaGarmentAnchor: PrintAreaGarmentAnchor;
};

export type GetBackGarmentRelativePlacementSpecParams = GetGarmentRelativePlacementSpecParams;

export const hoodieMeasurementSpec: Record<HoodieSize, HoodieGarmentMeasurements> = {
  S: {
    backLengthIn: 28.875,
    chestHalfIn: 21,
    sweepHalfIn: 18,
    acrossShoulderIn: 19.5,
    acrossFront6_5DownIn: 17.375,
    acrossBack6_5DownIn: 17.625,
    neckWidthIn: 8.875,
    frontNeckDropIn: 3.875,
    backNeckDropIn: 1.25,
    hoodOpeningIn: 15.75,
    hoodDepth6DownIn: 10.75,
    pocketLengthIn: 9,
    pocketTopWidthIn: 9.5,
    pocketOpeningWidthIn: 15.5,
    pocketBottomWidthIn: 14.25,
    pocketOpeningCurveIn: 7,
    waistbandHeightIn: 2.5,
  },
  M: {
    backLengthIn: 29,
    chestHalfIn: 22,
    sweepHalfIn: 19,
    acrossShoulderIn: 20,
    acrossFront6_5DownIn: 18,
    acrossBack6_5DownIn: 18.25,
    neckWidthIn: 9,
    frontNeckDropIn: 4,
    backNeckDropIn: 1.25,
    hoodOpeningIn: 15.75,
    hoodDepth6DownIn: 11,
    pocketLengthIn: 9,
    pocketTopWidthIn: 9.5,
    pocketOpeningWidthIn: 15.5,
    pocketBottomWidthIn: 14.25,
    pocketOpeningCurveIn: 7,
    waistbandHeightIn: 2.5,
  },
  L: {
    backLengthIn: 29.375,
    chestHalfIn: 23.625,
    sweepHalfIn: 20.625,
    acrossShoulderIn: 20.75,
    acrossFront6_5DownIn: 18.75,
    acrossBack6_5DownIn: 19.125,
    neckWidthIn: 9.375,
    frontNeckDropIn: 4.125,
    backNeckDropIn: 1.375,
    hoodOpeningIn: 15.75,
    hoodDepth6DownIn: 11.375,
    pocketLengthIn: 9,
    pocketTopWidthIn: 9.5,
    pocketOpeningWidthIn: 15.5,
    pocketBottomWidthIn: 14.25,
    pocketOpeningCurveIn: 7,
    waistbandHeightIn: 2.5,
  },
  XL: {
    backLengthIn: 29.875,
    chestHalfIn: 25.25,
    sweepHalfIn: 22.25,
    acrossShoulderIn: 21.5,
    acrossFront6_5DownIn: 19.5,
    acrossBack6_5DownIn: 19.875,
    neckWidthIn: 9.75,
    frontNeckDropIn: 4.25,
    backNeckDropIn: 1.5,
    hoodOpeningIn: 15.75,
    hoodDepth6DownIn: 11.75,
    pocketLengthIn: 9,
    pocketTopWidthIn: 10.5,
    pocketOpeningWidthIn: 16.5,
    pocketBottomWidthIn: 15.25,
    pocketOpeningCurveIn: 7.5,
    waistbandHeightIn: 2.5,
  },
  "2XL": {
    backLengthIn: 30.75,
    chestHalfIn: 26.875,
    sweepHalfIn: 23.875,
    acrossShoulderIn: 22.25,
    acrossFront6_5DownIn: 20.25,
    acrossBack6_5DownIn: 20.75,
    neckWidthIn: 10.125,
    frontNeckDropIn: 4.375,
    backNeckDropIn: 1.625,
    hoodOpeningIn: 15.75,
    hoodDepth6DownIn: 12,
    pocketLengthIn: 9.5,
    pocketTopWidthIn: 10.5,
    pocketOpeningWidthIn: 16.5,
    pocketBottomWidthIn: 15.25,
    pocketOpeningCurveIn: 7.5,
    waistbandHeightIn: 2.5,
  },
  "3XL": {
    backLengthIn: 31.625,
    chestHalfIn: 29.25,
    sweepHalfIn: 26.25,
    acrossShoulderIn: 23.125,
    acrossFront6_5DownIn: 21.25,
    acrossBack6_5DownIn: 21.625,
    neckWidthIn: 10.5,
    frontNeckDropIn: 4.5,
    backNeckDropIn: 1.75,
    hoodOpeningIn: 15.75,
    hoodDepth6DownIn: 12.375,
    pocketLengthIn: 9.5,
    pocketTopWidthIn: 10.5,
    pocketOpeningWidthIn: 16.5,
    pocketBottomWidthIn: 15.25,
    pocketOpeningCurveIn: 7.5,
    waistbandHeightIn: 2.5,
  },
  "4XL": {
    backLengthIn: 32.375,
    chestHalfIn: 31.5,
    sweepHalfIn: 28.5,
    acrossShoulderIn: 24,
    acrossFront6_5DownIn: 22.25,
    acrossBack6_5DownIn: 22.5,
    neckWidthIn: 10.875,
    frontNeckDropIn: 4.625,
    backNeckDropIn: 1.875,
    hoodOpeningIn: 15.75,
    hoodDepth6DownIn: 12.75,
    pocketLengthIn: 9.5,
    pocketTopWidthIn: 10.5,
    pocketOpeningWidthIn: 16.5,
    pocketBottomWidthIn: 15.25,
    pocketOpeningCurveIn: 7.5,
    waistbandHeightIn: 2.5,
  },
};

// HPS means high point shoulder. In this helper it is the garment origin (0, 0):
// X is distance from garment centerline and Y is distance down from HPS.
export const defaultFrontPrintAreaAnchorBySize: Record<HoodieSize, PrintAreaGarmentAnchor> = {
  S: { centerXFromGarmentCenterIn: 0, topFromHPSIn: 3.5 },
  M: { centerXFromGarmentCenterIn: 0, topFromHPSIn: 3.5 },
  L: { centerXFromGarmentCenterIn: 0, topFromHPSIn: 3.625 },
  XL: { centerXFromGarmentCenterIn: 0, topFromHPSIn: 3.75 },
  "2XL": { centerXFromGarmentCenterIn: 0, topFromHPSIn: 3.875 },
  "3XL": { centerXFromGarmentCenterIn: 0, topFromHPSIn: 4 },
  "4XL": { centerXFromGarmentCenterIn: 0, topFromHPSIn: 4.125 },
};

// HPS is also the origin on the back side. These back anchors are temporary placement defaults,
// not exact values from the garment spec, because the source spec does not include a back print template.
export const defaultBackPrintAreaAnchorBySize: Record<HoodieSize, PrintAreaGarmentAnchor> = {
  S: { centerXFromGarmentCenterIn: 0, topFromHPSIn: 2.5 },
  M: { centerXFromGarmentCenterIn: 0, topFromHPSIn: 2.5 },
  L: { centerXFromGarmentCenterIn: 0, topFromHPSIn: 2.625 },
  XL: { centerXFromGarmentCenterIn: 0, topFromHPSIn: 2.75 },
  "2XL": { centerXFromGarmentCenterIn: 0, topFromHPSIn: 2.875 },
  "3XL": { centerXFromGarmentCenterIn: 0, topFromHPSIn: 3 },
  "4XL": { centerXFromGarmentCenterIn: 0, topFromHPSIn: 3.125 },
};

const toPercent = (value: number, total: number) => (total === 0 ? 0 : (value / total) * 100);

export const getGarmentRelativePlacementSpec = ({
  size,
  placementInInches,
  printAreaReal,
  printAreaGarmentAnchor,
}: GetGarmentRelativePlacementSpecParams): ManufacturerGarmentRelativeSpec => {
  const garment = hoodieMeasurementSpec[size];

  // Garment-relative measurements differ from preview coordinates because preview pixels are visual only.
  // The source of truth is the normalized placement converted into real inches, then anchored to HPS.
  const printAreaLeftFromGarmentCenterIn =
    printAreaGarmentAnchor.centerXFromGarmentCenterIn - printAreaReal.widthIn / 2;

  const artworkLeftFromGarmentCenterIn =
    printAreaLeftFromGarmentCenterIn + placementInInches.leftIn;
  const artworkRightFromGarmentCenterIn =
    artworkLeftFromGarmentCenterIn + placementInInches.widthIn;
  const artworkCenterXFromGarmentCenterIn =
    artworkLeftFromGarmentCenterIn + placementInInches.widthIn / 2;
  const artworkTopFromHPSIn = printAreaGarmentAnchor.topFromHPSIn + placementInInches.topIn;
  const artworkBottomFromHPSIn = artworkTopFromHPSIn + placementInInches.heightIn;
  const artworkCenterYFromHPSIn = artworkTopFromHPSIn + placementInInches.heightIn / 2;

  return {
    side: "front",
    size,
    garment: {
      backLengthIn: garment.backLengthIn,
      chestHalfIn: garment.chestHalfIn,
      acrossShoulderIn: garment.acrossShoulderIn,
      acrossFront6_5DownIn: garment.acrossFront6_5DownIn,
      neckWidthIn: garment.neckWidthIn,
      frontNeckDropIn: garment.frontNeckDropIn,
      waistbandHeightIn: garment.waistbandHeightIn,
    },
    printArea: {
      widthIn: printAreaReal.widthIn,
      heightIn: printAreaReal.heightIn,
      widthPx: printAreaReal.widthPx,
      heightPx: printAreaReal.heightPx,
      dpi: printAreaReal.dpi,
      centerXFromGarmentCenterIn: printAreaGarmentAnchor.centerXFromGarmentCenterIn,
      topFromHPSIn: printAreaGarmentAnchor.topFromHPSIn,
    },
    artwork: {
      leftFromGarmentCenterIn: artworkLeftFromGarmentCenterIn,
      rightFromGarmentCenterIn: artworkRightFromGarmentCenterIn,
      topFromHPSIn: artworkTopFromHPSIn,
      bottomFromHPSIn: artworkBottomFromHPSIn,
      widthIn: placementInInches.widthIn,
      heightIn: placementInInches.heightIn,
      centerXFromGarmentCenterIn: artworkCenterXFromGarmentCenterIn,
      centerYFromHPSIn: artworkCenterYFromHPSIn,
      leftPctOfChestHalf: toPercent(artworkLeftFromGarmentCenterIn, garment.chestHalfIn),
      widthPctOfChestHalf: toPercent(placementInInches.widthIn, garment.chestHalfIn),
      topPctOfBackLength: toPercent(artworkTopFromHPSIn, garment.backLengthIn),
      heightPctOfBackLength: toPercent(placementInInches.heightIn, garment.backLengthIn),
    },
    referenceLines: {
      neckWidthIn: garment.neckWidthIn,
      frontNeckDropIn: garment.frontNeckDropIn,
      acrossFront6_5DownIn: garment.acrossFront6_5DownIn,
    },
    pocket: {
      lengthIn: garment.pocketLengthIn,
      topWidthIn: garment.pocketTopWidthIn,
      openingWidthIn: garment.pocketOpeningWidthIn,
      bottomWidthIn: garment.pocketBottomWidthIn,
      openingCurveIn: garment.pocketOpeningCurveIn,
      verticalPlacementKnown: false,
    },
  };
};

export const getBackGarmentRelativePlacementSpec = ({
  size,
  placementInInches,
  printAreaReal,
  printAreaGarmentAnchor,
}: GetBackGarmentRelativePlacementSpecParams): BackManufacturerGarmentRelativeSpec => {
  const garment = hoodieMeasurementSpec[size];

  // Back-side garment-relative values use HPS as the origin too. Preview placement is only visual;
  // manufacturing values come from normalized placement -> inches -> garment anchor.
  const printAreaLeftFromGarmentCenterIn =
    printAreaGarmentAnchor.centerXFromGarmentCenterIn - printAreaReal.widthIn / 2;

  const artworkLeftFromGarmentCenterIn =
    printAreaLeftFromGarmentCenterIn + placementInInches.leftIn;
  const artworkRightFromGarmentCenterIn =
    artworkLeftFromGarmentCenterIn + placementInInches.widthIn;
  const artworkCenterXFromGarmentCenterIn =
    artworkLeftFromGarmentCenterIn + placementInInches.widthIn / 2;
  const artworkTopFromHPSIn = printAreaGarmentAnchor.topFromHPSIn + placementInInches.topIn;
  const artworkBottomFromHPSIn = artworkTopFromHPSIn + placementInInches.heightIn;
  const artworkCenterYFromHPSIn = artworkTopFromHPSIn + placementInInches.heightIn / 2;

  return {
    size,
    side: "back",
    garment: {
      backLengthIn: garment.backLengthIn,
      acrossShoulderIn: garment.acrossShoulderIn,
      acrossBack6_5DownIn: garment.acrossBack6_5DownIn,
      backNeckDropIn: garment.backNeckDropIn,
    },
    printArea: {
      widthIn: printAreaReal.widthIn,
      heightIn: printAreaReal.heightIn,
      widthPx: printAreaReal.widthPx,
      heightPx: printAreaReal.heightPx,
      dpi: printAreaReal.dpi,
      centerXFromGarmentCenterIn: printAreaGarmentAnchor.centerXFromGarmentCenterIn,
      topFromHPSIn: printAreaGarmentAnchor.topFromHPSIn,
      anchorIsAssumed: true,
    },
    artwork: {
      leftFromGarmentCenterIn: artworkLeftFromGarmentCenterIn,
      rightFromGarmentCenterIn: artworkRightFromGarmentCenterIn,
      topFromHPSIn: artworkTopFromHPSIn,
      bottomFromHPSIn: artworkBottomFromHPSIn,
      widthIn: placementInInches.widthIn,
      heightIn: placementInInches.heightIn,
      centerXFromGarmentCenterIn: artworkCenterXFromGarmentCenterIn,
      centerYFromHPSIn: artworkCenterYFromHPSIn,
      leftPctOfAcrossBack6_5Down: toPercent(
        artworkLeftFromGarmentCenterIn,
        garment.acrossBack6_5DownIn
      ),
      widthPctOfAcrossBack6_5Down: toPercent(
        placementInInches.widthIn,
        garment.acrossBack6_5DownIn
      ),
      topPctOfBackLength: toPercent(artworkTopFromHPSIn, garment.backLengthIn),
      heightPctOfBackLength: toPercent(placementInInches.heightIn, garment.backLengthIn),
    },
    referenceLines: {
      acrossBack6_5DownIn: garment.acrossBack6_5DownIn,
      backNeckDropIn: garment.backNeckDropIn,
      acrossShoulderIn: garment.acrossShoulderIn,
    },
  };
};

export const getGarmentRelativePlacementSpecBySide = ({
  side,
  size,
  placementInInches,
  printAreaReal,
  printAreaGarmentAnchor,
}: GetGarmentRelativePlacementSpecParams & { side: HoodieSide }): AnyManufacturerGarmentRelativeSpec =>
  side === "back"
    ? getBackGarmentRelativePlacementSpec({
        size,
        placementInInches,
        printAreaReal,
        printAreaGarmentAnchor,
      })
    : getGarmentRelativePlacementSpec({
        size,
        placementInInches,
        printAreaReal,
        printAreaGarmentAnchor,
      });
