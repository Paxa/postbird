import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import math
import os

# 1. Load original icon and extract elephant
orig = Image.open('build_files/icon.png').convert('RGBA')
orig_arr = np.array(orig)

# In original icon, the background circle is light grey/white (~240-255).
# The elephant is blue: R < 80, G < 100, B > 100.
# The eye, ear slit, and tusk are white details inside the elephant.

# Let's find the bounding box of the elephant
r, g, b, a = orig_arr[:,:,0], orig_arr[:,:,1], orig_arr[:,:,2], orig_arr[:,:,3]
is_elephant_blue = (b > 100) & (r < 80) & (g < 100) & (a > 180)
y_idx, x_idx = np.where(is_elephant_blue)

min_x, max_x = x_idx.min() - 2, x_idx.max() + 2
min_y, max_y = y_idx.min() - 2, y_idx.max() + 2

# Crop the elephant region
cropped = orig.crop((min_x, min_y, max_x + 1, max_y + 1))

# Create clean mask of elephant
# Outer background in cropped is off-white (r>200, g>200, b>200)
cropped_arr = np.array(cropped)
cr, cg, cb, ca = cropped_arr[:,:,0], cropped_arr[:,:,1], cropped_arr[:,:,2], cropped_arr[:,:,3]

# Pixels that are part of the elephant (either blue body or white details inside body)
# Flood fill background from corners to find outside
from collections import deque
h, w = cropped_arr.shape[:2]
is_bg = np.zeros((h, w), dtype=bool)
# Start flood fill from borders where pixels are not dark blue
queue = deque()
for y in range(h):
    for x in [0, w-1]:
        if not is_elephant_blue[min_y + y, min_x + x]:
            queue.append((y, x))
            is_bg[y, x] = True
for x in range(w):
    for y in [0, h-1]:
        if not is_bg[y, x] and not is_elephant_blue[min_y + y, min_x + x]:
            queue.append((y, x))
            is_bg[y, x] = True

while queue:
    cy, cx = queue.popleft()
    for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
        ny, nx = cy + dy, cx + dx
        if 0 <= ny < h and 0 <= nx < w and not is_bg[ny, nx]:
            # If not blue elephant pixel and color is bright (plate background)
            if not is_elephant_blue[min_y + ny, min_x + nx] and cr[ny, nx] > 180 and cg[ny, nx] > 180 and cb[ny, nx] > 180:
                is_bg[ny, nx] = True
                queue.append((ny, nx))

# Now elephant alpha mask is ~is_bg
elephant_alpha = (~is_bg).astype(np.uint8) * 255
elephant_img = Image.fromarray(elephant_alpha, mode='L')
# Smooth edges slightly
elephant_img = elephant_img.filter(ImageFilter.GaussianBlur(radius=0.5))

# Also extract the white details (ear line, eye dot, tusk)
is_detail = (~is_bg) & (~is_elephant_blue[min_y:max_y+1, min_x:max_x+1]) & (cr > 170) & (cg > 170)
detail_mask = is_detail.astype(np.uint8) * 255
detail_img = Image.fromarray(detail_mask, mode='L')

print(f"Extracted elephant: {w}x{h}")

# Function to create macOS squircle mask
def create_squircle_mask(size, corner_radius, exponent=4.2):
    mask = Image.new('L', (size, size), 0)
    arr = np.zeros((size, size), dtype=np.float32)
    center = size / 2.0
    half_w = size / 2.0
    
    # Superellipse formula: |(x-c)/a|^n + |(y-c)/b|^n <= 1
    # For standard macOS squircle, n is approximately 4.0 to 4.5
    y, x = np.ogrid[:size, :size]
    nx = np.abs((x - center) / (half_w - 2)) ** exponent
    ny = np.abs((y - center) / (half_w - 2)) ** exponent
    inside = (nx + ny) <= 1.0
    
    mask_arr = (inside * 255).astype(np.uint8)
    mask = Image.fromarray(mask_arr, mode='L')
    # Antialias
    mask = mask.filter(ImageFilter.GaussianBlur(radius=1.2))
    return mask

# Function to create linear gradient
def create_gradient(size, c1, c2, c3=None, angle=45):
    # c1, c2, c3 are (R, G, B)
    rad = math.radians(angle)
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)
    
    y, x = np.ogrid[:size, :size]
    # Projected distance along angle
    proj = (x * cos_a + y * sin_a)
    p_min, p_max = proj.min(), proj.max()
    t = (proj - p_min) / (p_max - p_min)
    
    arr = np.zeros((size, size, 3), dtype=np.uint8)
    if c3 is None:
        for ch in range(3):
            arr[:, :, ch] = np.clip(c1[ch] * (1 - t) + c2[ch] * t, 0, 255).astype(np.uint8)
    else:
        # 3 stops: 0.0 -> c1, 0.5 -> c2, 1.0 -> c3
        mask1 = t <= 0.5
        t1 = t * 2.0
        mask2 = t > 0.5
        t2 = (t - 0.5) * 2.0
        for ch in range(3):
            ch_arr = np.zeros((size, size), dtype=np.float32)
            ch_arr[mask1] = c1[ch] * (1 - t1[mask1]) + c2[ch] * t1[mask1]
            ch_arr[mask2] = c2[ch] * (1 - t2[mask2]) + c3[ch] * t2[mask2]
            arr[:, :, ch] = np.clip(ch_arr, 0, 255).astype(np.uint8)
            
    return Image.fromarray(arr, mode='RGB').convert('RGBA')

# Target resolution: 1024x1024
CANVAS_SIZE = 1024
# macOS standard icon size inside 1024 canvas is 824x824 (padding = 100 on each side)
SQUIRCLE_SIZE = 824
OFFSET = (CANVAS_SIZE - SQUIRCLE_SIZE) // 2

