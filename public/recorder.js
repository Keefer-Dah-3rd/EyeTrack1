/* Live view */

const DEFAULT_SITE = '/sample/index.html';
const SITE_STORAGE_KEY = 'eye-tracker-site';
const TIMER_TICK_MS = 100;
// Long enough for fonts and late content to arrive before a page is measured.
const LAYOUT_SCAN_DELAY_MS = 800;

// Webcam gaze is steadier across than down, so the columns of this grid are more dependable than its rows.
const AREA_GRID = [
  ['Top left', 'Top center', 'Top right'],
  ['Middle left', 'Center', 'Middle right'],
  ['Bottom left', 'Bottom center', 'Bottom right'],
];
const AREA_NAMES = AREA_GRID.flat();

const dwell = { rows: new Map(), total: 0, lastTime: 0 };
const smoothed = { x: 0, y: 0, ready: false };
const rate = { count: 0 };

// Null for a site on another origin, whose page this tool can't look inside.
function frameDocument() {
  try {
    return $('site-frame').contentDocument;
  } catch {
    return null;
  }
}

function buildDwellRows() {
  dwell.rows.clear();
  for (const name of [...AREA_NAMES, ELSEWHERE]) dwell.rows.set(name, { ms: 0 });
}

function areaName(x, y, area) {
  const column = Math.min(2, Math.floor((x / area.width) * 3));
  const row = Math.min(2, Math.floor((y / area.height) * 3));
  return AREA_GRID[row][column];
}

function renderAreaGrid(container, regions) {
  const msFor = (name) => (regions.find((region) => region.name === name) || { ms: 0 }).ms;
  const total = regions.reduce((sum, { ms }) => sum + ms, 0);
  const largest = Math.max(...AREA_NAMES.map(msFor), 1);

  const grid = document.createElement('div');
  grid.className = 'area-grid';
  for (const name of AREA_NAMES) {
    const ms = msFor(name);
    const cell = document.createElement('div');
    cell.className = 'area-cell';
    cell.style.setProperty('--share', (ms / largest).toFixed(3));
    const label = document.createElement('span');
    label.textContent = name;
    const value = document.createElement('strong');
    value.textContent = total ? `${Math.round((ms / total) * 100)}%` : '–';
    const time = document.createElement('small');
    time.textContent = formatSeconds(ms);
    cell.append(label, value, time);
    grid.append(cell);
  }

  const elsewhere = document.createElement('p');
  elsewhere.className = 'area-elsewhere';
  elsewhere.textContent = `Elsewhere (off the page or on the recorder): ${formatSeconds(msFor(ELSEWHERE))}`;
  container.replaceChildren(grid, elsewhere);
}

// Sessions saved before the grid have other area names.
function renderSessionAreas(container, regions) {
  if (regions.some(({ name }) => AREA_NAMES.includes(name))) {
    renderAreaGrid(container, regions);
    return;
  }
  const list = document.createElement('ul');
  list.className = 'dwell';
  renderRegionList(list, regions, regions.reduce((sum, { ms }) => sum + ms, 0));
  container.replaceChildren(list);
}

function resetLiveData() {
  dwell.total = 0;
  dwell.lastTime = 0;
  buildDwellRows();
  smoothed.ready = false;
  renderDwell();
  resetLiveScore();
}

function renderDwell() {
  if ($('panel').hidden) return;
  renderAreaGrid($('dwell'), [...dwell.rows].map(([name, { ms }]) => ({ name, ms })));
}

function stageArea() {
  const { left, top, width, height } = $('stage').getBoundingClientRect();
  return { left, top, width, height };
}

