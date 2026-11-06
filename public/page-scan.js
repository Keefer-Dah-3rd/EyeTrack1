// Takes raw measurements of the pages in a session. Scores are worked out from these on
// the results page, so changing a scale there also applies to sessions already saved.
const BOLD_WEIGHT = 600;
const LARGE_TEXT_PX = 24;
const LARGE_BOLD_TEXT_PX = 18.66;
const LARGE_BOLD_WEIGHT = 700;
const AA_CONTRAST = 4.5;
const AA_LARGE_CONTRAST = 3;
const SMALL_TEXT_PX = 14;
const NORMAL_LINE_HEIGHT = 1.2;
const EMPHASIS_SIZE_RATIO = 1.15;
const MIN_SIZE_SHARE = 0.01;
const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'OPTION', 'TEXTAREA']);
const CONTROLS = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [role="tab"], [role="menuitem"]';
const HEADINGS = 'h1, h2, h3, h4, h5, h6, [role="heading"]';
const MEDIA_TAGS = new Set(['IMG', 'PICTURE', 'VIDEO', 'CANVAS']);

// Frames are resized first, so a high-resolution screen doesn't change the numbers.
const PIXEL_SCAN_WIDTH = 1280;
const EDGE_LEVELS = 40;
const EMPTY_BLOCK_PX = 16;
const EMPTY_BLOCK_LEVELS = 8;

// Coarse enough that normal webcam gaze error stays within about one cell.
const GAZE_COLUMNS = 6;
const GAZE_ROWS = 4;

const colorProbe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
const colorCache = new Map();

// The canvas understands every CSS colour format a browser can report.
function readColor(value) {
  if (colorCache.has(value)) return colorCache.get(value);
  colorProbe.clearRect(0, 0, 1, 1);
  colorProbe.fillStyle = value;
  colorProbe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = colorProbe.getImageData(0, 0, 1, 1).data;
  const color = { r, g, b, a: a / 255 };
  colorCache.set(value, color);
  return color;
}

function blend(top, bottom) {
  const mix = (channel) => top[channel] * top.a + bottom[channel] * (1 - top.a);
  return { r: mix('r'), g: mix('g'), b: mix('b'), a: 1 };
}

