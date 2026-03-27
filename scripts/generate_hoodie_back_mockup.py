from pathlib import Path

from PIL import Image, ImageDraw

# ============================================================================
# User-editable settings
# ============================================================================

# Input files
HOODIE_IMAGE_PATH = "hoodie_back.png"
DESIGN_IMAGE_PATH = "design.png"

# Output file
OUTPUT_IMAGE_PATH = "mockup_output.png"

# Real garment measurements in cm
BACK_LENGTH_CM = 72.0
DESIGN_TOP_FROM_HPS_CM = 15.0
DESIGN_HEIGHT_CM = 30.0
LEFT_MARGIN_CM = 10.0
RIGHT_MARGIN_CM = 10.0

# Pixel anchors measured on the hoodie image
HPS_Y = 120
HEM_Y = 1080
LEFT_BODY_X = 220
RIGHT_BODY_X = 860

# Placement mode: "center" or "top-center"
PLACE_MODE = "center"

# Draw debug print box
DEBUG = True


def validate_inputs(hps_y, hem_y, left_body_x, right_body_x):
    if hem_y <= hps_y:
        raise ValueError("Invalid anchors: HEM_Y must be greater than HPS_Y.")
    if right_body_x <= left_body_x:
        raise ValueError("Invalid anchors: RIGHT_BODY_X must be greater than LEFT_BODY_X.")
    if PLACE_MODE not in {"center", "top-center"}:
        raise ValueError('PLACE_MODE must be either "center" or "top-center".')


def compute_pixels_per_cm(hps_y, hem_y, back_length_cm):
    return (hem_y - hps_y) / back_length_cm


def compute_design_box(px_per_cm):
    top_y = HPS_Y + DESIGN_TOP_FROM_HPS_CM * px_per_cm
    bottom_y = top_y + DESIGN_HEIGHT_CM * px_per_cm
    left_x = LEFT_BODY_X + LEFT_MARGIN_CM * px_per_cm
    right_x = RIGHT_BODY_X - RIGHT_MARGIN_CM * px_per_cm

    if right_x <= left_x:
        raise ValueError("Invalid computed box: right_x must be greater than left_x.")
    if bottom_y <= top_y:
        raise ValueError("Invalid computed box: bottom_y must be greater than top_y.")

    return {
        "left_x": left_x,
        "top_y": top_y,
        "right_x": right_x,
        "bottom_y": bottom_y,
        "width_px": right_x - left_x,
        "height_px": bottom_y - top_y,
    }


def print_box_dimensions(box, px_per_cm):
    width_cm = box["width_px"] / px_per_cm
    height_cm = box["height_px"] / px_per_cm

    print("Computed design box:")
    print(f"  Left X:   {box['left_x']:.2f}px")
    print(f"  Top Y:    {box['top_y']:.2f}px")
    print(f"  Right X:  {box['right_x']:.2f}px")
    print(f"  Bottom Y: {box['bottom_y']:.2f}px")
    print(f"  Width:    {box['width_px']:.2f}px ({width_cm:.2f} cm)")
    print(f"  Height:   {box['height_px']:.2f}px ({height_cm:.2f} cm)")
    print(f"  Pixels/cm:{px_per_cm:.4f}")


def resize_design_to_fit(design_image, max_width, max_height):
    original_width, original_height = design_image.size
    scale = min(max_width / original_width, max_height / original_height)

    new_width = max(1, int(round(original_width * scale)))
    new_height = max(1, int(round(original_height * scale)))

    return design_image.resize((new_width, new_height), Image.LANCZOS)


def compute_design_position(box, resized_design):
    design_width, design_height = resized_design.size
    box_width = box["width_px"]
    box_height = box["height_px"]

    x = box["left_x"] + (box_width - design_width) / 2

    if PLACE_MODE == "center":
        y = box["top_y"] + (box_height - design_height) / 2
    else:
        y = box["top_y"]

    return int(round(x)), int(round(y))


def draw_debug_box(image, box):
    draw = ImageDraw.Draw(image)
    draw.rectangle(
        [
            (int(round(box["left_x"])), int(round(box["top_y"]))),
            (int(round(box["right_x"])), int(round(box["bottom_y"]))),
        ],
        outline=(255, 0, 0, 255),
        width=3,
    )


def main():
    validate_inputs(HPS_Y, HEM_Y, LEFT_BODY_X, RIGHT_BODY_X)

    hoodie_path = Path(HOODIE_IMAGE_PATH)
    design_path = Path(DESIGN_IMAGE_PATH)

    if not hoodie_path.exists():
        raise FileNotFoundError(f"Hoodie image not found: {hoodie_path}")
    if not design_path.exists():
        raise FileNotFoundError(f"Design image not found: {design_path}")

    px_per_cm = compute_pixels_per_cm(HPS_Y, HEM_Y, BACK_LENGTH_CM)
    box = compute_design_box(px_per_cm)
    print_box_dimensions(box, px_per_cm)

    hoodie = Image.open(hoodie_path).convert("RGBA")
    print(f"Hoodie image size: {hoodie.size}")
    design = Image.open(design_path).convert("RGBA")

    resized_design = resize_design_to_fit(
        design,
        max_width=box["width_px"],
        max_height=box["height_px"],
    )

    paste_x, paste_y = compute_design_position(box, resized_design)

    result = hoodie.copy()
    result.alpha_composite(resized_design, (paste_x, paste_y))

    if DEBUG:
        draw_debug_box(result, box)

    result.save(OUTPUT_IMAGE_PATH)
    print(f"Saved mockup to: {OUTPUT_IMAGE_PATH}")


if __name__ == "__main__":
    main()
