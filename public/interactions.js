// Mouse, clicks and scrolling on the page being tested, as reported by frame-tracker.js.
// Unlike webcam gaze these are exact, though they show what the cursor did, not the eyes.
const CURSOR_TICK_MS = 100;
// A resting cursor says nothing about attention, so it stops counting after this long.
const CURSOR_IDLE_MS = 2000;
const MAX_CURSOR_POINTS = 60000;

// Gaze counts as near text within this distance. Further up and down, because that's its weakest direction.
const TEXT_NEAR_ACROSS_PX = 60;
const TEXT_NEAR_DOWN_PX = 100;
const TEXT_DOWN_WEIGHT = 1.6;
const DEFAULT_LINE_WIDTH_PX = 500;
const TEXT_BLOCKS_STALE_MS = 2500;
const TEXT_VISIBLE_SHARE = 0.5;
// A typical adult reading pace, to judge whether there was time to read something.
const READ_WORDS_PER_SECOND = 4.2;
const LIKELY_READ_MIN_MS = 1500;
const LIKELY_READ_MIN_LINES = 2;
const LOOKED_NEAR_MIN_MS = 800;
const LOOKED_NEAR_SHARE = 0.25;
const LOOKED_NEAR_MAX_MS = 3000;
const ON_SCREEN_MIN_MS = 1000;

const interactions = {
  connected: false,
  cursor: null,
  clicks: [],
  path: [],
  scroll: new Map(),
  regionMs: new Map(),
  text: new Map(),
  blocks: [],
  blocksPage: '',
  blocksAt: 0,
  reading: null,
};

function textKey(page, id) {
  return `${page}#${id}`;
}

function registerTextBlocks(page, blocks) {
  for (const { id, label, words } of blocks) {
    const key = textKey(page, id);
    if (!interactions.text.has(key)) interactions.text.set(key, { page, label, words, visibleMs: 0, nearMs: 0, readingMs: 0, lines: 0 });
  }
}

function currentTextBlocks() {
  return performance.now() - interactions.blocksAt <= TEXT_BLOCKS_STALE_MS ? interactions.blocks : [];
}

function nearestTextBlock(x, y) {
  let best = null;
  let bestDistance = Infinity;
  for (const block of currentTextBlocks()) {
    const across = Math.max(block.x - x, 0, x - (block.x + block.w));
    const down = Math.max(block.y - y, 0, y - (block.y + block.h));
    if (across > TEXT_NEAR_ACROSS_PX || down > TEXT_NEAR_DOWN_PX) continue;
    const distance = across + down / TEXT_DOWN_WEIGHT;
    if (distance < bestDistance) {
      best = block;
      bestDistance = distance;
    }
  }
  return best;
}

// A read line is credited to whichever text the gaze was nearest for most of it.
function creditReadLine(line) {
  const votes = new Map();
  for (const { target } of line.points) {
    if (target) votes.set(target, (votes.get(target) || 0) + 1);
  }
  let winner = null;
  for (const [key, count] of votes) {
    if (!winner || count > votes.get(winner)) winner = key;
  }
  const entry = winner && interactions.text.get(winner);
  if (!entry) return;
  entry.readingMs += line.end - line.start;
  entry.lines += 1;
}

// Called with each gaze reading while recording. rawX is before steadying, which would hide the pattern.
function recordGazeOnText(x, y, rawX, elapsed, now) {
  const block = nearestTextBlock(x, y);
  const key = block ? textKey(interactions.blocksPage, block.id) : null;
  const entry = key && interactions.text.get(key);
  if (entry) entry.nearMs += elapsed;
  if (!interactions.reading) interactions.reading = createReadingDetector(creditReadLine);
  interactions.reading.update(rawX, now, block ? block.w : DEFAULT_LINE_WIDTH_PX, key);
}

// Exact, unlike gaze: how long each piece of text was actually on screen.
function recordTextVisibility() {
  if (!recording.active) return;
  const { height } = stageArea();
  for (const block of currentTextBlocks()) {
    const entry = interactions.text.get(textKey(interactions.blocksPage, block.id));
    if (!entry) continue;
    const shown = Math.min(block.y + block.h, height) - Math.max(block.y, 0);
    if (shown >= Math.min(block.h, height) * TEXT_VISIBLE_SHARE) entry.visibleMs += CURSOR_TICK_MS;
  }
}

