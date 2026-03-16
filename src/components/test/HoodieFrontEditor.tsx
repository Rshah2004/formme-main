import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { ArrowUpLeft, ArrowUpRight, Download, Upload } from "lucide-react";
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
  type AnyManufacturerGarmentRelativeSpec,
} from "./garmentPlacement";

type UploadedArtwork = {
  assetId: string;
  name: string;
  src: string;
  width: number;
  height: number;
};

type PlacementBySide = Partial<Record<HoodieSide, Placement>>;
type PrintAreaOffset = { x: number; y: number };
type PrintAreaOffsetBySide = Partial<Record<HoodieSide, PrintAreaOffset>>;

type DragState =
  | {
      mode: "move";
      startX: number;
      startY: number;
      placement: Placement;
      areaRect: DOMRect;
    }
  | {
      mode: "area-move";
      startX: number;
      startY: number;
      offset: PrintAreaOffset;
      containerRect: DOMRect;
      areaSize: { width: number; height: number };
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

const round = (value: number) => Math.round(value * 100) / 100;
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

const PRINT_AREA_DRAG_ZONES = [
  {
    key: "top",
    className: "left-0 top-0 h-3 w-full -translate-y-1/2 cursor-move",
  },
  {
    key: "right",
    className: "right-0 top-0 h-full w-3 translate-x-1/2 cursor-move",
  },
  {
    key: "bottom",
    className: "bottom-0 left-0 h-3 w-full translate-y-1/2 cursor-move",
  },
  {
    key: "left",
    className: "left-0 top-0 h-full w-3 -translate-x-1/2 cursor-move",
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
  const [size, setSize] = useState<SupportedPrintSize>("M");
  const [side, setSide] = useState<HoodieSide>("front");
  const [artwork, setArtwork] = useState<UploadedArtwork | null>(null);
  const [placementsBySide, setPlacementsBySide] = useState<PlacementBySide>({});
  const [printAreaOffsetsBySide, setPrintAreaOffsetsBySide] = useState<PrintAreaOffsetBySide>({});
  const [savedPlacementsBySide, setSavedPlacementsBySide] = useState<PlacementBySide>({});
  const [isArtworkSelected, setIsArtworkSelected] = useState(false);
  const [status, setStatus] = useState("Upload one artwork image to begin.");
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const printAreaRef = useRef<HTMLDivElement | null>(null);
  const mockupRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState>(null);

  const template = hoodieTemplateBySizeAndSide[size][side];
  const placement = placementsBySide[side] ?? null;
  const savedPlacement = savedPlacementsBySide[side] ?? null;
  const printAreaOffset = printAreaOffsetsBySide[side] ?? { x: 0, y: 0 };
  const garmentMeasurements = hoodieMeasurementSpec[size];
  const garmentAnchorBase =
    side === "back"
      ? defaultBackPrintAreaAnchorBySize[size]
      : defaultFrontPrintAreaAnchorBySize[size];
  const movedGarmentAnchor = useMemo(() => {
    const offsetCanvasX = printAreaOffset.x * template.canvasWidth;
    const offsetCanvasY = printAreaOffset.y * template.canvasHeight;
    const offsetXIn =
      (offsetCanvasX / template.printAreaOnCanvas.width) * template.printAreaReal.widthIn;
    const offsetYIn =
      (offsetCanvasY / template.printAreaOnCanvas.height) * template.printAreaReal.heightIn;

    return {
      centerXFromGarmentCenterIn: garmentAnchorBase.centerXFromGarmentCenterIn + offsetXIn,
      topFromHPSIn: garmentAnchorBase.topFromHPSIn + offsetYIn,
    };
  }, [
    garmentAnchorBase.centerXFromGarmentCenterIn,
    garmentAnchorBase.topFromHPSIn,
    printAreaOffset.x,
    printAreaOffset.y,
    template.canvasHeight,
    template.canvasWidth,
    template.printAreaOnCanvas.height,
    template.printAreaOnCanvas.width,
    template.printAreaReal.heightIn,
    template.printAreaReal.widthIn,
  ]);

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
  const clippedInches = useMemo(
    () =>
      clippedPlacement
        ? {
            leftIn: clippedPlacement.x * template.printAreaReal.widthIn,
            topIn: clippedPlacement.y * template.printAreaReal.heightIn,
            widthIn: clippedPlacement.width * template.printAreaReal.widthIn,
            heightIn: clippedPlacement.height * template.printAreaReal.heightIn,
          }
        : null,
    [clippedPlacement, template.printAreaReal.heightIn, template.printAreaReal.widthIn]
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
      inches
        ? getGarmentRelativePlacementSpecBySide({
            side,
            size,
            placementInInches: inches,
            printAreaReal: template.printAreaReal,
            printAreaGarmentAnchor: movedGarmentAnchor,
          })
        : null,
    [inches, movedGarmentAnchor, side, size, template.printAreaReal]
  );
  const bottomIn = inches
    ? template.printAreaReal.heightIn - inches.topIn - inches.heightIn
    : null;
  const artworkCenterX = placement ? placement.x + placement.width / 2 : null;
  const centerOffsetIn = inches
    ? Math.abs(inches.leftIn + inches.widthIn / 2 - template.printAreaReal.widthIn / 2)
    : null;
  const isHorizontallyCentered = centerOffsetIn !== null && centerOffsetIn <= 0.1;

  useEffect(() => {
    if (!artwork) {
      setPlacementsBySide({});
      setSavedPlacementsBySide({});
      setIsArtworkSelected(false);
      return;
    }

    setPlacementsBySide((current) => ({
      ...current,
      [side]: current[side] ?? createInitialPlacement(artwork, size, side),
    }));
  }, [artwork, side, size]);

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
      if (artwork?.src.startsWith("blob:")) {
        URL.revokeObjectURL(artwork.src);
      }
    };
  }, [artwork]);

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

      if (dragState.mode === "area-move") {
        const deltaX = (event.clientX - dragState.startX) / dragState.containerRect.width;
        const deltaY = (event.clientY - dragState.startY) / dragState.containerRect.height;
        const maxOffsetX = Math.max(0, 1 - dragState.areaSize.width);
        const maxOffsetY = Math.max(0, 1 - dragState.areaSize.height);

        setPrintAreaOffsetsBySide((current) => ({
          ...current,
          [side]: {
            x: clamp(dragState.offset.x + deltaX, -0.35, maxOffsetX),
            y: clamp(dragState.offset.y + deltaY, -0.35, maxOffsetY),
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
      setStatus(`Moved the ${side} print area on the mockup preview.`);
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
      const image = await loadImage(fileUrl);

      if (image.naturalWidth > MAX_IMAGE_DIMENSION || image.naturalHeight > MAX_IMAGE_DIMENSION) {
        URL.revokeObjectURL(fileUrl);
        setError("Uploaded image is too large in dimensions. Keep it under 12000px on each side.");
        return;
      }

      const nextArtwork = {
        assetId: crypto.randomUUID(),
        name: file.name,
        src: fileUrl,
        width: image.naturalWidth,
        height: image.naturalHeight,
      };

      if (artwork?.src.startsWith("blob:")) {
        URL.revokeObjectURL(artwork.src);
      }

      setArtwork(nextArtwork);
      setPlacementsBySide({
        front: createInitialPlacement(nextArtwork, size, "front"),
        back: createInitialPlacement(nextArtwork, size, "back"),
      });
      setSavedPlacementsBySide({});
      setIsArtworkSelected(true);
      setStatus("Artwork loaded. Drag and resize it directly inside the print area.");
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

    setSavedPlacementsBySide((current) => ({
      ...current,
      [side]: placement,
    }));
    setIsArtworkSelected(true);
    setStatus(`Normalized placement saved for the ${side} side.`);
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

  const previewPrintAreaStyle = {
    left: `${((template.printAreaOnCanvas.x / template.canvasWidth) + printAreaOffset.x) * 100}%`,
    top: `${((template.printAreaOnCanvas.y / template.canvasHeight) + printAreaOffset.y) * 100}%`,
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
              Front-only hoodie editor. Preview pixels are visual only; manufacturing values come from normalized
              placement plus the selected size metadata.
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="artwork-upload">Artwork Upload</Label>
              <Input id="artwork-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} />
              <p className="text-sm text-muted-foreground">
                One artwork image. Oversized files are rejected and large artwork is initially fit inside the print area.
              </p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">{artwork ? artwork.name : "No artwork uploaded"}</p>
              <p className="mt-1 text-muted-foreground">{status}</p>
              <p className="mt-1 text-muted-foreground">
                Visible print intersection: {clippedInches ? `${round(clippedInches.widthIn)} in x ${round(clippedInches.heightIn)} in` : "outside print area"}
              </p>
              <p className="mt-1 text-muted-foreground">
                Print area garment offset: X {round(movedGarmentAnchor.centerXFromGarmentCenterIn)} in, Y {round(movedGarmentAnchor.topFromHPSIn)} in
              </p>
              <p className={`mt-1 font-medium ${isHorizontallyCentered ? "text-[#0f766e]" : "text-muted-foreground"}`}>
                {isHorizontallyCentered
                  ? "Horizontally centered on print area"
                  : centerOffsetIn !== null
                    ? `Center offset: ${round(centerOffsetIn)} in`
                    : "Center offset: -"}
              </p>
              {error ? <p className="mt-2 text-red-600">{error}</p> : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSavePlacement} disabled={!placement}>
                Save Normalized Placement
              </Button>
              <Button variant="secondary" onClick={handleLogManufacturerSpec} disabled={!garmentRelativeSpec}>
                Log Manufacturer Spec
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
              <p className="mt-1 font-medium">{inches ? `${round(inches.widthIn)} in` : "-"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Artwork Height</p>
              <p className="mt-1 font-medium">{inches ? `${round(inches.heightIn)} in` : "-"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Left From Print Area</p>
              <p className="mt-1 font-medium">{inches ? `${round(inches.leftIn)} in` : "-"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Top From Print Area</p>
              <p className="mt-1 font-medium">{inches ? `${round(inches.topIn)} in` : "-"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Bottom From Print Area</p>
              <p className="mt-1 font-medium">{bottomIn !== null ? `${round(bottomIn)} in` : "-"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Visible Width In Print Area</p>
              <p className="mt-1 font-medium">{clippedInches ? `${round(clippedInches.widthIn)} in` : "0 in"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Visible Height In Print Area</p>
              <p className="mt-1 font-medium">{clippedInches ? `${round(clippedInches.heightIn)} in` : "0 in"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Placement Controls</CardTitle>
            <CardDescription>Adjust left, top, width, height, or bottom offset in inches. Values may extend outside the print area.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="placement-left">Left</Label>
              <Input
                id="placement-left"
                type="number"
                step="0.01"
                value={inches ? round(inches.leftIn) : ""}
                onChange={(event) => updatePlacementFromInches({ leftIn: Number(event.target.value) })}
                disabled={!inches}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placement-top">Top</Label>
              <Input
                id="placement-top"
                type="number"
                step="0.01"
                value={inches ? round(inches.topIn) : ""}
                onChange={(event) => updatePlacementFromInches({ topIn: Number(event.target.value) })}
                disabled={!inches}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placement-width">Width</Label>
              <Input
                id="placement-width"
                type="number"
                step="0.01"
                value={inches ? round(inches.widthIn) : ""}
                onChange={(event) => updatePlacementFromInches({ widthIn: Number(event.target.value) })}
                disabled={!inches}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placement-height">Height</Label>
              <Input
                id="placement-height"
                type="number"
                step="0.01"
                value={inches ? round(inches.heightIn) : ""}
                onChange={(event) => updatePlacementFromInches({ heightIn: Number(event.target.value) })}
                disabled={!inches}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placement-bottom">Bottom</Label>
              <Input
                id="placement-bottom"
                type="number"
                step="0.01"
                value={bottomIn !== null ? round(bottomIn) : ""}
                onChange={(event) => updatePlacementFromInches({ bottomIn: Number(event.target.value) })}
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
                <p className="mt-1 font-medium">{template.printAreaReal.widthIn} in x {template.printAreaReal.heightIn} in</p>
                <p className="mt-1 font-medium">{template.printAreaReal.widthPx} px x {template.printAreaReal.heightPx} px</p>
                <p className="mt-1 font-medium">{template.printAreaReal.dpi} DPI</p>
                <p className="mt-3 text-muted-foreground">Print Area Garment Anchor</p>
                <p className="mt-1 font-medium">Base center X from centerline: {round(garmentAnchorBase.centerXFromGarmentCenterIn)} in</p>
                <p className="mt-1 font-medium">Base top from HPS: {round(garmentAnchorBase.topFromHPSIn)} in</p>
                <p className="mt-1 font-medium">Moved center X from centerline: {round(movedGarmentAnchor.centerXFromGarmentCenterIn)} in</p>
                <p className="mt-1 font-medium">Moved top from HPS: {round(movedGarmentAnchor.topFromHPSIn)} in</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {side === "front"
                    ? "Front anchor is a temporary chest-print assumption. The moved values include your current green-box offset on the mockup."
                    : "Back anchor is a temporary assumption because the garment spec only provides back garment measurements, not an official back print template. The moved values include your current green-box offset on the mockup."}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Exact Garment Measurements</p>
                <p className="mt-1 font-medium">Back length: {round(garmentMeasurements.backLengthIn)} in</p>
                <p className="mt-1 font-medium">Across shoulder: {round(garmentMeasurements.acrossShoulderIn)} in</p>
                {side === "front" ? (
                  <>
                    <p className="mt-1 font-medium">Chest half: {round(garmentMeasurements.chestHalfIn)} in</p>
                    <p className="mt-1 font-medium">Across front 6.5 down: {round(garmentMeasurements.acrossFront6_5DownIn)} in</p>
                    <p className="mt-1 font-medium">Neck width: {round(garmentMeasurements.neckWidthIn)} in</p>
                    <p className="mt-1 font-medium">Front neck drop: {round(garmentMeasurements.frontNeckDropIn)} in</p>
                    <p className="mt-1 font-medium">Waistband height: {round(garmentMeasurements.waistbandHeightIn)} in</p>
                  </>
                ) : (
                  <>
                    <p className="mt-1 font-medium">Across back 6.5 down: {round(garmentMeasurements.acrossBack6_5DownIn)} in</p>
                    <p className="mt-1 font-medium">Back neck drop: {round(garmentMeasurements.backNeckDropIn)} in</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Artwork Relative To Garment</p>
                <p className="mt-1 font-medium">Left from centerline: {garmentRelativeSpec ? `${round(garmentRelativeSpec.artwork.leftFromGarmentCenterIn)} in` : "-"}</p>
                <p className="mt-1 font-medium">Right from centerline: {garmentRelativeSpec ? `${round(garmentRelativeSpec.artwork.rightFromGarmentCenterIn)} in` : "-"}</p>
                <p className="mt-1 font-medium">Center X from centerline: {garmentRelativeSpec ? `${round(garmentRelativeSpec.artwork.centerXFromGarmentCenterIn)} in` : "-"}</p>
                <p className="mt-1 font-medium">Top from HPS: {garmentRelativeSpec ? `${round(garmentRelativeSpec.artwork.topFromHPSIn)} in` : "-"}</p>
                <p className="mt-1 font-medium">Bottom from HPS: {garmentRelativeSpec ? `${round(garmentRelativeSpec.artwork.bottomFromHPSIn)} in` : "-"}</p>
                <p className="mt-1 font-medium">Center Y from HPS: {garmentRelativeSpec ? `${round(garmentRelativeSpec.artwork.centerYFromHPSIn)} in` : "-"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Artwork Percentages</p>
                <p className="mt-1 font-medium">Width: {garmentRelativeSpec ? `${round(garmentRelativeSpec.artwork.widthIn)} in` : "-"}</p>
                <p className="mt-1 font-medium">Height: {garmentRelativeSpec ? `${round(garmentRelativeSpec.artwork.heightIn)} in` : "-"}</p>
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
                <p className="mt-1 font-medium">Length: {round(garmentMeasurements.pocketLengthIn)} in</p>
                <p className="mt-1 font-medium">Top width: {round(garmentMeasurements.pocketTopWidthIn)} in</p>
                <p className="mt-1 font-medium">Opening width: {round(garmentMeasurements.pocketOpeningWidthIn)} in</p>
                <p className="mt-1 font-medium">Bottom width: {round(garmentMeasurements.pocketBottomWidthIn)} in</p>
                <p className="mt-1 font-medium">Opening curve: {round(garmentMeasurements.pocketOpeningCurveIn)} in</p>
                <p className="mt-2 text-xs text-muted-foreground">Exact from the garment spec. Vertical pocket placement remains unknown and is not assumed.</p>
              </div>
            ) : (
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Back Reference Lines</p>
                <p className="mt-1 font-medium">Across back 6.5 down: {round(garmentMeasurements.acrossBack6_5DownIn)} in</p>
                <p className="mt-1 font-medium">Back neck drop: {round(garmentMeasurements.backNeckDropIn)} in</p>
                <p className="mt-1 font-medium">Across shoulder: {round(garmentMeasurements.acrossShoulderIn)} in</p>
                <p className="mt-2 text-xs text-muted-foreground">These values are exact from the garment spec. The back print-area anchor above is assumed.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug JSON</CardTitle>
            <CardDescription>Normalized placement stays relative to the print area. Garment-relative output is derived from normalized placement plus size data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 text-xs leading-6">
              {JSON.stringify(savedPlacement ?? placement, null, 2)}
            </pre>
            <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 text-xs leading-6">
              {JSON.stringify(garmentRelativeSpec, null, 2)}
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
              <div
                ref={mockupRef}
                className="relative aspect-square overflow-hidden rounded-2xl border bg-[#f7f3ed] shadow-sm"
              >
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
                  onPointerDown={(event) => {
                    const target = event.target as HTMLElement | null;

                    if (!mockupRef.current || target?.dataset.printAreaDrag !== "true") {
                      return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    dragStateRef.current = {
                      mode: "area-move",
                      startX: event.clientX,
                      startY: event.clientY,
                      offset: printAreaOffset,
                      containerRect: mockupRef.current.getBoundingClientRect(),
                      areaSize: {
                        width: template.printAreaOnCanvas.width / template.canvasWidth,
                        height: template.printAreaOnCanvas.height / template.canvasHeight,
                      },
                    };
                    setIsArtworkSelected(true);
                  }}
                >
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-opacity ${
                      isArtworkSelected ? "opacity-100" : "opacity-0"
                    } ${isHorizontallyCentered ? "bg-[#0f766e]" : "bg-white/50"}`}
                  />
                  {PRINT_AREA_DRAG_ZONES.map((zone) => (
                    <div
                      key={zone.key}
                      data-print-area-drag="true"
                      className={`absolute z-20 ${zone.className} ${
                        showPrintAreaChrome ? "pointer-events-auto" : "pointer-events-none"
                      }`}
                      title="Drag print area"
                    />
                  ))}
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
