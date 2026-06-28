#!/usr/bin/env python3
"""Generate Atlas world textures from local cartographic sources.

Runtime dependencies are intentionally not added to the frontend app. This
script expects Python with Pillow and Numpy available in the local workstation.
"""

from __future__ import annotations

import argparse
import io
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

import numpy as np
from PIL import Image, ImageDraw, ImageOps


FRONTEND_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = FRONTEND_ROOT / "public" / "images" / "world"
DEFAULT_TEXTURE_WIDTH = 2048
BASE_OUTPUT_NAME = "earth-atlas-base.png"
BORDERS_OUTPUT_NAME = "earth-atlas-borders.png"
BASE_WEBP_4K_OUTPUT_NAME = "earth-atlas-base-4k.webp"
BORDERS_WEBP_4K_OUTPUT_NAME = "earth-atlas-borders-4k.webp"
SUPPORTED_SVG_PATH_COMMANDS = set("MmLlHhVvZz")
TOKEN_PATTERN = re.compile(
    r"[AaCcHhLlMmQqSsTtVvZz]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?",
)


class SvgPathError(ValueError):
    """Raised when the local SVG uses path commands this script does not draw."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Atlas world textures.")
    parser.add_argument(
        "--gray-earth-zip",
        required=True,
        help="Path to Natural Earth Gray Earth zip.",
    )
    parser.add_argument(
        "--blank-map-svg",
        required=True,
        help="Path to BlankMap Equirectangular SVG.",
    )
    parser.add_argument(
        "--output-dir",
        default=DEFAULT_OUTPUT_DIR,
        help="Output folder for generated PNG files.",
    )
    parser.add_argument(
        "--size",
        type=int,
        default=DEFAULT_TEXTURE_WIDTH,
        choices=(2048, 4096),
        help="Texture width. Height is always half the width.",
    )
    parser.add_argument(
        "--format",
        choices=("png", "webp"),
        default="png",
        help="Output format. PNG keeps the stable 2K fallback names; WebP uses 4K atlas names.",
    )
    parser.add_argument(
        "--webp-quality",
        type=int,
        default=78,
        choices=range(45, 96),
        metavar="[45-95]",
        help="WebP quality used when --format webp.",
    )
    args = parser.parse_args()
    if args.format == "webp" and args.size != 4096:
        parser.error("--format webp is reserved for the 4096px atlas texture set.")

    return args


def read_gray_earth_tif(zip_path: Path) -> tuple[str, Image.Image]:
    with zipfile.ZipFile(zip_path) as archive:
        tif_names = [name for name in archive.namelist() if name.lower().endswith(".tif")]
        if not tif_names:
            raise FileNotFoundError(f"No .tif found inside {zip_path}")

        tif_name = tif_names[0]
        with archive.open(tif_name) as file:
            image = Image.open(io.BytesIO(file.read())).convert("L")

    return tif_name, image


def texture_size(width: int) -> tuple[int, int]:
    return (width, width // 2)


def get_output_paths(output_dir: Path, output_format: str) -> tuple[Path, Path]:
    if output_format == "webp":
        return (
            output_dir / BASE_WEBP_4K_OUTPUT_NAME,
            output_dir / BORDERS_WEBP_4K_OUTPUT_NAME,
        )

    return output_dir / BASE_OUTPUT_NAME, output_dir / BORDERS_OUTPUT_NAME


def save_texture(
    image: Image.Image,
    output_path: Path,
    output_format: str,
    webp_quality: int,
) -> None:
    if output_format == "webp":
        image.save(output_path, format="WEBP", quality=webp_quality, method=6)
        return

    image.save(output_path, format="PNG", optimize=True, compress_level=9)


def generate_base_texture(
    gray_earth_zip: Path,
    output_path: Path,
    target_size: tuple[int, int],
    output_format: str = "png",
    webp_quality: int = 78,
) -> tuple[str, Image.Image]:
    tif_name, source = read_gray_earth_tif(gray_earth_zip)
    resized = source.resize(target_size, Image.Resampling.LANCZOS)
    contrasted = ImageOps.autocontrast(resized, cutoff=0.4)

    relief = np.asarray(contrasted, dtype=np.float32) / 255.0
    relief = np.clip((relief - 0.04) / 0.96, 0.0, 1.0)
    relief = np.power(relief, 0.82)

    shadow = np.array([7, 10, 25], dtype=np.float32)
    mid = np.array([38, 34, 62], dtype=np.float32)
    highlight = np.array([111, 100, 143], dtype=np.float32)

    lower = relief < 0.58
    t_lower = np.clip(relief / 0.58, 0.0, 1.0)[..., None]
    t_upper = np.clip((relief - 0.58) / 0.42, 0.0, 1.0)[..., None]

    rgb = np.where(
        lower[..., None],
        shadow * (1.0 - t_lower) + mid * t_lower,
        mid * (1.0 - t_upper) + highlight * t_upper,
    )

    # Subtle latitude vignette keeps the texture integrated with the dark UI
    # without changing the Natural Earth geography.
    latitude = np.linspace(-1.0, 1.0, target_size[1], dtype=np.float32)[:, None]
    vignette = 1.0 - 0.1 * np.abs(latitude)
    rgb *= vignette[..., None]

    output = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), mode="RGB")
    output = output.quantize(colors=192, method=Image.Quantize.MEDIANCUT).convert("RGB")
    save_texture(output, output_path, output_format, webp_quality)
    return tif_name, output


def parse_svg_path(path_data: str) -> list[list[tuple[float, float]]]:
    commands = {token for token in TOKEN_PATTERN.findall(path_data) if token.isalpha()}
    unsupported = sorted(commands - SUPPORTED_SVG_PATH_COMMANDS)
    if unsupported:
        raise SvgPathError(f"Unsupported SVG path commands: {', '.join(unsupported)}")

    tokens = TOKEN_PATTERN.findall(path_data)
    paths: list[list[tuple[float, float]]] = []
    current_path: list[tuple[float, float]] = []
    current = (0.0, 0.0)
    start = (0.0, 0.0)
    command: str | None = None
    index = 0

    def is_command(token: str) -> bool:
        return bool(token) and token[0].isalpha()

    def read_number() -> float:
        nonlocal index
        if index >= len(tokens) or is_command(tokens[index]):
            raise SvgPathError("Expected SVG path number.")
        value = float(tokens[index])
        index += 1
        return value

    def append_point(point: tuple[float, float]) -> None:
        nonlocal current_path, current
        current = point
        current_path.append(point)

    while index < len(tokens):
        if is_command(tokens[index]):
            command = tokens[index]
            index += 1

        if command is None:
            raise SvgPathError("SVG path data starts without a command.")

        absolute = command.isupper()
        upper = command.upper()

        if upper == "Z":
            if current_path:
                current_path.append(start)
                paths.append(current_path)
                current_path = []
            current = start
            command = None
            continue

        if upper == "M":
            x = read_number()
            y = read_number()
            point = (x, y) if absolute else (current[0] + x, current[1] + y)
            if current_path:
                paths.append(current_path)
            current_path = [point]
            current = point
            start = point
            command = "L" if absolute else "l"
            continue

        if upper == "L":
            while index < len(tokens) and not is_command(tokens[index]):
                x = read_number()
                y = read_number()
                point = (x, y) if absolute else (current[0] + x, current[1] + y)
                append_point(point)
            continue

        if upper == "H":
            while index < len(tokens) and not is_command(tokens[index]):
                x = read_number()
                point = (x, current[1]) if absolute else (current[0] + x, current[1])
                append_point(point)
            continue

        if upper == "V":
            while index < len(tokens) and not is_command(tokens[index]):
                y = read_number()
                point = (current[0], y) if absolute else (current[0], current[1] + y)
                append_point(point)
            continue

        raise SvgPathError(f"Unsupported SVG path command: {command}")

    if current_path:
        paths.append(current_path)

    return paths


def project_lon_lat(lon: float, lat: float, width: int, height: int) -> tuple[int, int]:
    x = int(round((lon + 180.0) / 360.0 * (width - 1)))
    y = int(round((90.0 - lat) / 180.0 * (height - 1)))
    return max(0, min(width - 1, x)), max(0, min(height - 1, y))


def draw_polyline(
    draw: ImageDraw.ImageDraw,
    path: list[tuple[float, float]],
    width: int,
    height: int,
    line_width: int,
) -> None:
    if len(path) < 2:
        return

    segments: list[list[tuple[int, int]]] = []
    current_segment: list[tuple[int, int]] = []
    previous_x: int | None = None

    for lon, lat in path:
        x, y = project_lon_lat(lon, lat, width, height)
        if previous_x is not None and abs(x - previous_x) > width * 0.45:
            if len(current_segment) >= 2:
                segments.append(current_segment)
            current_segment = []
        current_segment.append((x, y))
        previous_x = x

    if len(current_segment) >= 2:
        segments.append(current_segment)

    for segment in segments:
        draw.line(segment, fill=(161, 222, 255, 150), width=line_width, joint="curve")


def iter_svg_path_data(svg_path: Path) -> list[str]:
    tree = ET.parse(svg_path)
    root = tree.getroot()
    return [
        element.attrib["d"]
        for element in root.iter()
        if element.tag.endswith("path") and "d" in element.attrib
    ]


def generate_border_texture(
    blank_map_svg: Path,
    output_path: Path,
    target_size: tuple[int, int],
    output_format: str = "png",
    webp_quality: int = 78,
) -> Image.Image:
    scale = 2
    width = target_size[0] * scale
    height = target_size[1] * scale
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    line_width = 2 if target_size[0] == 2048 else 3

    path_count = 0
    for path_data in iter_svg_path_data(blank_map_svg):
        for path in parse_svg_path(path_data):
            draw_polyline(draw, path, width, height, line_width=line_width)
        path_count += 1

    if path_count == 0:
        raise SvgPathError(f"No SVG paths found in {blank_map_svg}")

    final = image.resize(target_size, Image.Resampling.LANCZOS)
    save_texture(final, output_path, output_format, webp_quality)
    return final


def main() -> None:
    args = parse_args()
    gray_earth_zip = Path(args.gray_earth_zip)
    blank_map_svg = Path(args.blank_map_svg)
    output_dir = Path(args.output_dir)
    target_size = texture_size(args.size)

    if not gray_earth_zip.exists():
        raise FileNotFoundError(gray_earth_zip)
    if not blank_map_svg.exists():
        raise FileNotFoundError(blank_map_svg)

    output_dir.mkdir(parents=True, exist_ok=True)
    base_output, borders_output = get_output_paths(output_dir, args.format)

    tif_name, base = generate_base_texture(
        gray_earth_zip,
        base_output,
        target_size,
        args.format,
        args.webp_quality,
    )
    borders = generate_border_texture(
        blank_map_svg,
        borders_output,
        target_size,
        args.format,
        args.webp_quality,
    )

    print(
        f"Generated {base_output} from {gray_earth_zip}!{tif_name} "
        f"({base.size[0]}x{base.size[1]}, {base_output.stat().st_size} bytes)"
    )
    print(
        f"Generated {borders_output} from {blank_map_svg} "
        f"({borders.size[0]}x{borders.size[1]}, {borders_output.stat().st_size} bytes)"
    )


if __name__ == "__main__":
    main()
