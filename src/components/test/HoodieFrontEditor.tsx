import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { ArrowUpLeft, ArrowUpRight, Download, Upload } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hoodieTemplateBySizeAndSide, type HoodieSide, type SupportedPrintSize } from "./template";
import {
  canvasSpaceToNormalizedPlacement,
  clampPlacementToBounds,
  getPlacementIntersectionWithPrintArea,
  normalizedPlacementToExportPixels,
  normalizedPlacementToInches,
  type Placement,
} from "./placement";
import {
  defaultBackPrintAreaAnchorBySize,
  defaultFrontPrintAreaAnchorBySize,
  getGarmentRelativePlacementSpecBySide,
  hoodieMeasurementSpec,
  measuredGarmentCalibrationBySize,
  type AnyManufacturerGarmentRelativeSpec,
} from "./garmentPlacement";
import { supabase } from "@/integrations/supabase/client";

type ContentBounds = {
  leftPx: number;
  topPx: number;
  rightPx: number;
  bottomPx: number;
  widthPx: number;
  heightPx: number;
};

type UploadedArtwork = {
  assetId: string;
  name: string;
  src: string;
  width: number;
  height: number;
  contentBounds?: ContentBounds;
  originalWidth: number;
  originalHeight: number;
  trimApplied?: boolean;
};

type ArtworkBySide = Partial<Record<HoodieSide, UploadedArtwork>>;
type PlacementBySide = Partial<Record<HoodieSide, Placement>>;
type PrintAreaOffset = { x: number; y: number };
type SavedSideDesign = {
  side: HoodieSide;
  size: SupportedPrintSize;
  placement: Placement;
  printAreaOffset: PrintAreaOffset;
};
type SavedDesignBySide = Partial<Record<HoodieSide, SavedSideDesign>>;
type PersistedSideState = {
  artwork: UploadedArtwork | null;
  placement: Placement | null;
  printAreaOffset: PrintAreaOffset;
  savedDesign: SavedSideDesign | null;
};
type PersistedEditorState = {
  version: 1;
  size: SupportedPrintSize;
  sides: Partial<Record<HoodieSide, PersistedSideState>>;
};

type DragState =
  | {
      mode: "move";
      startX: number;
      startY: number;
      placement: Placement;
      areaRect: DOMRect;
    }
  | {
      mode: "resize";
      direction:
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right";
      startX: number;
      startY: number;
      placement: Placement;
      areaRect: DOMRect;
    }
  | null;

const MIN_PREVIEW_SIZE_PX = 28;
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 12000;
const ALPHA_THRESHOLD = 8;
const MIN_PADDING_RATIO_TO_TRIM = 0.04;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const getNonTransparentBounds = (
  imageData: ImageData,
  alphaThreshold = ALPHA_THRESHOLD
): ContentBounds | null => {
  const { width, height, data } = imageData;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];

      if (alpha > alphaThreshold) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1 || maxY === -1) {
    return null;
  }

  return {
    leftPx: minX,
    topPx: minY,
    rightPx: maxX,
    bottomPx: maxY,
    widthPx: maxX - minX + 1,
    heightPx: maxY - minY + 1,
  };
};

const shouldTrimBounds = (bounds: ContentBounds, width: number, height: number) => {
  const paddingX = width - bounds.widthPx;
  const paddingY = height - bounds.heightPx;
  return (
    paddingX / width >= MIN_PADDING_RATIO_TO_TRIM ||
    paddingY / height >= MIN_PADDING_RATIO_TO_TRIM
  );
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to create trimmed artwork image."));
      }
    }, type);
  });

const processArtworkSource = async ({
  src,
  name,
  assetId,
}: Pick<UploadedArtwork, "src" | "name" | "assetId">): Promise<UploadedArtwork> => {
  const image = await loadImage(src);

  if (image.naturalWidth > MAX_IMAGE_DIMENSION || image.naturalHeight > MAX_IMAGE_DIMENSION) {
    throw new Error("Uploaded image is too large in dimensions. Keep it under 12000px on each side.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Canvas context unavailable.");
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  const bounds = getNonTransparentBounds(
    context.getImageData(0, 0, canvas.width, canvas.height)
  );
  const shouldTrim = bounds && shouldTrimBounds(bounds, image.naturalWidth, image.naturalHeight);

  if (!bounds || !shouldTrim) {
    return {
      assetId,
      name,
      src,
      width: image.naturalWidth,
      height: image.naturalHeight,
      contentBounds: bounds ?? {
        leftPx: 0,
        topPx: 0,
        rightPx: image.naturalWidth - 1,
        bottomPx: image.naturalHeight - 1,
        widthPx: image.naturalWidth,
        heightPx: image.naturalHeight,
      },
      originalWidth: image.naturalWidth,
      originalHeight: image.naturalHeight,
      trimApplied: false,
    };
  }

  const trimmedCanvas = document.createElement("canvas");
  trimmedCanvas.width = bounds.widthPx;
  trimmedCanvas.height = bounds.heightPx;
  const trimmedContext = trimmedCanvas.getContext("2d");

  if (!trimmedContext) {
    throw new Error("Trim canvas context unavailable.");
  }

  trimmedContext.drawImage(
    canvas,
    bounds.leftPx,
    bounds.topPx,
    bounds.widthPx,
    bounds.heightPx,
    0,
    0,
    bounds.widthPx,
    bounds.heightPx
  );

  const blob = await canvasToBlob(trimmedCanvas, "image/png");
  const trimmedUrl = URL.createObjectURL(blob);

  if (src.startsWith("blob:")) {
    URL.revokeObjectURL(src);
  }

  return {
    assetId,
    name,
    src: trimmedUrl,
    width: bounds.widthPx,
    height: bounds.heightPx,
    contentBounds: {
      leftPx: 0,
      topPx: 0,
      rightPx: bounds.widthPx - 1,
      bottomPx: bounds.heightPx - 1,
      widthPx: bounds.widthPx,
      heightPx: bounds.heightPx,
    },
    originalWidth: image.naturalWidth,
    originalHeight: image.naturalHeight,
    trimApplied: true,
  };
};

const sanitizeFileName = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, "-");

const getFileExtension = (filename: string, fallback = "png") => {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension && extension.length <= 5 ? extension : fallback;
};

const drawImageCover = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
) => {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = targetWidth / targetHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );
};

const round = (value: number) => Math.round(value * 100) / 100;
const toCm = (valueIn: number) => valueIn * 2.54;
const toInches = (valueCm: number) => valueCm / 2.54;
const cm = (valueIn: number) => round(toCm(valueIn));
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const RESIZE_HANDLES = [
  {
    direction: "top-left",
    className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
    icon: ArrowUpLeft,
  },
  {
    direction: "top-right",
    className: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
    icon: ArrowUpRight,
  },
  {
    direction: "bottom-left",
    className: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
    icon: ArrowUpRight,
  },
  {
    direction: "bottom-right",
    className: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
    icon: ArrowUpLeft,
  },
] as const;

