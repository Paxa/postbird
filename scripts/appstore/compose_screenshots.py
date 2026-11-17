#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow>=10"]
# ///
"""Frame the raw captures into 2880x1800 Mac App Store screenshots.

One warm off-white background, a caption above the window, the same margins on
every frame, no device mockups. Reads build/appstore/screenshots/captures/<slug>.png,
writes build/appstore/screenshots/mac/NN-slug.png and copies them to the
Pictures folder used for the other apps.
"""
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
CAPTURES = ROOT / "build/appstore/screenshots/captures"
OUT = ROOT / "build/appstore/screenshots/mac"
COPY_TO = Path.home() / "Pictures/Splitfire AB/Postbird/AppStore/generated/macos"

W, H = 2880, 1800
BG = (247, 243, 236)
INK = (38, 36, 33)
CAPTION_TOP = 120
CAPTION_SIZE = 96
SIDE_MARGIN = 160
BOTTOM_MARGIN = 140
FONT_PATHS = [
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial.ttf",
]

SCENES = [
    ("connect", "Connect to any PostgreSQL server"),
    ("rows", "Browse and edit rows without SQL"),
    ("structure", "Columns, indexes and keys at a glance"),
    ("query", "Write SQL, read results fast"),
    ("json", "Read JSONB cells without squinting"),
]


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for path in FONT_PATHS:
        if Path(path).exists():
            return ImageFont.truetype(path, size, index=1 if path.endswith(".ttc") else 0)
    return ImageFont.load_default()


def compose(slug: str, caption: str, index: int) -> Path:
    shot = Image.open(CAPTURES / f"{slug}.png").convert("RGBA")
    canvas = Image.new("RGBA", (W, H), BG + (255,))
    draw = ImageDraw.Draw(canvas)
    font = load_font(CAPTION_SIZE)
    bbox = draw.textbbox((0, 0), caption, font=font)
    draw.text(((W - (bbox[2] - bbox[0])) // 2 - bbox[0], CAPTION_TOP - bbox[1]), caption, font=font, fill=INK)

    top = CAPTION_TOP + CAPTION_SIZE + 90
    max_h = H - top - BOTTOM_MARGIN
    max_w = W - 2 * SIDE_MARGIN
    scale = min(max_w / shot.width, max_h / shot.height)
    size = (round(shot.width * scale), round(shot.height * scale))
    shot = shot.resize(size, Image.LANCZOS)
    x, y = (W - size[0]) // 2, top

    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((x, y + 24, x + size[0], y + size[1] + 24), radius=28, fill=(0, 0, 0, 70))
    canvas = Image.alpha_composite(canvas, shadow.filter(ImageFilter.GaussianBlur(36)))
    canvas.alpha_composite(shot, (x, y))

    out = OUT / f"{index:02d}-{slug}.png"
    canvas.convert("RGB").save(out)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    COPY_TO.mkdir(parents=True, exist_ok=True)
    for i, (slug, caption) in enumerate(SCENES, start=1):
        out = compose(slug, caption, i)
        shutil.copy2(out, COPY_TO / out.name)
        print(f"wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
