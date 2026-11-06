// Draws timed gaze samples over a captured screen and returns it as a canvas.
//
// Colours use fixed time bands rather than scaling to each image's hottest spot,
// so the same colour means the same amount of looking on every screen and session.
const HEAT_BANDS = [
  { min: 0.15, label: 'Under 0.5s', rgb: [44, 105, 230], alpha: 0.34 },
  { min: 0.5, label: '0.5-1s', rgb: [20, 175, 195], alpha: 0.4 },
  { min: 1, label: '1-2s', rgb: [55, 185, 85], alpha: 0.46 },
  { min: 2, label: '2-4s', rgb: [250, 215, 50], alpha: 0.54 },
  { min: 4, label: '4-8s', rgb: [245, 135, 30], alpha: 0.62 },
  { min: 8, label: '8s or more', rgb: [220, 40, 30], alpha: 0.7 },
];
const HEAT_CELL_PX = 2;
const HEAT_MAX_IMAGE_WIDTH = 2000;
const HEAT_MIN_SPREAD_PX = 30;
const HEAT_MAX_SPREAD_PX = 220;
// Up and down is the weakest direction for webcam gaze, so blobs are taller than they are wide.
const HEAT_VERTICAL_STRETCH = 1.6;
// A jump longer than this is the cursor leaving and coming back, so the trail shouldn't join it.
const TRAIL_MAX_GAP_MS = 500;
const HEAT_MAX_LABELS = 5;
const HEAT_MIN_LABEL_SECONDS = 0.5;
const HEAT_FONT = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const OVERVIEW_CELL_WIDTH = 1000;
const OVERVIEW_GAP = 24;
const OVERVIEW_HEADER = 84;
const CANVAS_MAX_SIDE = 16000;

// Each sample is weighted by how long it lasted, since the tracker's update rate varies.
// A blob's centre reads as seconds, and its width matches the measured tracking error,
// so the map can't look sharper than the data behind it.
function gazeDensity(samples, width, height, errorPx) {
  const cols = Math.max(1, Math.ceil(width / HEAT_CELL_PX));
  const rows = Math.max(1, Math.ceil(height / HEAT_CELL_PX));
  const seconds = new Float32Array(cols * rows);
  for (const { x, y, ms } of samples) {
    const col = Math.floor(x / HEAT_CELL_PX);
    const row = Math.floor(y / HEAT_CELL_PX);
    if (col >= 0 && row >= 0 && col < cols && row < rows) seconds[row * cols + col] += ms / 1000;
  }

  const spreadPx = Math.min(Math.max(errorPx || HEAT_MIN_SPREAD_PX, HEAT_MIN_SPREAD_PX), HEAT_MAX_SPREAD_PX);
  const makeKernel = (sigma) => {
    const reach = Math.ceil(sigma * 3);
    return { reach, weights: Array.from({ length: reach * 2 + 1 }, (_, i) => Math.exp(-((i - reach) ** 2) / (2 * sigma * sigma))) };
  };
  const wide = makeKernel(spreadPx / HEAT_CELL_PX);
  const tall = makeKernel((spreadPx * HEAT_VERTICAL_STRETCH) / HEAT_CELL_PX);

  const across = new Float32Array(cols * rows);
  const density = new Float32Array(cols * rows);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const value = seconds[row * cols + col];
      if (!value) continue;
      for (let i = Math.max(0, col - wide.reach); i <= Math.min(cols - 1, col + wide.reach); i += 1) {
        across[row * cols + i] += value * wide.weights[i - col + wide.reach];
      }
    }
  }
  for (let col = 0; col < cols; col += 1) {
    for (let row = 0; row < rows; row += 1) {
      const value = across[row * cols + col];
      if (!value) continue;
      for (let i = Math.max(0, row - tall.reach); i <= Math.min(rows - 1, row + tall.reach); i += 1) {
        density[i * cols + col] += value * tall.weights[i - row + tall.reach];
      }
    }
  }
  return { density, cols, rows, spreadPx };
}

function heatBandFor(value) {
  for (let i = HEAT_BANDS.length - 1; i >= 0; i -= 1) {
    if (value >= HEAT_BANDS[i].min) return HEAT_BANDS[i];
  }
  return null;
}