squircle_mask = create_squircle_mask(SQUIRCLE_SIZE, 185)

# Gradient palettes to experiment with:
# "pinkish purple light-blue"
PALETTES = [
    {
        "name": "vibrant_pink_purple_cyan",
        # Top-left: vibrant pink (#FF5E97), Mid: purple (#8A42FF), Bottom-right: sky blue / cyan (#00D2FF)
        "c1": (255, 94, 151),
        "c2": (138, 66, 255),
        "c3": (0, 210, 255),
        "angle": 45,
        "elephant_color": (25, 60, 150), # classic rich sapphire/royal blue
        "elephant_mode": "solid_white_details"
    },
    {
        "name": "soft_pastel_sunset",
        # Top-left: soft pink-rose (#F472B6), Mid: lavender-violet (#A78BFA), Bottom-right: light sky blue (#38BDF8)
        "c1": (244, 114, 182),
        "c2": (167, 139, 250),
        "c3": (56, 189, 248),
        "angle": 55,
        "elephant_color": (24, 72, 175), # vibrant royal blue
        "elephant_mode": "solid_white_details"
    },
    {
        "name": "electric_magenta_indigo_cyan",
        # Top-left: magenta/pink (#E056FD), Mid: deep indigo (#686de0), Bottom-right: ice cyan (#48dbfb)
        "c1": (224, 86, 253),
        "c2": (104, 109, 224),
        "c3": (72, 219, 251),
        "angle": 40,
        "elephant_color": (15, 45, 125), # deep navy
        "elephant_mode": "solid_white_details"
    },
    {
        "name": "white_elephant_on_gradient",
        # Vibrant pink-purple-blue gradient with clean crisp WHITE elephant and subtle shadow
        "c1": (255, 110, 180),
        "c2": (140, 70, 255),
        "c3": (0, 215, 255),
        "angle": 45,
        "elephant_color": (255, 255, 255),
        "elephant_mode": "white_silhouette"
    }
]

os.makedirs('build_files/icon_options', exist_ok=True)

# Desired elephant scale: Make it BIGGER inside squircle!
# Previously elephant was ~194px in a 256px circle (nested in a squircle = only ~45% of squircle).
# In our new design, elephant width should be ~620px (75% of 824px squircle)!
TARGET_ELEPHANT_WIDTH = 620
scale_factor = TARGET_ELEPHANT_WIDTH / w
target_w = int(w * scale_factor)
target_h = int(h * scale_factor)

# High quality upsampling of the elephant alpha and details
elephant_alpha_large = elephant_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
detail_mask_large = detail_img.resize((target_w, target_h), Image.Resampling.LANCZOS)

for pal in PALETTES:
    canvas = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    
    # 1. Base gradient squircle
    grad = create_gradient(SQUIRCLE_SIZE, pal["c1"], pal["c2"], pal["c3"], pal["angle"])
    
    # Add subtle inner border / lighting highlight
    draw = ImageDraw.Draw(grad)
    
    # Apply squircle mask to gradient
    squircle = Image.new('RGBA', (SQUIRCLE_SIZE, SQUIRCLE_SIZE), (0, 0, 0, 0))
    squircle.paste(grad, (0, 0), mask=squircle_mask)
    
    # 2. Add macOS drop shadow for squircle
    shadow_mask = squircle_mask.filter(ImageFilter.GaussianBlur(radius=18))
    shadow = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    shadow_color = Image.new('RGBA', (SQUIRCLE_SIZE, SQUIRCLE_SIZE), (0, 0, 0, 95))
    shadow.paste(shadow_color, (OFFSET, OFFSET + 24), mask=shadow_mask)
    
    # Paste squircle onto canvas over shadow
    canvas.alpha_composite(shadow)
    canvas.paste(squircle, (OFFSET, OFFSET), mask=squircle_mask)
    
    # 3. Render Elephant
    # Position centered inside squircle
    ele_x = OFFSET + (SQUIRCLE_SIZE - target_w) // 2 + 5
    ele_y = OFFSET + (SQUIRCLE_SIZE - target_h) // 2
    
    # Create elephant shadow on background
    ele_shadow_mask = elephant_alpha_large.filter(ImageFilter.GaussianBlur(radius=12))
    ele_shadow = Image.new('RGBA', (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    ele_shadow_color = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 80))
    ele_shadow.paste(ele_shadow_color, (ele_x, ele_y + 12), mask=ele_shadow_mask)
    canvas.alpha_composite(ele_shadow)
    
    # Create elephant body
    ele_body = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
    body_color = Image.new('RGBA', (target_w, target_h), (*pal["elephant_color"], 255))
    ele_body.paste(body_color, (0, 0), mask=elephant_alpha_large)
    
    # Details (ear line, eye dot, tusk)
    if pal["elephant_mode"] == "solid_white_details":
        # White details
        details_color = Image.new('RGBA', (target_w, target_h), (255, 255, 255, 245))
        ele_body.paste(details_color, (0, 0), mask=detail_mask_large)
    elif pal["elephant_mode"] == "white_silhouette":
        # Eye and ear line in subtle dark/gradient
        details_color = Image.new('RGBA', (target_w, target_h), (*pal["c2"], 220))
        ele_body.paste(details_color, (0, 0), mask=detail_mask_large)
        
    canvas.paste(ele_body, (ele_x, ele_y), mask=elephant_alpha_large)
    
    out_path = f"build_files/icon_options/{pal['name']}.png"
    canvas.save(out_path, format="PNG")
    print(f"Generated: {out_path}")

print("All variations generated successfully!")