function handleLiveGaze(data) {
  const now = performance.now();
  const elapsed = dwell.lastTime ? Math.min(now - dwell.lastTime, MAX_FRAME_GAP_MS) : 0;
  dwell.lastTime = now;

  const chip = $('tracking-state');
  if (!data) {
    chip.textContent = 'Face lost';
    chip.className = 'chip is-bad';
    smoothed.ready = false;
    return;
  }

  const problem = visibleProblem();
  chip.textContent = problem ? 'Head moved' : 'Tracking';
  chip.className = problem ? 'chip is-warn' : 'chip is-good';
  chip.title = problem || '';
  $('tracking-note').hidden = !problem;
  if (problem) $('tracking-note').textContent = `${problem}. Readings are less accurate until you move back or re-center.`;
  rate.count += 1;

  const { x: gazeX, y: gazeY } = correctGaze(data);
  smoothed.x = smoothed.ready ? smoothed.x + (gazeX - smoothed.x) * SMOOTHING : gazeX;
  smoothed.y = smoothed.ready ? smoothed.y + (gazeY - smoothed.y) * SMOOTHING : gazeY;
  smoothed.ready = true;

  const { x, y } = smoothed;

  const area = stageArea();
  const stageX = x - area.left;
  const stageY = y - area.top;
  // Looking at the recorder isn't looking at the page underneath it.
  const onStage = stageX >= 0 && stageY >= 0 && stageX < area.width && stageY < area.height && !isOverDock(x, y);

  dwell.total += elapsed;
  dwell.rows.get(onStage ? areaName(stageX, stageY, area) : ELSEWHERE).ms += elapsed;
  if (onStage && elapsed) recordLiveGaze(stageX, stageY, elapsed);

  if (recording.active) {
    trackPage();
    recording.trackedMs += elapsed;
    recording.gazeUpdates += 1;
    if (onStage) {
      const raw = gazeEngine.latestRaw && !MOUSE_MODE ? correctGaze(gazeEngine.latestRaw) : { x: gazeX };
      recordGazeOnText(stageX, stageY, raw.x - area.left, elapsed, now);
    }
    if (onStage && elapsed) {
      const sample = { t: Math.round(now - recording.startTime), x: Math.round(stageX), y: Math.round(stageY), ms: elapsed, screen: null, page: recording.pageKey };
      recording.samples.push(sample);
      if (recording.tracker && !recording.captureLost) recording.tracker.addSample(sample);
    }
  }
}

function startLive() {
  showScreen('live');
  $('accuracy-note').textContent = `±${state.errorPx} px`;
  if (!$('site-frame').getAttribute('src')) loadSite(storedSite());
  restoreDockState();
  syncDock();
  resetLiveData();
  state.gazeHandler = handleLiveGaze;
}

function togglePanel() {
  if (recording.active) return;
  $('panel').hidden = !$('panel').hidden;
  $('toggle-panel').setAttribute('aria-expanded', String(!$('panel').hidden));
  syncPreview();
}

/* Floating recorder panel */

const DOCK_STORAGE_KEY = 'eye-tracker-dock-collapsed';
const dock = { collapsed: false };

function restoreDockState() {
  try {
    dock.collapsed = localStorage.getItem(DOCK_STORAGE_KEY) === 'true';
  } catch {
    // Remembering this is only a convenience.
  }
}

// Always collapsed while recording, then back to however it was left.
function syncDock() {
  const collapsed = dock.collapsed || recording.active;
  $('recorder-bar').classList.toggle('is-collapsed', collapsed);
  $('dock-body').hidden = collapsed;
  const toggle = $('dock-toggle');
  toggle.disabled = recording.active;
  toggle.setAttribute('aria-expanded', String(!collapsed));
  toggle.setAttribute('aria-label', collapsed ? 'Expand recorder' : 'Collapse recorder');
  syncPreview();
}

function toggleDock() {
  if (recording.active) return;
  dock.collapsed = !dock.collapsed;
  try {
    localStorage.setItem(DOCK_STORAGE_KEY, String(dock.collapsed));
  } catch {
    // Remembering this is only a convenience.
  }
  syncDock();
}

function isOverDock(x, y) {
  const { left, top, right, bottom } = $('recorder-bar').getBoundingClientRect();
  return x >= left && x < right && y >= top && y < bottom;
}

/* The site being tested */

function storedSite() {
  try {
    return localStorage.getItem(SITE_STORAGE_KEY) || DEFAULT_SITE;
  } catch {
    return DEFAULT_SITE;
  }
}