function drawDensityBands(context, { density, cols, rows }, outWidth, outHeight) {
  const layer = document.createElement('canvas');
  layer.width = cols;
  layer.height = rows;
  const layerContext = layer.getContext('2d');
  const image = layerContext.createImageData(cols, rows);
  for (let i = 0; i < density.length; i += 1) {
    const band = heatBandFor(density[i]);
    if (!band) continue;
    image.data[i * 4] = band.rgb[0];
    image.data[i * 4 + 1] = band.rgb[1];
    image.data[i * 4 + 2] = band.rgb[2];
    image.data[i * 4 + 3] = Math.round(band.alpha * 255);
  }
  layerContext.putImageData(image, 0, 0);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(layer, 0, 0, outWidth, outHeight);
}

function isDensityPeak(density, cols, rows, index) {
  const col = index % cols;
  const row = Math.floor(index / cols);
  for (let y = Math.max(0, row - 1); y <= Math.min(rows - 1, row + 1); y += 1) {
    for (let x = Math.max(0, col - 1); x <= Math.min(cols - 1, col + 1); x += 1) {
      if (density[y * cols + x] > density[index]) return false;
    }
  }
  return true;
}

// The longest-looked-at spots, kept far enough apart that their labels don't overlap.
// Only true peaks qualify, so a label never lands on the slope between two blobs.
function findHotspots({ density, cols, rows, spreadPx }) {
  const minimumGap = (spreadPx * 2.5) / HEAT_CELL_PX;
  const candidates = [];
  for (let i = 0; i < density.length; i += 1) {
    if (density[i] >= HEAT_MIN_LABEL_SECONDS && isDensityPeak(density, cols, rows, i)) candidates.push(i);
  }
  candidates.sort((a, b) => density[b] - density[a]);

  const spots = [];
  for (const index of candidates) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    if (spots.every((spot) => Math.hypot(spot.col - col, spot.row - row) >= minimumGap)) {
      spots.push({ col, row, seconds: density[index] });
      if (spots.length === HEAT_MAX_LABELS) break;
    }
  }
  return spots.map(({ col, row, seconds }) => ({ xRatio: col / cols, yRatio: row / rows, seconds }));
}

function drawHotspotLabel(context, x, y, text, unit) {
  context.font = `600 ${13 * unit}px ${HEAT_FONT}`;
  const width = context.measureText(text).width + 14 * unit;
  const height = 22 * unit;
  const left = Math.min(Math.max(x - width / 2, 0), context.canvas.width - width);
  const top = Math.max(y - height / 2, 0);
  context.fillStyle = 'rgba(20, 21, 23, 0.86)';
  context.beginPath();
  context.roundRect(left, top, width, height, height / 2);
  context.fill();
  context.fillStyle = '#ffffff';
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.fillText(text, left + width / 2, top + height / 2 + unit / 2);
  context.textAlign = 'left';
}