const createInitialPlacement = (
  asset: UploadedArtwork,
  size: SupportedPrintSize,
  side: HoodieSide
): Placement => {
  const template = hoodieTemplateBySizeAndSide[size][side];
  const printArea = template.printAreaOnCanvas;
  const maxWidth = printArea.width * 0.72;
  const maxHeight = printArea.height * 0.72;
  const scale = Math.min(maxWidth / asset.width, maxHeight / asset.height, 1);
  const width = asset.width * scale;
  const height = asset.height * scale;
  const rectOnCanvas = {
    x: printArea.x + (printArea.width - width) / 2,
    y: printArea.y + (printArea.height - height) / 2,
    width,
    height,
  };

  return canvasSpaceToNormalizedPlacement(rectOnCanvas, printArea, asset.assetId, 0);
};

const HoodieFrontEditor = () => {
  const [searchParams] = useSearchParams();
  const [size, setSize] = useState<SupportedPrintSize>("M");
  const [side, setSide] = useState<HoodieSide>("front");
  const [designId, setDesignId] = useState(searchParams.get("designId") ?? "");
  const [artworksBySide, setArtworksBySide] = useState<ArtworkBySide>({});
  const [placementsBySide, setPlacementsBySide] = useState<PlacementBySide>({});
  const [savedDesignsBySide, setSavedDesignsBySide] = useState<SavedDesignBySide>({});
  const [isArtworkSelected, setIsArtworkSelected] = useState(false);
  const [status, setStatus] = useState("Upload one artwork image to begin.");
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const printAreaRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState>(null);
  const artworksBySideRef = useRef<ArtworkBySide>({});

  const template = hoodieTemplateBySizeAndSide[size][side];
  const artwork = artworksBySide[side] ?? null;
  const placement = placementsBySide[side] ?? null;
  const savedDesign = savedDesignsBySide[side] ?? null;
  const savedPlacement = savedDesign?.placement ?? null;
  const printAreaOffset = { x: 0, y: 0 };
  const garmentMeasurements = hoodieMeasurementSpec[size];
  const garmentAnchorBase =
    side === "back"
      ? defaultBackPrintAreaAnchorBySize[size]
      : defaultFrontPrintAreaAnchorBySize[size];
  const movedGarmentAnchor = garmentAnchorBase;

  const inches = useMemo(
    () => (placement ? normalizedPlacementToInches(placement, template) : null),
    [placement, template]
  );
  const exportPixels = useMemo(
    () => (placement ? normalizedPlacementToExportPixels(placement, template) : null),
    [placement, template]
  );
  const clippedPlacement = useMemo(
    () => (placement ? getPlacementIntersectionWithPrintArea(placement) : null),
    [placement]
  );
  const visiblePlacement = clippedPlacement;
  const clippedInches = useMemo(
    () =>
      visiblePlacement
        ? {
            leftIn: visiblePlacement.x * template.printAreaReal.widthIn,
            topIn: visiblePlacement.y * template.printAreaReal.heightIn,
            widthIn: visiblePlacement.width * template.printAreaReal.widthIn,
            heightIn: visiblePlacement.height * template.printAreaReal.heightIn,
          }
        : null,
    [visiblePlacement, template.printAreaReal.heightIn, template.printAreaReal.widthIn]
  );
  const clippedExportPixels = useMemo(
    () =>
      clippedPlacement
        ? {
            x: Math.round(clippedPlacement.x * template.printAreaReal.widthPx),
            y: Math.round(clippedPlacement.y * template.printAreaReal.heightPx),
            width: Math.round(clippedPlacement.width * template.printAreaReal.widthPx),
            height: Math.round(clippedPlacement.height * template.printAreaReal.heightPx),
          }
        : null,
    [clippedPlacement, template.printAreaReal.heightPx, template.printAreaReal.widthPx]
  );
  const garmentRelativeSpec = useMemo<AnyManufacturerGarmentRelativeSpec | null>(
    () =>
      clippedInches
        ? getGarmentRelativePlacementSpecBySide({
            side,
            size,
            placementInInches: clippedInches,
            printAreaReal: template.printAreaReal,
            printAreaGarmentAnchor: movedGarmentAnchor,
          })
        : null,
    [clippedInches, movedGarmentAnchor, side, size, template.printAreaReal]
  );
  const bottomIn = inches
    ? template.printAreaReal.heightIn - inches.topIn - inches.heightIn
    : null;
  const measuredCalibration = measuredGarmentCalibrationBySize[size] ?? null;
  const measuredPlacement = useMemo(() => {
    if (!garmentRelativeSpec || !measuredCalibration) {
      return null;
    }

    const halfWidthIn = measuredCalibration.flatWidthIn / 2;
    const bottomFromMeasuredBottomIn =
      measuredCalibration.bodyLengthWithoutHoodIn - garmentRelativeSpec.artwork.bottomFromHPSIn;
    const leftFromLeftEdgeIn =
      halfWidthIn + garmentRelativeSpec.artwork.leftFromGarmentCenterIn;
    const rightFromRightEdgeIn =
      halfWidthIn - garmentRelativeSpec.artwork.rightFromGarmentCenterIn;

    return {
      bodyLengthCm: measuredCalibration.bodyLengthWithoutHoodIn * 2.54,
      flatWidthCm: measuredCalibration.flatWidthIn * 2.54,
      topFromHpsCm: garmentRelativeSpec.artwork.topFromHPSIn * 2.54,
      bottomFromHpsCm: garmentRelativeSpec.artwork.bottomFromHPSIn * 2.54,
      bottomFromMeasuredBottomCm: bottomFromMeasuredBottomIn * 2.54,
      leftFromLeftEdgeCm: leftFromLeftEdgeIn * 2.54,
      rightFromRightEdgeCm: rightFromRightEdgeIn * 2.54,
      widthCm: garmentRelativeSpec.artwork.widthIn * 2.54,
      heightCm: garmentRelativeSpec.artwork.heightIn * 2.54,
    };
  }, [garmentRelativeSpec, measuredCalibration]);
  const garmentRelativeSpecCm = useMemo(() => {
    if (!garmentRelativeSpec) {
      return null;
    }

    if (side === "front") {
      return {
        size: garmentRelativeSpec.size,
        side: garmentRelativeSpec.side,
        garment: {
          backLengthCm: cm(garmentRelativeSpec.garment.backLengthIn),
          chestHalfCm: cm(garmentRelativeSpec.garment.chestHalfIn),
          acrossShoulderCm: cm(garmentRelativeSpec.garment.acrossShoulderIn),
          acrossFront6_5DownCm: cm(garmentRelativeSpec.garment.acrossFront6_5DownIn),
          neckWidthCm: cm(garmentRelativeSpec.garment.neckWidthIn),
          frontNeckDropCm: cm(garmentRelativeSpec.garment.frontNeckDropIn),
          waistbandHeightCm: cm(garmentRelativeSpec.garment.waistbandHeightIn),
        },
        printArea: {
          widthCm: cm(garmentRelativeSpec.printArea.widthIn),
          heightCm: cm(garmentRelativeSpec.printArea.heightIn),
          widthPx: garmentRelativeSpec.printArea.widthPx,
          heightPx: garmentRelativeSpec.printArea.heightPx,
          dpi: garmentRelativeSpec.printArea.dpi,
          centerXFromGarmentCenterCm: cm(garmentRelativeSpec.printArea.centerXFromGarmentCenterIn),
          topFromHpsCm: cm(garmentRelativeSpec.printArea.topFromHPSIn),
          anchorIsAssumed: garmentRelativeSpec.printArea.anchorIsAssumed,
        },
        artwork: {
          leftFromGarmentCenterCm: cm(garmentRelativeSpec.artwork.leftFromGarmentCenterIn),
          rightFromGarmentCenterCm: cm(garmentRelativeSpec.artwork.rightFromGarmentCenterIn),
          topFromHpsCm: cm(garmentRelativeSpec.artwork.topFromHPSIn),
          bottomFromHpsCm: cm(garmentRelativeSpec.artwork.bottomFromHPSIn),
          widthCm: cm(garmentRelativeSpec.artwork.widthIn),
          heightCm: cm(garmentRelativeSpec.artwork.heightIn),
          centerXFromGarmentCenterCm: cm(garmentRelativeSpec.artwork.centerXFromGarmentCenterIn),
          centerYFromHpsCm: cm(garmentRelativeSpec.artwork.centerYFromHPSIn),
          leftPctOfChestHalf: round(garmentRelativeSpec.artwork.leftPctOfChestHalf),
          widthPctOfChestHalf: round(garmentRelativeSpec.artwork.widthPctOfChestHalf),
          topPctOfBackLength: round(garmentRelativeSpec.artwork.topPctOfBackLength),
          heightPctOfBackLength: round(garmentRelativeSpec.artwork.heightPctOfBackLength),
        },
        referenceLines: {
          neckWidthCm: cm(garmentRelativeSpec.referenceLines.neckWidthIn),
          frontNeckDropCm: cm(garmentRelativeSpec.referenceLines.frontNeckDropIn),
          acrossFront6_5DownCm: cm(garmentRelativeSpec.referenceLines.acrossFront6_5DownIn),
        },
        pocket: {
          lengthCm: cm(garmentRelativeSpec.pocket.lengthIn),
          topWidthCm: cm(garmentRelativeSpec.pocket.topWidthIn),
          openingWidthCm: cm(garmentRelativeSpec.pocket.openingWidthIn),
          bottomWidthCm: cm(garmentRelativeSpec.pocket.bottomWidthIn),
          openingCurveCm: cm(garmentRelativeSpec.pocket.openingCurveIn),
          verticalPlacementKnown: garmentRelativeSpec.pocket.verticalPlacementKnown,
        },
      };
    }

    return {
      size: garmentRelativeSpec.size,
      side: garmentRelativeSpec.side,
      garment: {
        backLengthCm: cm(garmentRelativeSpec.garment.backLengthIn),
        acrossShoulderCm: cm(garmentRelativeSpec.garment.acrossShoulderIn),
        acrossBack6_5DownCm: cm(garmentRelativeSpec.garment.acrossBack6_5DownIn),
        backNeckDropCm: cm(garmentRelativeSpec.garment.backNeckDropIn),
      },
      printArea: {
        widthCm: cm(garmentRelativeSpec.printArea.widthIn),
        heightCm: cm(garmentRelativeSpec.printArea.heightIn),
        widthPx: garmentRelativeSpec.printArea.widthPx,
        heightPx: garmentRelativeSpec.printArea.heightPx,
        dpi: garmentRelativeSpec.printArea.dpi,
        centerXFromGarmentCenterCm: cm(garmentRelativeSpec.printArea.centerXFromGarmentCenterIn),
        topFromHpsCm: cm(garmentRelativeSpec.printArea.topFromHPSIn),
        anchorIsAssumed: garmentRelativeSpec.printArea.anchorIsAssumed,
      },
      artwork: {
        leftFromGarmentCenterCm: cm(garmentRelativeSpec.artwork.leftFromGarmentCenterIn),
        rightFromGarmentCenterCm: cm(garmentRelativeSpec.artwork.rightFromGarmentCenterIn),
        topFromHpsCm: cm(garmentRelativeSpec.artwork.topFromHPSIn),
        bottomFromHpsCm: cm(garmentRelativeSpec.artwork.bottomFromHPSIn),
        widthCm: cm(garmentRelativeSpec.artwork.widthIn),
        heightCm: cm(garmentRelativeSpec.artwork.heightIn),
        centerXFromGarmentCenterCm: cm(garmentRelativeSpec.artwork.centerXFromGarmentCenterIn),
        centerYFromHpsCm: cm(garmentRelativeSpec.artwork.centerYFromHPSIn),
        leftPctOfAcrossBack6_5Down: round(garmentRelativeSpec.artwork.leftPctOfAcrossBack6_5Down),
        widthPctOfAcrossBack6_5Down: round(garmentRelativeSpec.artwork.widthPctOfAcrossBack6_5Down),
        topPctOfBackLength: round(garmentRelativeSpec.artwork.topPctOfBackLength),
        heightPctOfBackLength: round(garmentRelativeSpec.artwork.heightPctOfBackLength),
      },
      referenceLines: {
        acrossBack6_5DownCm: cm(garmentRelativeSpec.referenceLines.acrossBack6_5DownIn),
        backNeckDropCm: cm(garmentRelativeSpec.referenceLines.backNeckDropIn),
        acrossShoulderCm: cm(garmentRelativeSpec.referenceLines.acrossShoulderIn),
      },
    };
  }, [garmentRelativeSpec, side]);
  const artworkCenterX = placement ? placement.x + placement.width / 2 : null;
  const centerOffsetCm = inches
    ? Math.abs(toCm(inches.leftIn + inches.widthIn / 2 - template.printAreaReal.widthIn / 2))
    : null;
  const isHorizontallyCentered = centerOffsetCm !== null && centerOffsetCm <= 0.25;

  useEffect(() => {
    const nextDesignId = searchParams.get("designId") ?? "";
    setDesignId(nextDesignId);
  }, [searchParams]);

  useEffect(() => {
    artworksBySideRef.current = artworksBySide;
  }, [artworksBySide]);

  useEffect(() => {
    if (!artwork) {
      setIsArtworkSelected(false);
      setStatus(`Upload artwork for the ${side} side to begin.`);
      return;
    }

    setPlacementsBySide((current) => {
      if (current[side]) {
        return current;
      }

      return {
        ...current,
        [side]: createInitialPlacement(artwork, size, side),
      };
    });
  }, [artwork, side, size]);

  useEffect(() => {
    if (!artwork) {
      setIsArtworkSelected(false);
    }
  }, [artwork]);

  const ensurePersistedArtwork = async (
    targetSide: HoodieSide,
    targetDesignId: string,
    targetArtwork: UploadedArtwork | null
  ): Promise<UploadedArtwork | null> => {
    if (!targetArtwork) {
      return null;
    }

    if (!targetArtwork.src.startsWith("blob:")) {
      return targetArtwork;
    }

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) {
      throw new Error("You must be signed in to save designs.");
    }

    const response = await fetch(targetArtwork.src);
    const blob = await response.blob();
    const extension = getFileExtension(targetArtwork.name);
    const filePath = `${user.id}/${targetDesignId}/hoodie-editor/${targetSide}-${Date.now()}-${sanitizeFileName(targetArtwork.name)}`;

    const { error: uploadError } = await supabase.storage
      .from("design-files")
      .upload(`${filePath}.${extension}`, blob, {
        contentType: blob.type || `image/${extension}`,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from("design-files")
      .getPublicUrl(`${filePath}.${extension}`);

    return {
      ...targetArtwork,
      src: publicUrlData.publicUrl,
    };
  };

  const buildPersistedEditorState = (nextArtworksBySide: ArtworkBySide): PersistedEditorState => ({
    version: 1,
    size,
    sides: {
      front: {
        artwork: nextArtworksBySide.front ?? null,
        placement: placementsBySide.front ?? null,
        printAreaOffset: { x: 0, y: 0 },
        savedDesign: savedDesignsBySide.front ?? null,
      },
      back: {
        artwork: nextArtworksBySide.back ?? null,
        placement: placementsBySide.back ?? null,
        printAreaOffset: { x: 0, y: 0 },
        savedDesign: savedDesignsBySide.back ?? null,
      },
    },
  });

  const handleSaveToBackend = async () => {
    if (!designId) {
      setError("Provide a design ID before saving to backend.");
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const nextArtworksBySide: ArtworkBySide = {
        front: await ensurePersistedArtwork("front", designId, artworksBySide.front ?? null),
        back: await ensurePersistedArtwork("back", designId, artworksBySide.back ?? null),
      };

      setArtworksBySide(nextArtworksBySide);

      const hoodieEditorState = buildPersistedEditorState(nextArtworksBySide);

      const { error: upsertError } = await supabase.from("design_specs").upsert(
        {
          design_id: designId,
          hoodie_editor_state: hoodieEditorState,
        },
        {
          onConflict: "design_id",
        }
      );

      if (upsertError) {
        throw upsertError;
      }

      setStatus(`Saved front/back hoodie editor state to backend for design ${designId}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save editor state.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadFromBackend = async () => {
    if (!designId) {
      setError("Provide a design ID before loading from backend.");
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const { data, error: loadError } = await supabase
        .from("design_specs")
        .select("hoodie_editor_state")
        .eq("design_id", designId)
        .maybeSingle();

      if (loadError) {
        throw loadError;
      }

      const persistedState = data?.hoodie_editor_state as PersistedEditorState | null;
      if (!persistedState?.sides) {
        setStatus(`No saved hoodie editor state found for design ${designId}.`);
        return;
      }

      const loadedArtworksBySide: ArtworkBySide = {};

      for (const targetSide of ["front", "back"] as const) {
        const sideState = persistedState.sides[targetSide];
        if (sideState?.artwork?.src) {
          loadedArtworksBySide[targetSide] = await processArtworkSource({
            assetId: sideState.artwork.assetId,
            name: sideState.artwork.name,
            src: sideState.artwork.src,
          });
        }
      }

      setSize(persistedState.size ?? "M");
      setArtworksBySide(loadedArtworksBySide);
      setPlacementsBySide({
        front: persistedState.sides.front?.placement ?? undefined,
        back: persistedState.sides.back?.placement ?? undefined,
      });
      setSavedDesignsBySide({
        front: persistedState.sides.front?.savedDesign ?? undefined,
        back: persistedState.sides.back?.savedDesign ?? undefined,
      });
      setStatus(`Loaded hoodie editor state from backend for design ${designId}.`);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load editor state.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!printAreaRef.current) {
        return;
      }

      if (!printAreaRef.current.contains(event.target as Node)) {
        setIsArtworkSelected(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(artworksBySideRef.current).forEach((item) => {
        if (item?.src.startsWith("blob:")) {
          URL.revokeObjectURL(item.src);
        }
      });
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || !placement || !artwork) {
        return;
      }

      setError(null);

      if (dragState.mode === "move") {
        const deltaX = (event.clientX - dragState.startX) / dragState.areaRect.width;
        const deltaY = (event.clientY - dragState.startY) / dragState.areaRect.height;
        setPlacementsBySide((current) => ({
          ...current,
          [side]: {
            ...dragState.placement,
            x: dragState.placement.x + deltaX,
            y: dragState.placement.y + deltaY,
          },
        }));
        return;
      }

      const deltaX = (event.clientX - dragState.startX) / dragState.areaRect.width;
      const deltaY = (event.clientY - dragState.startY) / dragState.areaRect.height;
      const horizontalDelta = dragState.direction.includes("left") ? -deltaX : deltaX;
      const verticalDelta = dragState.direction.includes("top") ? -deltaY : deltaY;
      const scaleDelta = Math.max(horizontalDelta, verticalDelta);
      const basePlacement = dragState.placement;
      const aspectRatio = basePlacement.width / basePlacement.height;

      const targetBoxScale = Math.max(0.2, 1 + scaleDelta);
      const minWidthNorm = MIN_PREVIEW_SIZE_PX / dragState.areaRect.width;
      const minHeightNorm = MIN_PREVIEW_SIZE_PX / dragState.areaRect.height;

      const minWidth = Math.max(minWidthNorm, minHeightNorm * aspectRatio);
      const targetWidth = basePlacement.width * targetBoxScale;
      const clampedWidth = Math.max(targetWidth, minWidth);
      const clampedHeight = clampedWidth / aspectRatio;
      const anchorRight = basePlacement.x + basePlacement.width;
      const anchorBottom = basePlacement.y + basePlacement.height;

      let nextX = basePlacement.x;
      let nextY = basePlacement.y;

      if (dragState.direction.includes("left")) {
        nextX = anchorRight - clampedWidth;
      }

      if (dragState.direction.includes("top")) {
        nextY = anchorBottom - clampedHeight;
      }

      setPlacementsBySide((current) => ({
        ...current,
        [side]: clampPlacementToBounds(
          {
            ...basePlacement,
            x: nextX,
            y: nextY,
            width: clampedWidth,
            height: clampedHeight,
          },
          minWidthNorm,
          minHeightNorm
        ),
      }));
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [artwork, placement, side]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Uploaded image is too large. Use a file smaller than 15MB.");
      event.target.value = "";
      return;
    }

    const fileUrl = URL.createObjectURL(file);

    try {
      const nextArtwork = await processArtworkSource({
        assetId: crypto.randomUUID(),
        name: file.name,
        src: fileUrl,
      });

      const previousArtwork = artworksBySide[side];
      if (previousArtwork?.src.startsWith("blob:")) {
        URL.revokeObjectURL(previousArtwork.src);
      }

      setArtworksBySide((current) => ({
        ...current,
        [side]: nextArtwork,
      }));
      setPlacementsBySide((current) => ({
        ...current,
        [side]: createInitialPlacement(nextArtwork, size, side),
      }));
      setSavedDesignsBySide((current) => {
        const next = { ...current };
        delete next[side];
        return next;
      });
      setIsArtworkSelected(true);
      setStatus(
        nextArtwork.trimApplied
          ? `Artwork loaded for the ${side} side. Transparent padding was trimmed for measurement accuracy.`
          : `Artwork loaded for the ${side} side. Drag and resize it directly inside the print area.`
      );
    } catch (uploadError) {
      URL.revokeObjectURL(fileUrl);
      setError(uploadError instanceof Error ? uploadError.message : "Unable to read the uploaded image.");
    }
  };

  const handleSavePlacement = () => {
    if (!placement) {
      setError("Upload artwork before saving placement.");
      return;
    }

    setSavedDesignsBySide((current) => ({
      ...current,
      [side]: {
        side,
        size,
        placement,
        printAreaOffset,
      },
    }));
    setIsArtworkSelected(true);
    setStatus(`Normalized placement saved for the ${side} side.`);
  };

  const handleDownloadSavedDesign = () => {
    if (!savedDesign) {
      setError(`Save the ${side} design before downloading it.`);
      return;
    }

    const visibleSavedPlacement = getPlacementIntersectionWithPrintArea(savedDesign.placement);
    if (!visibleSavedPlacement) {
      setError(`The saved ${side} design is completely outside the visible print area.`);
      return;
    }

    const visibleSavedDesign = {
      ...savedDesign,
      placement: visibleSavedPlacement,
    };

    const blob = new Blob([JSON.stringify(visibleSavedDesign, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, `hoodie-${savedDesign.side}-${savedDesign.size}-design.json`);
    setStatus(`Downloaded visible ${side} placement inside the print area.`);
  };

  const handleExport = async () => {
    if (!placement || !artwork) {
      setError("Upload artwork before exporting.");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = template.printAreaReal.widthPx;
      exportCanvas.height = template.printAreaReal.heightPx;
      const context = exportCanvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas context unavailable.");
      }

      const image = await loadImage(artwork.src);
      const pixelPlacement = normalizedPlacementToExportPixels(placement, template);

      context.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
      // Export clips to the full print area. The saved transform can extend beyond it, but only the
      // intersection inside the real print-area canvas is printable.
      context.save();
      context.beginPath();
      context.rect(0, 0, exportCanvas.width, exportCanvas.height);
      context.clip();
      context.drawImage(
        image,
        pixelPlacement.x,
        pixelPlacement.y,
        pixelPlacement.width,
        pixelPlacement.height
      );
      context.restore();

      const blob = await new Promise<Blob>((resolve, reject) => {
        exportCanvas.toBlob((value) => {
          if (value) {
            resolve(value);
          } else {
            reject(new Error("Failed to export PNG."));
          }
        }, "image/png");
      });

      downloadBlob(blob, `hoodie-${side}-${size}.png`);
      setStatus(`Exported ${side} print file at ${template.printAreaReal.widthPx}x${template.printAreaReal.heightPx}.`);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "PNG export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadMockupPng = async () => {
    if (!artwork || !placement) {
      setError("Upload artwork before downloading the full mockup PNG.");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const [mockupImage, artworkImage] = await Promise.all([
        loadImage(template.mockupUrl),
        loadImage(artwork.src),
      ]);

      const canvas = document.createElement("canvas");
      // Match the square preview composition instead of exporting the uncropped wide source image.
      canvas.width = template.canvasWidth;
      canvas.height = template.canvasHeight;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas context unavailable.");
      }

      const printAreaLeft =
        template.printAreaOnCanvas.x + printAreaOffset.x * template.canvasWidth;
      const printAreaTop =
        template.printAreaOnCanvas.y + printAreaOffset.y * template.canvasHeight;
      const printAreaWidth = template.printAreaOnCanvas.width;
      const printAreaHeight = template.printAreaOnCanvas.height;

      context.clearRect(0, 0, canvas.width, canvas.height);
      drawImageCover(context, mockupImage, canvas.width, canvas.height);
      context.save();
      context.beginPath();
      context.rect(printAreaLeft, printAreaTop, printAreaWidth, printAreaHeight);
      context.clip();
      context.drawImage(
        artworkImage,
        printAreaLeft + placement.x * printAreaWidth,
        printAreaTop + placement.y * printAreaHeight,
        placement.width * printAreaWidth,
        placement.height * printAreaHeight
      );
      context.restore();

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => {
          if (value) {
            resolve(value);
          } else {
            reject(new Error("Failed to export mockup PNG."));
          }
        }, "image/png");
      });

      downloadBlob(blob, `hoodie-${side}-${size}-mockup.png`);
      setStatus(`Downloaded full ${side} mockup PNG.`);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Mockup PNG download failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogManufacturerSpec = () => {
    if (!garmentRelativeSpec) {
      setError("Upload artwork before generating manufacturer placement spec.");
      return;
    }

    console.log("Garment-relative manufacturer placement spec", garmentRelativeSpec);
    setStatus(`Garment-relative manufacturer placement spec logged for the ${side} side.`);
  };

  const updatePlacementFromInches = (
    updates: Partial<{
      leftIn: number;
      topIn: number;
      widthIn: number;
      heightIn: number;
      bottomIn: number;
    }>
  ) => {
    if (!placement || !inches) {
      return;
    }

    const nextWidthIn = Math.max(updates.widthIn ?? inches.widthIn, 0.1);
    const nextHeightIn = Math.max(updates.heightIn ?? inches.heightIn, 0.1);

    let nextTopIn = updates.topIn ?? inches.topIn;
    if (typeof updates.bottomIn === "number") {
      nextTopIn = template.printAreaReal.heightIn - updates.bottomIn - nextHeightIn;
    }

    const nextLeftIn = updates.leftIn ?? inches.leftIn;
    const unclampedTopIn = nextTopIn;

    setPlacementsBySide((current) => ({
      ...current,
      [side]: {
        ...placement,
        x: nextLeftIn / template.printAreaReal.widthIn,
        y: unclampedTopIn / template.printAreaReal.heightIn,
        width: nextWidthIn / template.printAreaReal.widthIn,
        height: nextHeightIn / template.printAreaReal.heightIn,
      },
    }));
    setIsArtworkSelected(true);
  };

  const updatePlacementFromCentimeters = (
    updates: Partial<{
      leftCm: number;
      topCm: number;
      widthCm: number;
      heightCm: number;
      bottomCm: number;
    }>
  ) => {
    updatePlacementFromInches({
      leftIn: typeof updates.leftCm === "number" ? toInches(updates.leftCm) : undefined,
      topIn: typeof updates.topCm === "number" ? toInches(updates.topCm) : undefined,
      widthIn: typeof updates.widthCm === "number" ? toInches(updates.widthCm) : undefined,
      heightIn: typeof updates.heightCm === "number" ? toInches(updates.heightCm) : undefined,
      bottomIn: typeof updates.bottomCm === "number" ? toInches(updates.bottomCm) : undefined,
    });
  };

  const previewPrintAreaStyle = {
    left: `${(template.printAreaOnCanvas.x / template.canvasWidth) * 100}%`,
    top: `${(template.printAreaOnCanvas.y / template.canvasHeight) * 100}%`,
    width: `${(template.printAreaOnCanvas.width / template.canvasWidth) * 100}%`,
    height: `${(template.printAreaOnCanvas.height / template.canvasHeight) * 100}%`,
  };
  const showPrintAreaChrome = !artwork || isArtworkSelected;

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>
              Hoodie front/back editor. Preview pixels are visual only; manufacturing values come from normalized
              placement, the moved print area, and the selected size metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="hoodie-size">Size</Label>
              <Select value={size} onValueChange={(value) => setSize(value as SupportedPrintSize)}>
                <SelectTrigger id="hoodie-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="2XL">2XL</SelectItem>
                  <SelectItem value="3XL">3XL</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">`4XL` garment measurements exist, but export is not enabled because no real front print-area size was provided.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoodie-side">Side</Label>
              <Select value={side} onValueChange={(value) => setSide(value as HoodieSide)}>
                <SelectTrigger id="hoodie-side">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Front</SelectItem>
                  <SelectItem value="back">Back</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Front and back keep separate normalized placements. Back garment-relative values use back garment measurements plus temporary back print-area anchors.</p>
              <p className="text-xs text-muted-foreground">The green print area is locked for measurement accuracy.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="artwork-upload">Artwork Upload</Label>
              <Input id="artwork-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} />
              <p className="text-sm text-muted-foreground">
                One artwork image. Oversized files are rejected and large artwork is initially fit inside the print area.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="design-id">Design ID</Label>
              <Input
                id="design-id"
                value={designId}
                onChange={(event) => setDesignId(event.target.value)}
                placeholder="Supabase design UUID"
              />
              <p className="text-xs text-muted-foreground">Backend save/load uses `design_specs.hoodie_editor_state` for this design.</p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">{artwork ? artwork.name : "No artwork uploaded"}</p>
              <p className="mt-1 text-muted-foreground">{status}</p>
              <p className="mt-1 text-muted-foreground">
                Visible print intersection: {clippedInches ? `${round(toCm(clippedInches.widthIn))} cm x ${round(toCm(clippedInches.heightIn))} cm` : "outside print area"}
              </p>
              <p className="mt-1 text-muted-foreground">
                Locked print area anchor: X {round(toCm(movedGarmentAnchor.centerXFromGarmentCenterIn))} cm, Y {round(toCm(movedGarmentAnchor.topFromHPSIn))} cm
              </p>
              {measuredPlacement ? (
                <p className="mt-1 text-muted-foreground">
                  XL measured hoodie: top from HPS {round(measuredPlacement.topFromHpsCm)} cm, left/right {round(measuredPlacement.leftFromLeftEdgeCm)} cm / {round(measuredPlacement.rightFromRightEdgeCm)} cm
                </p>
              ) : null}
              <p className={`mt-1 font-medium ${isHorizontallyCentered ? "text-[#0f766e]" : "text-muted-foreground"}`}>
                {isHorizontallyCentered
                  ? "Horizontally centered on print area"
                  : centerOffsetCm !== null
                    ? `Center offset: ${round(centerOffsetCm)} cm`
                    : "Center offset: -"}
              </p>
              {error ? <p className="mt-2 text-red-600">{error}</p> : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSavePlacement} disabled={!placement}>
                Save Normalized Placement
              </Button>
              <Button variant="secondary" onClick={handleDownloadSavedDesign} disabled={!savedDesign}>
                Download Saved Design
              </Button>
              <Button variant="secondary" onClick={handleLoadFromBackend} disabled={!designId || isSyncing}>
                {isSyncing ? "Syncing..." : "Load From Backend"}
              </Button>
              <Button onClick={handleSaveToBackend} disabled={!designId || isSyncing}>
                {isSyncing ? "Syncing..." : "Save To Backend"}
              </Button>
              <Button variant="secondary" onClick={handleLogManufacturerSpec} disabled={!garmentRelativeSpec}>
                Log Manufacturer Spec
              </Button>
              <Button variant="outline" onClick={handleDownloadMockupPng} disabled={!placement || !artwork || isExporting}>
                Download Mockup PNG
              </Button>
              <Button variant="outline" onClick={handleExport} disabled={!placement || isExporting}>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export PNG"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Print Measurements</CardTitle>
            <CardDescription>Full artwork placement is preserved. Visible print values are the clipped portion inside the print area.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Artwork Width</p>
              <p className="mt-1 font-medium">{inches ? `${round(toCm(inches.widthIn))} cm` : "-"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Artwork Height</p>
              <p className="mt-1 font-medium">{inches ? `${round(toCm(inches.heightIn))} cm` : "-"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Left From Print Area</p>
              <p className="mt-1 font-medium">{inches ? `${round(toCm(inches.leftIn))} cm` : "-"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Top From Print Area</p>
              <p className="mt-1 font-medium">{inches ? `${round(toCm(inches.topIn))} cm` : "-"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Bottom From Print Area</p>
              <p className="mt-1 font-medium">{bottomIn !== null ? `${round(toCm(bottomIn))} cm` : "-"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Visible Width In Print Area</p>
              <p className="mt-1 font-medium">{clippedInches ? `${round(toCm(clippedInches.widthIn))} cm` : "0 cm"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Visible Height In Print Area</p>
              <p className="mt-1 font-medium">{clippedInches ? `${round(toCm(clippedInches.heightIn))} cm` : "0 cm"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Placement Controls</CardTitle>
            <CardDescription>Adjust left, top, width, height, or bottom offset in centimeters. Values may extend outside the print area.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="placement-left">Left (cm)</Label>
              <Input
                id="placement-left"
                type="number"
                step="0.01"
                value={inches ? round(toCm(inches.leftIn)) : ""}
                onChange={(event) => updatePlacementFromCentimeters({ leftCm: Number(event.target.value) })}
                disabled={!inches}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placement-top">Top (cm)</Label>
              <Input
                id="placement-top"
                type="number"
                step="0.01"
                value={inches ? round(toCm(inches.topIn)) : ""}
                onChange={(event) => updatePlacementFromCentimeters({ topCm: Number(event.target.value) })}
                disabled={!inches}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placement-width">Width (cm)</Label>
              <Input
                id="placement-width"
                type="number"
                step="0.01"
                value={inches ? round(toCm(inches.widthIn)) : ""}
                onChange={(event) => updatePlacementFromCentimeters({ widthCm: Number(event.target.value) })}
                disabled={!inches}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placement-height">Height (cm)</Label>
              <Input
                id="placement-height"
                type="number"
                step="0.01"
                value={inches ? round(toCm(inches.heightIn)) : ""}
                onChange={(event) => updatePlacementFromCentimeters({ heightCm: Number(event.target.value) })}
                disabled={!inches}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placement-bottom">Bottom (cm)</Label>
              <Input
                id="placement-bottom"
                type="number"
                step="0.01"
                value={bottomIn !== null ? round(toCm(bottomIn)) : ""}
                onChange={(event) => updatePlacementFromCentimeters({ bottomCm: Number(event.target.value) })}
                disabled={bottomIn === null}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manufacturer Panel</CardTitle>
            <CardDescription>
              HPS is the high point shoulder. Exact garment values come from your measurement spec. Print-area garment
              anchors are temporary defaults. Back-side anchors are assumptions because the garment spec does not provide an official back print template.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Selected Size</p>
                <p className="mt-1 font-medium">{size}</p>
                <p className="mt-1 font-medium">Selected side: {side}</p>
                <p className="mt-3 text-muted-foreground">Print Area</p>
                <p className="mt-1 font-medium">{round(toCm(template.printAreaReal.widthIn))} cm x {round(toCm(template.printAreaReal.heightIn))} cm</p>
                <p className="mt-1 font-medium">{template.printAreaReal.widthPx} px x {template.printAreaReal.heightPx} px</p>
                <p className="mt-1 font-medium">{template.printAreaReal.dpi} DPI</p>
                <p className="mt-3 text-muted-foreground">Print Area Garment Anchor</p>
                <p className="mt-1 font-medium">Center X from centerline: {round(toCm(movedGarmentAnchor.centerXFromGarmentCenterIn))} cm</p>
                <p className="mt-1 font-medium">Top from HPS: {round(toCm(movedGarmentAnchor.topFromHPSIn))} cm</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {side === "front"
                    ? "Front anchor is now locked to a lower calibrated chest-print assumption."
                    : "Back anchor is locked to a lower calibrated assumption because the garment spec does not provide an official back print template."}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Exact Garment Measurements</p>
                <p className="mt-1 font-medium">Back length: {round(toCm(garmentMeasurements.backLengthIn))} cm</p>
                <p className="mt-1 font-medium">Across shoulder: {round(toCm(garmentMeasurements.acrossShoulderIn))} cm</p>
                {side === "front" ? (
                  <>
                    <p className="mt-1 font-medium">Chest half: {round(toCm(garmentMeasurements.chestHalfIn))} cm</p>
                    <p className="mt-1 font-medium">Across front 6.5 down: {round(toCm(garmentMeasurements.acrossFront6_5DownIn))} cm</p>
                    <p className="mt-1 font-medium">Neck width: {round(toCm(garmentMeasurements.neckWidthIn))} cm</p>
                    <p className="mt-1 font-medium">Front neck drop: {round(toCm(garmentMeasurements.frontNeckDropIn))} cm</p>
                    <p className="mt-1 font-medium">Waistband height: {round(toCm(garmentMeasurements.waistbandHeightIn))} cm</p>
                  </>
                ) : (
                  <>
                    <p className="mt-1 font-medium">Across back 6.5 down: {round(toCm(garmentMeasurements.acrossBack6_5DownIn))} cm</p>
                    <p className="mt-1 font-medium">Back neck drop: {round(toCm(garmentMeasurements.backNeckDropIn))} cm</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Artwork Relative To Garment</p>
                <p className="mt-1 font-medium">Left from centerline: {garmentRelativeSpec ? `${round(toCm(garmentRelativeSpec.artwork.leftFromGarmentCenterIn))} cm` : "-"}</p>
                <p className="mt-1 font-medium">Right from centerline: {garmentRelativeSpec ? `${round(toCm(garmentRelativeSpec.artwork.rightFromGarmentCenterIn))} cm` : "-"}</p>
                <p className="mt-1 font-medium">Center X from centerline: {garmentRelativeSpec ? `${round(toCm(garmentRelativeSpec.artwork.centerXFromGarmentCenterIn))} cm` : "-"}</p>
                <p className="mt-1 font-medium">Top from HPS: {garmentRelativeSpec ? `${round(toCm(garmentRelativeSpec.artwork.topFromHPSIn))} cm` : "-"}</p>
                <p className="mt-1 font-medium">Bottom from HPS: {garmentRelativeSpec ? `${round(toCm(garmentRelativeSpec.artwork.bottomFromHPSIn))} cm` : "-"}</p>
                <p className="mt-1 font-medium">Center Y from HPS: {garmentRelativeSpec ? `${round(toCm(garmentRelativeSpec.artwork.centerYFromHPSIn))} cm` : "-"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Artwork Percentages</p>
                <p className="mt-1 font-medium">Width: {garmentRelativeSpec ? `${round(toCm(garmentRelativeSpec.artwork.widthIn))} cm` : "-"}</p>
                <p className="mt-1 font-medium">Height: {garmentRelativeSpec ? `${round(toCm(garmentRelativeSpec.artwork.heightIn))} cm` : "-"}</p>
                <p className="mt-1 font-medium">
                  {side === "front" ? "Left % of chest half" : "Left % of across back 6.5 down"}:{" "}
                  {garmentRelativeSpec
                    ? `${round(
                        side === "front"
                          ? garmentRelativeSpec.artwork.leftPctOfChestHalf
                          : garmentRelativeSpec.artwork.leftPctOfAcrossBack6_5Down
                      )}%`
                    : "-"}
                </p>
                <p className="mt-1 font-medium">
                  {side === "front" ? "Width % of chest half" : "Width % of across back 6.5 down"}:{" "}
                  {garmentRelativeSpec
                    ? `${round(
                        side === "front"
                          ? garmentRelativeSpec.artwork.widthPctOfChestHalf
                          : garmentRelativeSpec.artwork.widthPctOfAcrossBack6_5Down
                      )}%`
                    : "-"}
                </p>
                <p className="mt-1 font-medium">Top % of back length: {garmentRelativeSpec ? `${round(garmentRelativeSpec.artwork.topPctOfBackLength)}%` : "-"}</p>
                <p className="mt-1 font-medium">Height % of back length: {garmentRelativeSpec ? `${round(garmentRelativeSpec.artwork.heightPctOfBackLength)}%` : "-"}</p>
              </div>
            </div>

            {side === "front" ? (
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Pocket Dimensions</p>
                <p className="mt-1 font-medium">Length: {round(toCm(garmentMeasurements.pocketLengthIn))} cm</p>
                <p className="mt-1 font-medium">Top width: {round(toCm(garmentMeasurements.pocketTopWidthIn))} cm</p>
                <p className="mt-1 font-medium">Opening width: {round(toCm(garmentMeasurements.pocketOpeningWidthIn))} cm</p>
                <p className="mt-1 font-medium">Bottom width: {round(toCm(garmentMeasurements.pocketBottomWidthIn))} cm</p>
                <p className="mt-1 font-medium">Opening curve: {round(toCm(garmentMeasurements.pocketOpeningCurveIn))} cm</p>
                <p className="mt-2 text-xs text-muted-foreground">Exact from the garment spec. Vertical pocket placement remains unknown and is not assumed.</p>
              </div>
            ) : (
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Back Reference Lines</p>
                <p className="mt-1 font-medium">Across back 6.5 down: {round(toCm(garmentMeasurements.acrossBack6_5DownIn))} cm</p>
                <p className="mt-1 font-medium">Back neck drop: {round(toCm(garmentMeasurements.backNeckDropIn))} cm</p>
                <p className="mt-1 font-medium">Across shoulder: {round(toCm(garmentMeasurements.acrossShoulderIn))} cm</p>
                <p className="mt-2 text-xs text-muted-foreground">These values are exact from the garment spec. The back print-area anchor above is assumed.</p>
              </div>
            )}

            {measuredPlacement ? (
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Measured Hoodie Calibration</p>
                <p className="mt-1 font-medium">Body length without hood: {round(measuredPlacement.bodyLengthCm)} cm</p>
                <p className="mt-1 font-medium">Flat width: {round(measuredPlacement.flatWidthCm)} cm</p>
                <p className="mt-1 font-medium">Artwork top from HPS: {round(measuredPlacement.topFromHpsCm)} cm</p>
                <p className="mt-1 font-medium">Artwork bottom from HPS: {round(measuredPlacement.bottomFromHpsCm)} cm</p>
                <p className="mt-1 font-medium">Artwork bottom from measured bottom: {round(measuredPlacement.bottomFromMeasuredBottomCm)} cm</p>
                <p className="mt-1 font-medium">Artwork left from left edge: {round(measuredPlacement.leftFromLeftEdgeCm)} cm</p>
                <p className="mt-1 font-medium">Artwork right from right edge: {round(measuredPlacement.rightFromRightEdgeCm)} cm</p>
                <p className="mt-1 font-medium">Artwork width x height: {round(measuredPlacement.widthCm)} cm x {round(measuredPlacement.heightCm)} cm</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Based on your measured XL hoodie: 72 cm body length without hood and 60 cm flat width.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug JSON</CardTitle>
            <CardDescription>The first JSON is the visible placement inside the print area only. The second is the centimeter-based manufacturer view derived from that visible area.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 text-xs leading-6">
              {JSON.stringify(savedPlacement ? getPlacementIntersectionWithPrintArea(savedPlacement) : visiblePlacement, null, 2)}
            </pre>
            <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 text-xs leading-6">
              {JSON.stringify(garmentRelativeSpecCm, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              The hoodie mockup is only a visual preview. The dashed rectangle is the allowed {side} print area for the selected size.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mx-auto w-full max-w-[720px]">
              <div className="relative aspect-square overflow-hidden rounded-2xl border bg-[#f7f3ed] shadow-sm">
                <img
                  src={template.mockupUrl}
                  alt={`Hoodie ${side} mockup`}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div
                  ref={printAreaRef}
                  className={`absolute transition-colors ${
                    showPrintAreaChrome
                      ? "border-2 border-dashed border-[#0f766e] bg-[#0f766e]/10"
                      : "border-2 border-transparent bg-transparent"
                  }`}
                  style={previewPrintAreaStyle}
                >
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-opacity ${
                      isArtworkSelected ? "opacity-100" : "opacity-0"
                    } ${isHorizontallyCentered ? "bg-[#0f766e]" : "bg-white/50"}`}
                  />
                  <div
                    className={`pointer-events-none absolute left-2 top-2 rounded bg-[#0f766e] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-opacity ${
                      showPrintAreaChrome ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {side} print area
                  </div>

                  {placement && artwork ? (
                    <>
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2px]">
                        <img
                          src={artwork.src}
                          alt="Artwork preview"
                          className="absolute select-none object-fill"
                          style={{
                            left: `${placement.x * 100}%`,
                            top: `${placement.y * 100}%`,
                            width: `${placement.width * 100}%`,
                            height: `${placement.height * 100}%`,
                          }}
                        />
                      </div>

                      <div
                        className={`absolute cursor-grab active:cursor-grabbing ${
                          isArtworkSelected ? "outline outline-2 outline-white/80" : ""
                        }`}
                        data-artwork-transform="true"
                        style={{
                          left: `${placement.x * 100}%`,
                          top: `${placement.y * 100}%`,
                          width: `${placement.width * 100}%`,
                          height: `${placement.height * 100}%`,
                        }}
                        onPointerDown={(event) => {
                          if (!printAreaRef.current || !(event.target instanceof HTMLElement)) {
                            return;
                          }

                          if (event.target instanceof HTMLElement && event.target.dataset.handleDirection) {
                            return;
                          }

                          dragStateRef.current = {
                            mode: "move",
                            startX: event.clientX,
                            startY: event.clientY,
                            placement,
                            areaRect: printAreaRef.current.getBoundingClientRect(),
                          };
                          setIsArtworkSelected(true);
                        }}
                      >
                        {isHorizontallyCentered && artworkCenterX !== null ? (
                          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-[#0f766e] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                            Centered
                          </div>
                        ) : null}
                        {isArtworkSelected ? RESIZE_HANDLES.map((handle) => {
                          const Icon = handle.icon;

                          return (
                            <button
                              key={handle.direction}
                              type="button"
                              data-handle-direction={handle.direction}
                              className={`absolute flex h-7 w-7 items-center justify-center rounded-full border bg-background shadow ${handle.className}`}
                              onPointerDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();

                                if (!printAreaRef.current) {
                                  return;
                                }

                                dragStateRef.current = {
                                  mode: "resize",
                                  direction: handle.direction,
                                  startX: event.clientX,
                                  startY: event.clientY,
                                  placement,
                                  areaRect: printAreaRef.current.getBoundingClientRect(),
                                };
                                setIsArtworkSelected(true);
                              }}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </button>
                          );
                        }) : null}
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-sm text-[#0f766e]">
                      <Upload className="h-6 w-6" />
                      <p>Upload artwork to place it inside the front print area.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">Normalized X / Y</p>
                <p className="mt-1 font-medium">{placement ? `${round(placement.x)}, ${round(placement.y)}` : "-"}</p>
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">Normalized W / H</p>
                <p className="mt-1 font-medium">{placement ? `${round(placement.width)}, ${round(placement.height)}` : "-"}</p>
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">Export X / Y</p>
                <p className="mt-1 font-medium">{exportPixels ? `${exportPixels.x}, ${exportPixels.y}` : "-"}</p>
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">Export W / H</p>
                <p className="mt-1 font-medium">{exportPixels ? `${exportPixels.width}, ${exportPixels.height}` : "-"}</p>
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">Visible Export X / Y</p>
                <p className="mt-1 font-medium">{clippedExportPixels ? `${clippedExportPixels.x}, ${clippedExportPixels.y}` : "-"}</p>
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">Visible Export W / H</p>
                <p className="mt-1 font-medium">{clippedExportPixels ? `${clippedExportPixels.width}, ${clippedExportPixels.height}` : "0, 0"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HoodieFrontEditor;