function normalizeSiteUrl(value) {
  const text = value.trim();
  if (!text) return DEFAULT_SITE;
  if (text.startsWith('/') || /^https?:\/\//i.test(text)) return text;
  if (/^(localhost|127\.0\.0\.1)(:|\/|$)/i.test(text)) return `http://${text}`;
  return `https://${text}`;
}

function loadSite(value) {
  const url = normalizeSiteUrl(value);
  $('site-url').value = url;
  $('site-frame').src = url;
  try {
    localStorage.setItem(SITE_STORAGE_KEY, url);
  } catch {
    // Remembering the site is only a convenience.
  }
}

function setBarNote(message) {
  $('bar-note').textContent = message;
  $('bar-note').title = message;
}

function handleFrameLoad() {
  const page = frameDocument();
  if (!page) {
    $('site-note').textContent = `This site is on another address, so the keyboard shortcuts stop while it has focus. To record its mouse, clicks, scrolling and reading, add this line to its pages: <script src="${window.location.origin}/frame-tracker.js"></script>`;
    return;
  }
  $('site-note').textContent = '';
  const tracker = page.createElement('script');
  tracker.src = '/frame-tracker.js';
  page.documentElement.append(tracker);
  // Key presses inside a frame don't reach the outer page, so listen in the frame too.
  page.addEventListener('keydown', handleRecordingKeys);
  if (MOUSE_MODE) {
    page.addEventListener('mousemove', (event) => {
      const area = stageArea();
      mouseGaze.x = event.clientX + area.left;
      mouseGaze.y = event.clientY + area.top;
    });
  }
  page.documentElement.classList.toggle('show-regions', $('toggle-regions').checked);
  if (recording.active) trackPage();
}

/* Measuring each page visited while recording */

function currentPageKey() {
  const page = frameDocument();
  return page && page.location.href !== 'about:blank' ? page.location.pathname + page.location.search : null;
}

function measureLayout(key) {
  if (!recording.active || currentPageKey() !== key || recording.layouts.get(key)) return;
  try {
    recording.layouts.set(key, scanPageLayout(frameDocument()));
  } catch (error) {
    // A page that can't be measured shouldn't cost the recording.
    console.error(error);
  }
}

// Also runs on every gaze reading, because a single-page app changes address without loading.
function trackPage() {
  const key = currentPageKey();
  if (key === recording.pageKey) return;
  recording.pageKey = key;
  if (key === null || recording.layouts.has(key)) return;
  recording.layouts.set(key, null);
  setTimeout(() => measureLayout(key), LAYOUT_SCAN_DELAY_MS);
}

function buildSessionScans(screens) {
  try {
    return buildPageScans({ layouts: recording.layouts, samples: recording.samples, screens, area: stageArea() });
  } catch (error) {
    console.error(error);
    return [];
  }
}

/* Recording */

const recording = {
  active: false,
  startedAt: null,
  startTime: 0,
  elapsedMs: 0,
  trackedMs: 0,
  gazeUpdates: 0,
  samples: [],
  tracker: null,
  heatmapOn: false,
  captureLost: false,
  windowMoved: false,
  pageKey: null,
  layouts: new Map(),
};

function formatTimer(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}.${Math.floor((ms % 1000) / 100)}`;
}

function renderTimer() {
  if (recording.active) recording.elapsedMs = performance.now() - recording.startTime;
  $('timer').textContent = formatTimer(recording.elapsedMs);
}

function syncRecorderBar() {
  const { active } = recording;
  $('recorder-bar').classList.toggle('is-recording', active);
  $('record-start').disabled = active;
  $('record-stop').disabled = !active;
  for (const id of ['recenter', 'toggle-heatmap', 'site-url', 'site-go', 'open-sessions', 'toggle-panel']) {
    $(id).disabled = active;
  }
  $('recalibrate-drift').hidden = active;
  syncDock();
}

function startRecording() {
  if (state.phase !== 'live' || recording.active) return;
  $('panel').hidden = true;
  $('toggle-panel').setAttribute('aria-expanded', 'false');
  setBarNote('');
  resetLiveData();
  resetInteractions();

  recording.active = true;
  recording.startedAt = new Date().toISOString();
  recording.startTime = performance.now();
  recording.elapsedMs = 0;
  recording.trackedMs = 0;
  recording.gazeUpdates = 0;
  recording.samples = [];
  recording.heatmapOn = $('toggle-heatmap').checked && Boolean(tabCapture.stream);
  recording.tracker = recording.heatmapOn ? startScreenTracker(stageArea, () => recording.pageKey) : null;
  recording.captureLost = false;
  recording.windowMoved = false;
  recording.pageKey = null;
  recording.layouts = new Map();
  trackPage();

  syncRecorderBar();
  syncPreview();
}

function stopRecording() {
  if (!recording.active) return;
  renderTimer();
  // A page opened just before stopping hasn't had its turn to be measured yet.
  if (recording.pageKey) measureLayout(recording.pageKey);
  recording.active = false;
  const screens = recording.tracker ? recording.tracker.finish() : [];
  recording.tracker = null;
  renderDwell();
  syncRecorderBar();

  showReview({
    startedAt: recording.startedAt,
    durationMs: Math.round(recording.elapsedMs),
    trackedMs: Math.round(recording.trackedMs),
    gazeUpdatesPerSecond: recording.gazeUpdates / Math.max(recording.elapsedMs / 1000, 1),
    siteUrl: $('site-url').value,
    accuracyPx: state.errorPx,
    heatmapOn: recording.heatmapOn,
    captureLost: recording.captureLost,
    windowMoved: recording.windowMoved,
    regions: [...dwell.rows].map(([name, row]) => ({ name, ms: Math.round(row.ms) })),
    samples: recording.samples.map(({ t, x, y, ms, screen }) => [t, x, y, Math.round(ms), screen]),
    pageScans: buildSessionScans(screens),
    interactions: summarizeInteractions(),
    screens,
  });
}

function handleRecordingKeys(event) {
  if (!event.altKey || event.metaKey || event.ctrlKey || state.phase !== 'live' || recenter.open) return;
  // event.code, because Option turns the letters into other characters on a Mac.
  if (event.code === 'KeyS') {
    event.preventDefault();
    startRecording();
  } else if (event.code === 'KeyD') {
    event.preventDefault();
    stopRecording();
  } else if (event.code === 'KeyR') {
    event.preventDefault();
    openRecenter();
  }
}

/* Trying the recorder without a camera: open the page with ?mouse and the cursor stands in for gaze. */

const MOUSE_MODE = new URLSearchParams(window.location.search).has('mouse');
const MOUSE_ERROR_PX = 40;
const MOUSE_SAMPLE_MS = 33;
const mouseGaze = { x: null, y: null };

function startMouseMode() {
  $('start-camera').hidden = true;
  $('continue').hidden = false;
  $('continue').disabled = false;
  $('continue').textContent = 'Continue to recorder';
  $('recalibrate-live').hidden = true;
  $('recenter').hidden = true;
  $('stop-camera').hidden = true;
  setStatus('Mouse mode: the cursor stands in for gaze, and the camera stays off.');
  window.addEventListener('mousemove', (event) => {
    mouseGaze.x = event.clientX;
    mouseGaze.y = event.clientY;
  });
  setInterval(() => {
    if (state.gazeHandler && mouseGaze.x !== null) state.gazeHandler({ x: mouseGaze.x, y: mouseGaze.y });
  }, MOUSE_SAMPLE_MS);
}

/* Heat map switch */

// Sharing a tab makes the browser add a bar that resizes the page, so ask before calibrating.
async function continueFromSetup() {
  if (tabCapture.pending) return;
  const wanted = $('setup-heatmap');
  const note = $('setup-capture-note');
  note.hidden = true;
  if (wanted.checked && !tabCapture.stream) {
    try {
      await requestTabCapture();
    } catch (error) {
      wanted.checked = false;
      note.textContent = `${describeCaptureError(error)} Continue again to go on without them.`;
      note.hidden = false;
      return;
    }
  }
  $('toggle-heatmap').checked = wanted.checked;
  if (MOUSE_MODE) {
    state.errorPx = MOUSE_ERROR_PX;
    startLive();
  } else {
    startCalibration();
  }
}

function describeCaptureError(error) {
  switch (error && error.name) {
    case 'NotAllowedError':
      return 'Screen sharing was declined, so heat maps are off.';
    case 'WrongSurfaceError':
      return 'Heat maps need the "This tab" option in Chrome or Edge, so they are off.';
    case 'NotSupportedError':
      return "This browser can't share a tab, so heat maps are off. Use Chrome or Edge.";
    default:
      return `Heat maps are off: ${(error && error.message) || 'the tab could not be shared'}.`;
  }
}

async function handleHeatmapToggle(event) {
  if (!event.target.checked || tabCapture.stream) return;
  event.target.checked = false;
  try {
    await requestTabCapture();
    event.target.checked = true;
    setBarNote('');
  } catch (error) {
    setBarNote(describeCaptureError(error));
  }
}

function handleCaptureEnded() {
  $('toggle-heatmap').checked = false;
  $('setup-heatmap').checked = false;
  if (recording.active) recording.captureLost = true;
  setBarNote('Tab sharing stopped, so heat maps are off.');
}

/* Review after stopping */

const EYE_MIN_SPREAD_PX = 140;

const review = { session: null, images: [], saved: false, ready: false };

function clearReviewImages() {
  for (const image of review.images) URL.revokeObjectURL(image.url);
  review.images = [];
}

function formatSeconds(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function fileName(sessionName, suffix) {
  const base = sessionName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'session';
  return `${base}-${suffix}.png`;
}

function imageTitle(image) {
  return image.kind === 'overview' ? 'All screens' : `Screen ${image.position + 1}`;
}

function imageSuffix(image) {
  return image.kind === 'overview' ? 'all-screens' : `screen-${image.position + 1}`;
}

function buildImageCard(image, url, sessionName) {
  const card = document.createElement('figure');
  card.className = image.kind === 'overview' ? 'heat-card is-overview' : 'heat-card';

  const open = document.createElement('a');
  open.href = url;
  open.target = '_blank';
  open.rel = 'noopener';
  const picture = document.createElement('img');
  picture.src = url;
  picture.loading = 'lazy';
  picture.alt = `${imageTitle(image)} heat map`;
  open.append(picture);

  const caption = document.createElement('figcaption');
  const label = document.createElement('span');
  label.textContent = image.kind === 'overview' ? imageTitle(image) : `${imageTitle(image)} · ${formatSeconds(image.gazeMs)} of gaze`;
  const download = document.createElement('a');
  download.href = url;
  download.download = fileName(sessionName, imageSuffix(image));
  download.textContent = 'Download PNG';
  caption.append(label, download);

  card.append(open, caption);
  return card;
}

function renderRegionList(list, regions, totalMs, formatValue) {
  list.replaceChildren();
  for (const { name, ms } of regions) {
    const item = document.createElement('li');
    item.classList.toggle('is-other', name === ELSEWHERE);
    const row = document.createElement('div');
    row.className = 'row';
    const label = document.createElement('span');
    label.textContent = name;
    const value = document.createElement('span');
    const share = totalMs ? ms / totalMs : 0;
    value.textContent = formatValue ? formatValue(ms) : `${formatSeconds(ms)} · ${Math.round(share * 100)}%`;
    row.append(label, value);
    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('i');
    fill.style.width = `${share * 100}%`;
    bar.append(fill);
    item.append(row, bar);
    list.append(item);
  }
}

function reviewWarnings(session) {
  const warnings = [];
  if (session.captureLost) warnings.push('Tab sharing stopped during this session, so later gaze is not on the heat map.');
  if (session.windowMoved) warnings.push('The window moved or changed size during this session, so gaze positions may be off.');
  if (session.durationMs && session.trackedMs / session.durationMs < MIN_FACE_RATIO) {
    warnings.push('The face was lost for much of this session, so there is little gaze data.');
  } else if (session.gazeUpdatesPerSecond < MIN_FRAME_RATE) {
    warnings.push(`Eye tracking ran slowly (${session.gazeUpdatesPerSecond.toFixed(0)} updates a second). Closing other tabs and apps should help.`);
  }
  return warnings;
}

async function generateHeatImages(session) {
  const { screens } = session;
  const cards = screens.map((entry, index) => renderHeatScreen({
    frame: entry.frame,
    width: entry.width,
    height: entry.height,
    samples: entry.samples,
    // Never drawn sharper than webcam gaze can really tell, even after a good calibration run.
    errorPx: MOUSE_MODE ? session.accuracyPx : Math.max(session.accuracyPx || 0, EYE_MIN_SPREAD_PX),
    cursor: entry.cursor,
    clicks: entry.clicks,
    caption: `Screen ${index + 1} of ${screens.length} · ${formatSeconds(entry.gazeMs)} of gaze`,
  }));

  const accuracy = session.accuracyPx === null ? '' : ' · eye tracking shows broad areas only';
  const overview = renderHeatOverview(
    cards,
    'Test session',
    `${formatDateTime(session.startedAt)} · ${formatTimer(session.durationMs)} · ${screens.length} ${screens.length === 1 ? 'screen' : 'screens'}${accuracy}`,
  );

  const totalGaze = screens.reduce((sum, entry) => sum + entry.gazeMs, 0);
  const describe = async (canvas, kind, position, gazeMs) => {
    const blob = await canvasToPng(canvas);
    return { kind, position, gazeMs, width: canvas.width, height: canvas.height, blob, url: URL.createObjectURL(blob) };
  };
  return Promise.all([
    describe(overview, 'overview', 0, totalGaze),
    ...cards.map((card, index) => describe(card, 'screen', index, screens[index].gazeMs)),
  ]);
}

async function showReview(session) {
  clearReviewImages();
  review.session = session;
  review.saved = false;
  review.ready = false;

  const trackedShare = session.durationMs ? Math.round((session.trackedMs / session.durationMs) * 100) : 0;
  $('review-duration').textContent = formatTimer(session.durationMs);
  const clickCount = session.interactions.clicks.length;
  $('review-facts').textContent = `Face tracked ${trackedShare}% of the time · ${clickCount} ${clickCount === 1 ? 'click' : 'clicks'} · ${session.screens.length} ${session.screens.length === 1 ? 'screen' : 'screens'} captured`;
  const warnings = reviewWarnings(session);
  $('review-warning').textContent = warnings.join(' ');
  $('review-warning').hidden = !warnings.length;

  const defaultName = `Session ${formatDateTime(session.startedAt)}`;
  $('session-name').value = defaultName;
  $('session-notes').value = '';
  $('review-form').hidden = false;
  $('review-saved').hidden = true;
  $('review-error').hidden = true;

  const hasRegions = session.regions.some(({ name }) => name !== ELSEWHERE);
  $('review-regions-section').hidden = !hasRegions;
  renderSessionAreas($('review-regions'), session.regions);
  const areas = session.interactions.calibrationAreas;
  $('review-regions-note').textContent = `From the webcam, so treat this as a guide. Left and right are more dependable than up and down.${areas ? ` In this calibration's check, the right area was correct for ${areas.cells} of ${areas.total} dots.` : ''}`;
  renderTextReading($('review-text'), session.interactions);
  renderInteractions($('review-interactions'), session.interactions);

  const gallery = $('review-gallery');
  gallery.replaceChildren();
  $('save-session').disabled = true;
  showScreen('review');

  const hasImages = session.heatmapOn && session.screens.length > 0;
  $('review-heat-section').hidden = !session.heatmapOn;
  $('review-heat-status').textContent = hasImages ? 'Generating heat maps...' : 'No screens were captured in this session.';
  if (hasImages) {
    try {
      review.images = await generateHeatImages(session);
      if (review.session !== session) return;
      $('review-heat-status').textContent = 'Colour shows roughly where the eyes were, so read it as broad areas. The line and numbers show the exact mouse path and clicks.';
      for (const image of review.images) gallery.append(buildImageCard(image, image.url, $('session-name').value));
    } catch (error) {
      $('review-heat-status').textContent = `The heat maps could not be created: ${error.message}.`;
    }
  }
  review.ready = true;
  $('save-session').disabled = false;
  $('session-name').focus();
  $('session-name').select();
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function saveReviewedSession(event) {
  event.preventDefault();
  if (!review.ready || review.saved) return;
  const { session } = review;
  const button = $('save-session');
  button.disabled = true;
  button.textContent = 'Saving...';
  $('review-error').hidden = true;

  try {
    const images = await Promise.all(review.images.map(async ({ blob, url, ...image }) => ({
      ...image,
      png: await blobToBase64(blob),
    })));
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: $('session-name').value,
        notes: $('session-notes').value,
        siteUrl: session.siteUrl,
        startedAt: session.startedAt,
        durationMs: session.durationMs,
        trackedMs: session.trackedMs,
        accuracyPx: session.accuracyPx,
        heatmapOn: session.heatmapOn,
        regions: session.regions,
        samples: session.samples,
        pageScans: session.pageScans,
        interactions: session.interactions,
        images,
      }),
    });
    if (!response.ok) {
      const { error } = await response.json().catch(() => ({}));
      throw new Error(error || `the server replied ${response.status}`);
    }
    review.saved = true;
    $('review-form').hidden = true;
    $('review-saved').hidden = false;
  } catch (error) {
    $('review-error').textContent = `This session wasn't saved: ${error.message}. It is still here, so you can try again.`;
    $('review-error').hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = 'Save to database';
  }
}