// The exact part: where the cursor went, and each click numbered in order.
function drawInteractions(context, cursor, clicks, scale, unit) {
  context.lineCap = 'round';
  context.lineJoin = 'round';
  for (const [style, lineWidth] of [['rgba(20, 21, 23, 0.55)', 4 * unit], ['rgba(255, 255, 255, 0.95)', 2 * unit]]) {
    context.strokeStyle = style;
    context.lineWidth = lineWidth;
    context.beginPath();
    cursor.forEach((point, index) => {
      const joined = index > 0 && point.t - cursor[index - 1].t <= TRAIL_MAX_GAP_MS;
      if (joined) context.lineTo(point.x * scale, point.y * scale);
      else context.moveTo(point.x * scale, point.y * scale);
    });
    context.stroke();
  }

  clicks.forEach((click, index) => {
    const radius = 12 * unit;
    context.beginPath();
    context.arc(click.x * scale, click.y * scale, radius, 0, Math.PI * 2);
    context.fillStyle = '#141517';
    context.fill();
    context.lineWidth = 2 * unit;
    context.strokeStyle = '#ffffff';
    context.stroke();
    context.fillStyle = '#ffffff';
    context.font = `700 ${12 * unit}px ${HEAT_FONT}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(String(index + 1), click.x * scale, click.y * scale + unit / 2);
    context.textAlign = 'left';
  });
}

function drawHeatFooter(context, top, width, unit, caption) {
  const footerHeight = 72 * unit;
  const pad = 16 * unit;
  context.fillStyle = '#ffffff';
  context.fillRect(0, top, width, footerHeight);
  context.textBaseline = 'middle';
  context.textAlign = 'left';

  context.fillStyle = '#1c1d1f';
  context.font = `600 ${15 * unit}px ${HEAT_FONT}`;
  context.fillText(caption, pad, top + 22 * unit);

  context.fillStyle = '#62656b';
  context.font = `${12 * unit}px ${HEAT_FONT}`;
  const interactionsKey = 'White line: mouse path. Numbers: clicks, in order.';
  context.fillText(interactionsKey, width - pad - context.measureText(interactionsKey).width, top + 22 * unit);

  context.font = `${12 * unit}px ${HEAT_FONT}`;
  const legendY = top + 52 * unit;
  let x = pad;
  context.fillStyle = '#62656b';
  const legendTitle = 'Rough time looking near each area:';
  context.fillText(legendTitle, x, legendY);
  x += context.measureText(legendTitle).width + 12 * unit;
  for (const band of HEAT_BANDS) {
    context.fillStyle = `rgb(${band.rgb.join(' ')})`;
    context.fillRect(x, legendY - 7 * unit, 14 * unit, 14 * unit);
    x += 18 * unit;
    context.fillStyle = '#1c1d1f';
    context.fillText(band.label, x, legendY);
    x += context.measureText(band.label).width + 12 * unit;
  }
}

function heatFooterHeight(unit) {
  return 72 * unit;
}

// frame: the captured screen. width/height: its size in page pixels, which samples use.
function renderHeatScreen({ frame, width, height, samples, errorPx, cursor, clicks, caption }) {
  const outWidth = Math.min(frame.width, HEAT_MAX_IMAGE_WIDTH);
  const scale = outWidth / frame.width;
  const outHeight = Math.round(frame.height * scale);
  // Text sizes follow the frame's resolution, so the legend reads the same on any display.
  const unit = Math.max(outWidth / width, 1);

  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight + Math.ceil(heatFooterHeight(unit));
  const context = canvas.getContext('2d');
  context.drawImage(frame, 0, 0, outWidth, outHeight);

  const densityMap = gazeDensity(samples, width, height, errorPx);
  drawDensityBands(context, densityMap, outWidth, outHeight);
  for (const spot of findHotspots(densityMap)) {
    drawHotspotLabel(context, spot.xRatio * outWidth, spot.yRatio * outHeight, `${spot.seconds.toFixed(1)}s`, unit);
  }
  drawInteractions(context, cursor || [], clicks || [], outWidth / width, unit);
  drawHeatFooter(context, outHeight, outWidth, unit, caption);
  return canvas;
}

// One PNG holding every screen, in the order they were first seen.
function renderHeatOverview(cards, title, subtitle) {
  const columns = cards.length === 1 ? 1 : cards.length <= 4 ? 2 : cards.length <= 9 ? 3 : 4;
  const rowHeights = [];
  cards.forEach((card, index) => {
    const row = Math.floor(index / columns);
    const scaledHeight = card.height * (OVERVIEW_CELL_WIDTH / card.width);
    rowHeights[row] = Math.max(rowHeights[row] || 0, scaledHeight);
  });

  const fullWidth = OVERVIEW_GAP * (columns + 1) + OVERVIEW_CELL_WIDTH * columns;
  const fullHeight = OVERVIEW_HEADER + rowHeights.reduce((sum, h) => sum + h + OVERVIEW_GAP, 0);
  const fit = Math.min(1, CANVAS_MAX_SIDE / fullHeight);

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(fullWidth * fit);
  canvas.height = Math.ceil(fullHeight * fit);
  const context = canvas.getContext('2d');
  context.scale(fit, fit);
  context.fillStyle = '#f3f3f1';
  context.fillRect(0, 0, fullWidth, fullHeight);

  context.textBaseline = 'middle';
  context.fillStyle = '#1c1d1f';
  context.font = `700 26px ${HEAT_FONT}`;
  context.fillText(title, OVERVIEW_GAP, 30);
  context.fillStyle = '#62656b';
  context.font = `15px ${HEAT_FONT}`;
  context.fillText(subtitle, OVERVIEW_GAP, 60);

  let y = OVERVIEW_HEADER;
  rowHeights.forEach((rowHeight, row) => {
    cards.slice(row * columns, (row + 1) * columns).forEach((card, column) => {
      const x = OVERVIEW_GAP + column * (OVERVIEW_CELL_WIDTH + OVERVIEW_GAP);
      context.drawImage(card, x, y, OVERVIEW_CELL_WIDTH, card.height * (OVERVIEW_CELL_WIDTH / card.width));
    });
    y += rowHeight + OVERVIEW_GAP;
  });
  return canvas;
}

function canvasToPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The PNG could not be created.'))), 'image/png');
  });
}