function recordInteractionTick() {
  recordCursor();
  recordTextVisibility();
}

function textStatus({ words, visibleMs, nearMs, readingMs, lines }) {
  const expectedMs = (words / READ_WORDS_PER_SECOND) * 1000;
  if (readingMs >= LIKELY_READ_MIN_MS && lines >= LIKELY_READ_MIN_LINES) return 'Likely read';
  if (nearMs >= Math.max(LOOKED_NEAR_MIN_MS, Math.min(expectedMs * LOOKED_NEAR_SHARE, LOOKED_NEAR_MAX_MS))) return 'Looked near';
  if (visibleMs >= ON_SCREEN_MIN_MS) return 'On screen only';
  return 'Not seen';
}

function resetInteractions() {
  interactions.cursor = null;
  interactions.clicks = [];
  interactions.path = [];
  interactions.scroll = new Map();
  interactions.regionMs = new Map();
  interactions.text = new Map();
  interactions.reading = null;
  registerTextBlocks(interactions.blocksPage, currentTextBlocks());
}

function handleFrameMessage(event) {
  if (event.source !== $('site-frame').contentWindow) return;
  const { data } = event;
  if (!data || data.source !== 'ux-frame-tracker') return;
  interactions.connected = true;

  if (data.kind === 'text' && Array.isArray(data.blocks)) {
    interactions.blocksPage = String(data.page || '');
    interactions.blocksAt = performance.now();
    interactions.blocks = data.blocks.filter(({ x, y, w, h, words }) => [x, y, w, h, words].every(Number.isFinite));
    if (recording.active) registerTextBlocks(interactions.blocksPage, interactions.blocks);
    return;
  }
  if (!recording.active) return;

  const x = Number(data.x);
  const y = Number(data.y);
  const hasPoint = Number.isFinite(x) && Number.isFinite(y);
  const page = String(data.page || '');
  const region = typeof data.region === 'string' ? data.region : null;

  if (data.kind === 'move' && hasPoint) {
    interactions.cursor = { x, y, region, at: performance.now() };
  } else if (data.kind === 'leave') {
    interactions.cursor = null;
  } else if (data.kind === 'scroll' && Number.isFinite(data.depth)) {
    interactions.scroll.set(page, Math.max(interactions.scroll.get(page) || 0, data.depth));
  } else if (data.kind === 'click' && hasPoint) {
    const click = {
      kind: 'click',
      t: Math.round(performance.now() - recording.startTime),
      x: Math.round(x),
      y: Math.round(y),
      label: String(data.label || ''),
      region,
      page,
      screen: null,
    };
    interactions.clicks.push(click);
    if (recording.tracker && !recording.captureLost) recording.tracker.addSample(click);
  }
}

function recordCursor() {
  const { cursor } = interactions;
  if (!recording.active || !cursor || interactions.path.length >= MAX_CURSOR_POINTS) return;
  const now = performance.now();
  if (now - cursor.at > CURSOR_IDLE_MS) return;
  const point = {
    kind: 'cursor',
    t: Math.round(now - recording.startTime),
    x: Math.round(cursor.x),
    y: Math.round(cursor.y),
    ms: CURSOR_TICK_MS,
    screen: null,
  };
  interactions.path.push([point.t, point.x, point.y]);
  if (recording.tracker && !recording.captureLost) recording.tracker.addSample(point);
  if (cursor.region) interactions.regionMs.set(cursor.region, (interactions.regionMs.get(cursor.region) || 0) + CURSOR_TICK_MS);
}

function summarizeInteractions() {
  return {
    connected: interactions.connected,
    clicks: interactions.clicks.map(({ t, x, y, label, region, page }) => ({ t, x, y, label, region, page })),
    scroll: [...interactions.scroll].map(([page, depth]) => ({ page, depth: Number(depth.toFixed(3)) })),
    cursorRegions: [...interactions.regionMs].map(([name, ms]) => ({ name, ms })),
    cursorMs: interactions.path.length * CURSOR_TICK_MS,
    path: interactions.path,
    text: [...interactions.text.values()].map((entry) => ({
      page: entry.page,
      label: String(entry.label),
      words: entry.words,
      visibleMs: entry.visibleMs,
      // Line timing and gaze timing differ slightly, but reading always counts as looking near it.
      nearMs: Math.round(Math.max(entry.nearMs, entry.readingMs)),
      readingMs: Math.round(entry.readingMs),
      lines: entry.lines,
      status: textStatus(entry),
    })),
    calibrationAreas: state.areaHits,
  };
}