function luminance({ r, g, b }) {
  const [red, green, blue] = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// Null when the text may sit on an image, since its real background can't be read from styles.
function backgroundBehind(element, styleOf, hasMediaLayer) {
  const layers = [];
  for (let node = element; node; node = node.parentElement) {
    const style = styleOf(node);
    if (style.backgroundImage !== 'none' || hasMediaLayer(node)) return null;
    const color = readColor(style.backgroundColor);
    if (color.a > 0) layers.push(color);
    if (color.a === 1) break;
    if (style.position === 'absolute' || style.position === 'fixed') return null;
  }
  return layers.reduceRight((below, layer) => blend(layer, below), { r: 255, g: 255, b: 255, a: 1 });
}

function headingStats(page, isShown) {
  const levels = [...page.querySelectorAll(HEADINGS)]
    .filter(isShown)
    .map((heading) => Number(heading.getAttribute('aria-level')) || Number(heading.tagName[1]) || 2);
  return {
    total: levels.length,
    topLevel: levels.filter((level) => level === 1).length,
    skips: levels.filter((level, index) => index > 0 && level > levels[index - 1] + 1).length,
  };
}

function scanPageLayout(page) {
  const view = page.defaultView;
  const styles = new Map();
  const styleOf = (element) => {
    if (!styles.has(element)) styles.set(element, view.getComputedStyle(element));
    return styles.get(element);
  };
  const { scrollX, scrollY } = view;
  const isShown = (element) => {
    const { width, height, right, bottom } = element.getBoundingClientRect();
    return width > 1 && height > 1 && right + scrollX > 0 && bottom + scrollY > 0 &&
      element.checkVisibility({ visibilityProperty: true, opacityProperty: true });
  };
  const shownElements = new Map();
  const isShownCached = (element) => {
    if (!shownElements.has(element)) shownElements.set(element, isShown(element));
    return shownElements.get(element);
  };
  // Remembered per element, because every piece of text walks up through the same ancestors.
  const mediaLayers = new Map();
  const hasMediaLayer = (element) => {
    if (!mediaLayers.has(element)) mediaLayers.set(element, [...element.children].some((child) => MEDIA_TAGS.has(child.tagName)));
    return mediaLayers.get(element);
  };
  const backgrounds = new Map();
  const backgroundOf = (element) => {
    if (!backgrounds.has(element)) backgrounds.set(element, backgroundBehind(element, styleOf, hasMediaLayer));
    return backgrounds.get(element);
  };

  const sizes = new Map();
  const totals = { words: 0, chars: 0, small: 0, checked: 0, passing: 0 };
  const range = page.createRange();
  const walker = page.createTreeWalker(page.body, view.NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue.replace(/\s+/g, ' ').trim();
    const parent = node.parentElement;
    if (!text || !parent || SKIPPED_TAGS.has(parent.tagName) || !isShownCached(parent)) continue;

    range.selectNodeContents(node);
    const lines = [...range.getClientRects()].filter(({ width, height }) => width > 1 && height > 1);
    if (!lines.length) continue;

    const style = styleOf(parent);
    const size = parseFloat(style.fontSize);
    const weight = Number(style.fontWeight) || 400;
    const chars = text.replace(/\s/g, '').length;
    totals.chars += chars;
    totals.words += text.split(' ').length;
    if (size < SMALL_TEXT_PX) totals.small += chars;

    const key = Math.round(size);
    const entry = sizes.get(key) || { chars: 0, bold: 0, wrappedChars: 0, lineLength: 0, lineSpacing: 0 };
    entry.chars += chars;
    if (weight >= BOLD_WEIGHT) entry.bold += chars;
    sizes.set(key, entry);

    const background = backgroundOf(parent);
    if (background) {
      const color = readColor(style.color);
      const large = size >= LARGE_TEXT_PX || (size >= LARGE_BOLD_TEXT_PX && weight >= LARGE_BOLD_WEIGHT);
      totals.checked += chars;
      if (contrastRatio(blend(color, background), background) >= (large ? AA_LARGE_CONTRAST : AA_CONTRAST)) totals.passing += chars;
    }

    // Only wrapped text has a line length or line spacing worth judging.
    const lineTops = new Set(lines.map(({ top }) => Math.round(top)));
    if (lineTops.size > 1) {
      const widest = Math.max(...lines.map(({ width }) => width));
      const totalWidth = lines.reduce((sum, { width }) => sum + width, 0);
      const lineHeight = parseFloat(style.lineHeight);
      entry.wrappedChars += chars;
      entry.lineLength += chars * text.length * (widest / totalWidth);
      entry.lineSpacing += chars * (Number.isNaN(lineHeight) ? NORMAL_LINE_HEIGHT : lineHeight / size);
    }
  }

  const screens = Math.max(1, page.documentElement.scrollHeight / view.innerHeight);
  const controls = [...page.querySelectorAll(CONTROLS)].filter(isShown).length;
  const sizeList = [...sizes.entries()];
  const bodySize = sizeList.length ? sizeList.reduce((best, item) => (item[1].chars > best[1].chars ? item : best))[0] : null;
  const emphasised = sizeList.reduce((sum, [size, { chars, bold }]) => sum + (size >= bodySize * EMPHASIS_SIZE_RATIO ? chars : bold), 0);
  const shareOf = (part, whole) => (whole ? part / whole : null);
  // Headlines are meant to be set tight, so line measures only look at text the size of the body.
  const bodyText = sizeList.filter(([size]) => size < bodySize * EMPHASIS_SIZE_RATIO).map(([, entry]) => entry);
  const sumOf = (key) => bodyText.reduce((sum, entry) => sum + entry[key], 0);

  return {
    screens,
    words: totals.words,
    wordsPerScreen: totals.words / screens,
    controlsPerScreen: controls / screens,
    contrastPassing: shareOf(totals.passing, totals.checked),
    contrastChecked: shareOf(totals.checked, totals.chars),
    smallText: shareOf(totals.small, totals.chars),
    lineLength: shareOf(sumOf('lineLength'), sumOf('wrappedChars')),
    lineSpacing: shareOf(sumOf('lineSpacing'), sumOf('wrappedChars')),
    sizeRatio: bodySize ? Math.max(...sizes.keys()) / bodySize : null,
    sizesInUse: sizeList.filter(([, { chars }]) => chars / totals.chars >= MIN_SIZE_SHARE).length,
    emphasised: shareOf(emphasised, totals.chars),
    headings: headingStats(page, isShown),
  };
}

function scanFramePixels(frame) {
  const scale = PIXEL_SCAN_WIDTH / frame.width;
  const width = PIXEL_SCAN_WIDTH;
  const height = Math.max(1, Math.round(frame.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(frame, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  const levels = new Float32Array(width * height);
  for (let i = 0; i < levels.length; i += 1) {
    levels[i] = data[i * 4] * 0.3 + data[i * 4 + 1] * 0.59 + data[i * 4 + 2] * 0.11;
  }

  let edges = 0;
  for (let y = 0; y < height - 1; y += 1) {
    for (let x = 0; x < width - 1; x += 1) {
      const here = levels[y * width + x];
      if (Math.abs(levels[y * width + x + 1] - here) + Math.abs(levels[(y + 1) * width + x] - here) > EDGE_LEVELS) edges += 1;
    }
  }

  let blocks = 0;
  let emptyBlocks = 0;
  for (let top = 0; top + EMPTY_BLOCK_PX <= height; top += EMPTY_BLOCK_PX) {
    for (let left = 0; left + EMPTY_BLOCK_PX <= width; left += EMPTY_BLOCK_PX) {
      let lowest = 255;
      let highest = 0;
      for (let y = top; y < top + EMPTY_BLOCK_PX; y += 1) {
        for (let x = left; x < left + EMPTY_BLOCK_PX; x += 1) {
          const level = levels[y * width + x];
          if (level < lowest) lowest = level;
          if (level > highest) highest = level;
        }
      }
      blocks += 1;
      if (highest - lowest < EMPTY_BLOCK_LEVELS) emptyBlocks += 1;
    }
  }

  return { edges: edges / ((width - 1) * (height - 1)), empty: blocks ? emptyBlocks / blocks : 0 };
}

// 0 when gaze is spread evenly over the screen, and nearer 1 the more it gathers in a few places.
function gazeFocus(samples, area) {
  const cells = new Float64Array(GAZE_COLUMNS * GAZE_ROWS);
  let totalMs = 0;
  for (const { x, y, ms } of samples) {
    const column = Math.min(GAZE_COLUMNS - 1, Math.floor((x / area.width) * GAZE_COLUMNS));
    const row = Math.min(GAZE_ROWS - 1, Math.floor((y / area.height) * GAZE_ROWS));
    cells[row * GAZE_COLUMNS + column] += ms;
    totalMs += ms;
  }
  if (!totalMs) return { ms: 0, focus: null };
  let entropy = 0;
  for (const ms of cells) {
    if (ms) entropy -= (ms / totalMs) * Math.log(ms / totalMs);
  }
  return { ms: Math.round(totalMs), focus: 1 - entropy / Math.log(cells.length) };
}

function averagePixels(scans) {
  if (!scans.length) return null;
  const mean = (key) => scans.reduce((sum, scan) => sum + scan[key], 0) / scans.length;
  return { edges: mean('edges'), empty: mean('empty') };
}

// Pages this tool can look inside are matched by address. A site on another address only
// gives its captured screens, which can't be matched between sessions.
function buildPageScans({ layouts, samples, screens, area }) {
  const SESSION_KEY = 'session';
  const screenKey = (index) => `screen-${index}`;
  const groups = new Map();
  const groupFor = (key) => {
    if (!groups.has(key)) groups.set(key, { layout: null, frames: [], samples: [] });
    return groups.get(key);
  };

  for (const [key, layout] of layouts) groupFor(key).layout = layout;
  screens.forEach((screen, index) => groupFor(screen.page || screenKey(index)).frames.push(screen.frame));
  for (const sample of samples) {
    const key = sample.page || (sample.screen === null ? SESSION_KEY : screenKey(sample.screen));
    groupFor(key).samples.push(sample);
  }
  if (groups.size > 1) groups.delete(SESSION_KEY);

  return [...groups].map(([key, group]) => {
    const isPage = key.startsWith('/');
    const label = isPage ? key : (key === SESSION_KEY ? 'Whole session' : `Screen ${Number(key.split('-')[1]) + 1}`);
    return {
      key,
      label,
      isPage,
      layout: group.layout,
      pixels: averagePixels(group.frames.map(scanFramePixels)),
      gaze: gazeFocus(group.samples, area),
    };
  });
}