function leaveReview(nextPhase) {
  clearReviewImages();
  review.session = null;
  recording.elapsedMs = 0;
  renderTimer();
  if (nextPhase === 'sessions') openSessions('live');
  else showScreen('live');
}

function discardReview() {
  if (window.confirm('Discard this session? It has not been saved and cannot be recovered.')) leaveReview('live');
}

// Back to the page the session started on, so the next take begins the same way.
// It waits for Start rather than starting itself, to give the person time to get ready.
function retryReview() {
  if (!window.confirm('Retry? This session has not been saved and will be discarded.')) return;
  leaveReview('live');
  loadSite($('site-url').value);
}

/* Saved sessions */

let sessionsReturnPhase = 'setup';

function buildSessionRow(session) {
  const row = document.createElement('details');
  row.className = 'session-row';

  const summary = document.createElement('summary');
  const title = document.createElement('strong');
  title.textContent = session.name;
  const meta = document.createElement('span');
  const screenCount = session.images.filter(({ kind }) => kind === 'screen').length;
  meta.textContent = [
    formatDateTime(session.started_at),
    formatTimer(session.duration_ms),
    session.heatmap_on ? `${screenCount} ${screenCount === 1 ? 'screen' : 'screens'}` : 'No heat map',
  ].join(' · ');
  summary.append(title, meta);
  row.append(summary);

  const body = document.createElement('div');
  body.className = 'session-body';

  const facts = document.createElement('p');
  facts.className = 'detail';
  const trackedShare = session.duration_ms ? Math.round((session.tracked_ms / session.duration_ms) * 100) : 0;
  facts.textContent = `${session.site_url} · face tracked ${trackedShare}% of the time`;
  body.append(facts);

  if (session.notes) {
    const notes = document.createElement('p');
    notes.className = 'session-notes';
    notes.textContent = session.notes;
    body.append(notes);
  }

  if (session.images.length) {
    const gallery = document.createElement('div');
    gallery.className = 'heat-gallery';
    for (const image of session.images) {
      gallery.append(buildImageCard({ kind: image.kind, position: image.position, gazeMs: image.gaze_ms }, `/api/images/${image.id}`, session.name));
    }
    body.append(gallery);
  }

  if (session.regions.some(({ name }) => name !== ELSEWHERE)) {
    const areas = document.createElement('div');
    renderSessionAreas(areas, session.regions);
    body.append(areas);
  }

  const reading = document.createElement('div');
  reading.className = 'interactions';
  renderTextReading(reading, session.interactions);
  body.append(reading);

  const interactionDetails = document.createElement('div');
  renderInteractions(interactionDetails, session.interactions);
  body.append(interactionDetails);

  const remove = document.createElement('button');
  remove.textContent = 'Delete session';
  remove.addEventListener('click', () => deleteSavedSession(session));
  body.append(remove);

  row.append(body);
  return row;
}

async function renderSessions() {
  const list = $('sessions-list');
  const empty = $('sessions-empty');
  empty.hidden = true;
  try {
    const response = await fetch('/api/sessions');
    if (!response.ok) throw new Error(`the server replied ${response.status}`);
    const sessions = await response.json();
    list.replaceChildren(...sessions.map(buildSessionRow));
    empty.textContent = 'Nothing saved yet. Stop a recording and save it to see it here.';
    empty.hidden = sessions.length > 0;
  } catch (error) {
    list.replaceChildren();
    empty.textContent = `Saved sessions could not be loaded: ${error.message}.`;
    empty.hidden = false;
  }
}

async function deleteSavedSession(session) {
  if (!window.confirm(`Delete "${session.name}" and its heat maps? This cannot be undone.`)) return;
  const response = await fetch(`/api/sessions/${session.id}`, { method: 'DELETE' });
  if (!response.ok) {
    window.alert("That session couldn't be deleted.");
    return;
  }
  renderSessions();
}

function openSessions(returnPhase) {
  sessionsReturnPhase = returnPhase;
  showScreen('sessions');
  renderSessions();
}