function appendFact(parent, text, className = 'detail') {
  const fact = document.createElement('p');
  fact.className = className;
  fact.textContent = text;
  parent.append(fact);
}

function appendHeading(parent, text) {
  const heading = document.createElement('h3');
  heading.textContent = text;
  parent.append(heading);
}

function pageName(page) {
  return page.split('?')[0].split('/').pop() || page || 'Page';
}

// Shared by the review screen and saved sessions.
function renderInteractions(parent, data) {
  parent.replaceChildren();
  if (!data || !data.connected) {
    appendFact(parent, 'This page didn\'t report mouse, clicks or scrolling. Pages on another address need the tracking line added to them, as shown under Details in the recorder.');
    return;
  }

  const { clicks, scroll, cursorRegions } = data;
  appendFact(parent, `${clicks.length} ${clicks.length === 1 ? 'click' : 'clicks'}${clicks.length ? `, the first after ${formatSeconds(clicks[0].t)}` : ''} · ${formatSeconds(data.cursorMs)} of mouse movement`);

  if (scroll.length) {
    appendHeading(parent, 'Furthest scrolled');
    const list = document.createElement('ul');
    list.className = 'dwell';
    renderRegionList(list, scroll.map(({ page, depth }) => ({ name: pageName(page), ms: depth * 1000 })), 1000, (ms) => `${Math.round(ms / 10)}%`);
    parent.append(list);
  }

  if (cursorRegions.length) {
    appendHeading(parent, 'Mouse time by page area');
    const list = document.createElement('ul');
    list.className = 'dwell';
    const sorted = [...cursorRegions].sort((a, b) => b.ms - a.ms);
    renderRegionList(list, sorted, sorted.reduce((sum, { ms }) => sum + ms, 0));
    parent.append(list);
  }

  if (clicks.length) {
    appendHeading(parent, 'Clicks, in order');
    const list = document.createElement('ol');
    list.className = 'click-list';
    for (const { t, label, region, page } of clicks) {
      const item = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = label || 'Unnamed item';
      const where = document.createElement('span');
      where.textContent = [region, pageName(page), formatSeconds(t)].filter(Boolean).join(' · ');
      item.append(name, where);
      list.append(item);
    }
    parent.append(list);
  }
}

const TEXT_STATUS_ORDER = ['Likely read', 'Looked near', 'On screen only', 'Not seen'];

function renderTextReading(parent, data) {
  parent.replaceChildren();
  const blocks = data && data.text ? data.text : [];
  if (!blocks.length) {
    appendFact(parent, 'No text was tracked on this page. Pages on another address need the tracking line added to them, as shown under Details in the recorder.');
    return;
  }

  const counts = TEXT_STATUS_ORDER.map((status) => [status, blocks.filter((block) => block.status === status).length]).filter(([, count]) => count);
  appendFact(parent, counts.map(([status, count]) => `${count} ${status.toLowerCase()}`).join(' · '));

  const pages = [...new Set(blocks.map(({ page }) => page))];
  for (const page of pages) {
    if (pages.length > 1) appendHeading(parent, pageName(page));
    const wrapper = document.createElement('div');
    wrapper.className = 'text-table-wrap';
    const table = document.createElement('table');
    table.className = 'text-table';
    const head = table.createTHead().insertRow();
    for (const title of ['Text', 'Result', 'Reading', 'Looked near', 'On screen', 'Words']) {
      const cell = document.createElement('th');
      cell.textContent = title;
      head.append(cell);
    }
    const body = table.createTBody();
    for (const block of blocks.filter((item) => item.page === page)) {
      const row = body.insertRow();
      row.insertCell().textContent = block.label;
      const status = row.insertCell();
      const badge = document.createElement('span');
      badge.className = `text-status is-${block.status.toLowerCase().replace(/\s+/g, '-')}`;
      badge.textContent = block.status;
      status.append(badge);
      for (const value of [formatSeconds(block.readingMs), formatSeconds(block.nearMs), formatSeconds(block.visibleMs), String(block.words)]) {
        row.insertCell().textContent = value;
      }
    }
    wrapper.append(table);
    parent.append(wrapper);
  }
}
