export interface SparklinePoint {
  value: number;
  label?: string;
}

export class Sparkline {
  static renderSvg(
    data: number[],
    options: {
      width?: number;
      height?: number;
      strokeColor?: string;
      fillColor?: string;
      unit?: string;
      minPoints?: number;
    } = {}
  ): string {
    const width = options.width || 420;
    const height = options.height || 64;
    const strokeColor = options.strokeColor || '#007aff';
    const fillColor = options.fillColor || 'rgba(0, 122, 255, 0.15)';
    const unit = options.unit || '';
    const minPoints = options.minPoints || 30;

    // Pad array with zeros on the left if fewer than minPoints
    const points = [...data];
    while (points.length < minPoints) {
      points.unshift(0);
    }

    const maxVal = Math.max(...points, 1);
    const minVal = 0;
    const range = maxVal - minVal || 1;

    const padTop = 10;
    const padBottom = 12;
    const usableHeight = height - padTop - padBottom;
    const stepX = width / (points.length - 1);

    const coords = points.map((val, idx) => {
      const x = idx * stepX;
      const y = height - padBottom - ((val - minVal) / range) * usableHeight;
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    });

    // Build SVG path
    let linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      // Smooth cubic curve using midpoint control
      const prev = coords[i - 1];
      const curr = coords[i];
      const cpX = (prev.x + curr.x) / 2;
      linePath += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const areaPath = `${linePath} L ${width} ${height - padBottom} L 0 ${height - padBottom} Z`;

    const currentVal = points[points.length - 1] || 0;
    const lastCoord = coords[coords.length - 1];

    const gradId = 'grad-' + strokeColor.replace(/[^a-zA-Z0-9]/g, '');

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="macos-sparkline-svg" width="100%" height="${height}">
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.32" />
            <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.02" />
          </linearGradient>
        </defs>

        <!-- Baseline -->
        <line x1="0" y1="${height - padBottom}" x2="${width}" y2="${height - padBottom}" stroke="#e0e0e0" stroke-width="1" class="chart-baseline" />

        <!-- Area fill -->
        <path d="${areaPath}" fill="url(#${gradId})" />

        <!-- Stroke line -->
        <path d="${linePath}" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" />

        <!-- Current point marker -->
        <circle cx="${lastCoord.x}" cy="${lastCoord.y}" r="3" fill="${strokeColor}" stroke="#ffffff" stroke-width="1.5" />

        <!-- Peak and Current Text -->
        <text x="4" y="${padTop + 2}" font-size="9" fill="#8e8e93" font-family="-apple-system, sans-serif">Peak: ${maxVal}${unit}</text>
        <text x="${width - 4}" y="${padTop + 2}" text-anchor="end" font-size="10" font-weight="600" fill="${strokeColor}" font-family="-apple-system, sans-serif">${currentVal}${unit}</text>
      </svg>
    `;

    return svg;
  }
}

// Add simple hashCode if not present
if (!(String.prototype as any).hashCode) {
  (String.prototype as any).hashCode = function() {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
      hash = ((hash << 5) - hash) + this.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  };
}

(global as any).Sparkline = Sparkline;
