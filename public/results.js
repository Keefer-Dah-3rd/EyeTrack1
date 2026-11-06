/* Charts for saved sessions. Reads the database through GET /api/sessions, or the
   data embedded in the file when this page was downloaded as standalone HTML. */
const $ = (id) => document.getElementById(id);

// Same limits the accuracy check in app.js grades against.
const GOOD_ERROR_PX = 120;
const USABLE_ERROR_PX = 240;
const MIN_FACE_RATIO = 0.5;
const ELSEWHERE = 'Elsewhere';

const RELIABLE = 'reliable';
const ALL = 'all';
const ALL_SITES = '*';

const snapshot = window.RESULTS_SNAPSHOT || null;
const isDemo = new URLSearchParams(window.location.search).has('demo');
const store = { sessions: [], images: {}, demo: false };
const view = { site: ALL_SITES, selection: RELIABLE };

function el(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes}m ${totalSeconds % 60}s`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function formatPercent(share) {
  return `${Math.round(share * 100)}%`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/* Reading a session */

function faceShare(session) {
  return session.duration_ms ? session.tracked_ms / session.duration_ms : 0;
}

function isReliable(session) {
  return session.accuracy_px !== null && session.accuracy_px <= USABLE_ERROR_PX && faceShare(session) >= MIN_FACE_RATIO;
}

function describeQuality(session) {
  if (session.accuracy_px === null) return { icon: '–', label: 'Not measured', tone: 'bad' };
  if (faceShare(session) < MIN_FACE_RATIO) return { icon: '✕', label: 'Little gaze data', tone: 'bad' };
  if (session.accuracy_px <= GOOD_ERROR_PX) return { icon: '✓', label: 'Good', tone: 'good' };
  if (session.accuracy_px <= USABLE_ERROR_PX) return { icon: '◐', label: 'Typical for a webcam', tone: 'warn' };
  return { icon: '✕', label: 'Too rough', tone: 'bad' };
}

function hasRegionData(session) {
  return session.regions.some(({ name, ms }) => name !== ELSEWHERE && ms > 0);
}

function regionShare(session, name) {
  const total = session.regions.reduce((sum, region) => sum + region.ms, 0);
  const match = session.regions.find((region) => region.name === name);
  return total && match ? match.ms / total : 0;
}

function sessionsOnSite() {
  const oldestFirst = [...store.sessions].sort((a, b) => a.started_at.localeCompare(b.started_at));
  return view.site === ALL_SITES ? oldestFirst : oldestFirst.filter((session) => session.site_url === view.site);
}

function selectedSessions() {
  const sessions = sessionsOnSite();
  if (view.selection === ALL) return sessions;
  if (view.selection === RELIABLE) return sessions.filter(isReliable);
  return sessions.filter((session) => String(session.id) === view.selection);
}

function summarizeRegions(sessions) {
  const measured = sessions.filter(hasRegionData);
  const names = [...new Set(measured.flatMap((session) => session.regions.map((region) => region.name)))];
  return names
    .map((name) => {
      const totalMs = measured.reduce((sum, session) => {
        const match = session.regions.find((region) => region.name === name);
        return sum + (match ? match.ms : 0);
      }, 0);
      const share = measured.reduce((sum, session) => sum + regionShare(session, name), 0) / measured.length;
      return { name, share, totalMs };
    })
    .sort((a, b) => (a.name === ELSEWHERE) - (b.name === ELSEWHERE) || b.share - a.share);
}

/* Tooltip */

function setTip(element, value, label) {
  element.dataset.tipValue = value;
  element.dataset.tipLabel = label;
}

function showTip(target, x, y) {
  const tip = $('tooltip');
  const strong = el('strong', '', target.dataset.tipValue);
  tip.replaceChildren(strong, el('span', '', target.dataset.tipLabel));
  tip.hidden = false;
  const { width, height } = tip.getBoundingClientRect();
  tip.style.left = `${Math.max(8, Math.min(x + 14, window.innerWidth - width - 8))}px`;
  tip.style.top = `${Math.max(8, Math.min(y + 14, window.innerHeight - height - 8))}px`;
}

function hideTip() {
  $('tooltip').hidden = true;
}

document.addEventListener('pointermove', (event) => {
  const target = event.target.closest && event.target.closest('[data-tip-value]');
  if (target) showTip(target, event.clientX, event.clientY);
  else hideTip();
});
document.addEventListener('focusin', (event) => {
  const target = event.target.closest && event.target.closest('[data-tip-value]');
  if (!target) return;
  const { left, bottom } = target.getBoundingClientRect();
  showTip(target, left, bottom);
});
document.addEventListener('focusout', hideTip);

/* Filters */

function buildFilters() {
  const sites = new Map();
  for (const session of store.sessions) sites.set(session.site_url, (sites.get(session.site_url) || 0) + 1);

  // Region names only mean the same thing within one website, so start on the most tested one.
  view.site = [...sites.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const siteSelect = $('site-filter');
  siteSelect.replaceChildren();
  for (const [site, count] of sites) {
    const option = el('option', '', `${site || 'Unknown site'} (${count})`);
    option.value = site;
    siteSelect.append(option);
  }
  const everySite = el('option', '', `All websites (${store.sessions.length})`);
  everySite.value = ALL_SITES;
  siteSelect.append(everySite);
  siteSelect.value = view.site;
  $('site-filter-label').hidden = sites.size < 2;

  buildSessionFilter();
  $('filters').hidden = false;
}

function buildSessionFilter() {
  const sessions = sessionsOnSite();
  const reliableCount = sessions.filter(isReliable).length;
  const select = $('session-filter');
  select.replaceChildren();

  const addOption = (parent, value, label) => {
    const option = el('option', '', label);
    option.value = value;
    parent.append(option);
  };
  addOption(select, RELIABLE, `Reliable sessions (${reliableCount})`);
  addOption(select, ALL, `All sessions (${sessions.length})`);
  const group = el('optgroup');
  group.label = 'One session';
  for (const session of [...sessions].reverse()) {
    addOption(group, String(session.id), `${session.name}, ${formatDate(session.started_at)}`);
  }
  select.append(group);

  view.selection = reliableCount ? RELIABLE : ALL;
  select.value = view.selection;
}

function selectSession(value) {
  view.selection = value;
  $('session-filter').value = value;
  render();
}

/* Page scorecard. The scales are in scorecard.js. */

function summarizePages(sessions) {
  const single = view.selection !== RELIABLE && view.selection !== ALL;
  // Layout belongs to the page rather than the person, so a session with poor gaze tracking still counts for it.
  const newestFirst = [...(single ? sessions : sessionsOnSite())].reverse();
  const pages = new Map();
  const pageId = (session, scan) => `${session.site_url}\n${scan.key}`;
  let screensLeftOut = false;

  for (const session of newestFirst) {
    for (const scan of session.page_scans || []) {
      if (!single && !scan.isPage) {
        screensLeftOut = true;
        continue;
      }
      const page = pages.get(pageId(session, scan)) || { label: scan.label, layout: null, pixels: null, focus: null, focusSessions: 0 };
      // A page with no readable text, such as a bot check or a canvas app, has no layout to judge.
      if (!page.layout && scan.layout && scan.layout.words) page.layout = scan.layout;
      if (!page.pixels && scan.pixels) page.pixels = scan.pixels;
      pages.set(pageId(session, scan), page);
    }
  }

  for (const session of sessions) {
    for (const scan of session.page_scans || []) {
      const page = pages.get(pageId(session, scan));
      if (!page || !scan.gaze || scan.gaze.focus === null || scan.gaze.ms < MIN_FOCUS_GAZE_MS) continue;
      page.focus = (page.focus * page.focusSessions + scan.gaze.focus) / (page.focusSessions + 1);
      page.focusSessions += 1;
    }
  }

  return {
    pages: [...pages.values()].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true })),
    screensLeftOut,
  };
}

function buildScoreCell(group, page) {
  const cell = el('td');
  const { score, known, total } = scoreGroup(group, page);
  if (score === null) {
    cell.append(el('span', 'r-score-value r-score-none', '–'));
    return cell;
  }
  const status = describeScore(score, group.labels);
  cell.append(el('span', 'r-score-value', String(score)), el('span', `r-quality is-${status.tone}`, `${status.icon} ${status.label}`));
  if (known < total) cell.append(el('span', 'r-score-basis', `from ${known} of ${total} measures`));
  return cell;
}

function buildMeasureTable(group, page) {
  const table = el('table', 'r-measures');
  const { score } = scoreGroup(group, page);
  table.append(el('caption', '', score === null ? `${group.title}: no data` : `${group.title}: ${score}`));
  const headRow = el('tr');
  for (const heading of ['Measure', 'This page', 'Target', 'Target from', 'Points']) {
    const cell = el('th', '', heading);
    cell.scope = 'col';
    headRow.append(cell);
  }
  const head = el('thead');
  head.append(headRow);

  const body = el('tbody');
  for (const measure of group.measures) {
    const value = measure.read(page);
    const row = el('tr');
    row.append(
      el('td', '', measure.label),
      el('td', 'is-number', value === null ? 'No data' : measure.show(value, page)),
      el('td', '', measure.target),
      el('td', '', measure.source),
      el('td', 'is-number', value === null ? '–' : String(Math.round(measurePoints(value, measure) * 100))),
    );
    body.append(row);
  }
  table.append(head, body);
  return table;
}

function renderScorecard(sessions) {
  const container = $('scorecard');
  const { pages, screensLeftOut } = summarizePages(sessions);
  const leftOutNote = 'Sites on another address are scored one screen at a time, because their screens can\'t be matched between sessions. Pick one session above to see them.';
  if (!pages.length) {
    container.replaceChildren(el('p', 'r-empty', screensLeftOut ? leftOutNote : 'No page scores here yet. Sessions recorded from now on are scored automatically.'));
    return;
  }

  const table = el('table', 'r-scores');
  const headRow = el('tr');
  for (const heading of ['Page', ...SCORECARD.map(({ title }) => title)]) {
    const cell = el('th', '', heading);
    cell.scope = 'col';
    headRow.append(cell);
  }
  const head = el('thead');
  head.append(headRow);
  const body = el('tbody');
  for (const page of pages) {
    const row = el('tr');
    const name = el('th', '', page.label);
    name.scope = 'row';
    row.append(name, ...SCORECARD.map((group) => buildScoreCell(group, page)));
    body.append(row);
  }
  table.append(head, body);
  const scroll = el('div', 'r-scroll');
  scroll.append(table);

  const details = el('div', 'r-page-details');
  for (const page of pages) {
    const item = el('details');
    item.append(el('summary', '', `What makes up the scores for ${page.label}`));
    for (const group of SCORECARD) {
      const measures = el('div', 'r-scroll');
      measures.append(buildMeasureTable(group, page));
      item.append(measures);
    }
    details.append(item);
  }

  container.replaceChildren(scroll, details);
  if (screensLeftOut) container.append(el('p', 'r-note r-score-left-out', leftOutNote));
}

/* Charts */

function renderTiles(sessions) {
  const durationMs = sessions.reduce((sum, session) => sum + session.duration_ms, 0);
  const trackedMs = sessions.reduce((sum, session) => sum + session.tracked_ms, 0);
  const errors = sessions.map((session) => session.accuracy_px).filter((value) => value !== null);

  const tiles = [
    ['Sessions', String(sessions.length), `of ${sessionsOnSite().length} saved`],
    ['Time recorded', sessions.length ? formatDuration(durationMs) : '–', sessions.length ? `about ${formatDuration(durationMs / sessions.length)} per session` : ''],
    ['Face tracked', durationMs ? formatPercent(trackedMs / durationMs) : '–', 'of recorded time'],
    ['Typical gaze error', errors.length ? `${Math.round(median(errors))} px` : '–', errors.length > 1 ? 'median across sessions' : 'from the accuracy check'],
  ];
  $('tiles').replaceChildren(...tiles.map(([label, value, sub]) => {
    const tile = el('div', 'r-tile');
    tile.append(el('p', 'r-tile-label', label), el('p', 'r-tile-value', value), el('p', 'r-tile-sub', sub));
    return tile;
  }));
}

function renderAttention(sessions) {
  const container = $('attention');
  const regions = summarizeRegions(sessions);
  if (!regions.length) {
    container.replaceChildren(el('p', 'r-empty', 'No region data here. Regions need a page with marked areas on the same address as this tool.'));
    return;
  }

  const largest = Math.max(...regions.map(({ share }) => share)) || 1;
  const bars = el('div', 'r-bars');
  for (const { name, share, totalMs } of regions) {
    const row = el('div', name === ELSEWHERE ? 'r-bar-row is-other' : 'r-bar-row');
    row.tabIndex = 0;
    setTip(row, formatPercent(share), `${name} · ${formatDuration(totalMs)} of gaze`);
    const plot = el('div', 'r-bar-plot');
    const bar = el('div', 'r-bar');
    bar.style.setProperty('--value', share / largest);
    plot.append(bar, el('span', 'r-bar-value', formatPercent(share)));
    row.append(el('span', '', name), plot);
    bars.append(row);
  }
  container.replaceChildren(bars);
}

function renderMatrix(sessions) {
  const container = $('matrix');
  const measured = sessions.filter(hasRegionData);
  if (!measured.length) {
    container.replaceChildren(el('p', 'r-empty', 'No region data to compare yet.'));
    return;
  }

  const regions = summarizeRegions(measured);
  const largest = Math.max(...measured.flatMap((session) => regions.map(({ name }) => regionShare(session, name)))) || 1;
  const table = el('table', 'r-matrix');
  const headRow = el('tr');
  const corner = el('th', '', 'Region');
  corner.scope = 'col';
  headRow.append(corner);
  for (const session of measured) {
    const heading = el('th', '', session.name);
    heading.scope = 'col';
    heading.title = `${session.name}, ${formatDate(session.started_at)}`;
    headRow.append(heading);
  }
  const head = el('thead');
  head.append(headRow);

  const body = el('tbody');
  for (const { name } of regions) {
    const row = el('tr');
    const heading = el('th', '', name);
    heading.scope = 'row';
    row.append(heading);
    for (const session of measured) {
      const share = regionShare(session, name);
      const strength = Math.round((share / largest) * 85);
      const cell = el('td', '', formatPercent(share));
      cell.style.background = `color-mix(in srgb, var(--accent) ${strength}%, var(--surface))`;
      if (strength > 55) cell.style.color = '#ffffff';
      row.append(cell);
    }
    body.append(row);
  }
  table.append(head, body);
  container.replaceChildren(table);
}

function imageUrl(image) {
  return store.images[image.id] || `/api/images/${image.id}`;
}

function renderHeatMaps(sessions) {
  const gallery = $('heat-gallery');
  gallery.replaceChildren();
  const single = sessions.length === 1;
  const entries = sessions.flatMap((session) => session.images
    .filter((image) => single || image.kind === 'overview')
    .map((image) => ({ session, image })));

  $('heat-note').textContent = entries.length
    ? (single ? 'Every screen captured in this session. Open one to see it full size.' : 'One overview per session. Pick a single session above to see each screen.')
    : 'No heat maps here. A session only has them if the heat map option was on and the tab was shared while recording.';

  for (const { session, image } of entries) {
    const figure = el('figure');
    const link = el('a');
    link.href = imageUrl(image);
    link.target = '_blank';
    link.rel = 'noopener';
    const picture = el('img');
    picture.src = imageUrl(image);
    picture.loading = 'lazy';
    picture.width = image.width;
    picture.height = image.height;
    const title = image.kind === 'overview' ? 'all screens' : `screen ${image.position + 1}`;
    picture.alt = `Heat map of ${title} from ${session.name}`;
    link.append(picture);
    figure.append(link, el('figcaption', '', `${session.name} · ${title} · ${formatDuration(image.gaze_ms)} of gaze`));
    gallery.append(figure);
  }
}

function renderAccuracy() {
  const container = $('accuracy');
  const sessions = sessionsOnSite().filter((session) => session.accuracy_px !== null);
  if (!sessions.length) {
    container.replaceChildren(el('p', 'r-empty', 'No accuracy checks saved yet.'));
    return;
  }

  const highest = Math.max(...sessions.map((session) => session.accuracy_px));
  const scaleMax = Math.max(300, Math.ceil((highest * 1.1) / 100) * 100);
  const yPercent = (value) => 100 - (value / scaleMax) * 100;

  const plot = el('div', 'r-accuracy-plot');
  const lines = [
    [0, ''],
    [GOOD_ERROR_PX, `${GOOD_ERROR_PX} px · good up to here`],
    [USABLE_ERROR_PX, `${USABLE_ERROR_PX} px · typical for a webcam up to here`],
    [scaleMax, `${scaleMax} px`],
  ];
  for (const [value, label] of lines) {
    const line = el('div', value === 0 ? 'r-accuracy-line r-accuracy-baseline' : 'r-accuracy-line');
    line.style.top = `${yPercent(value)}%`;
    if (label) line.append(el('span', '', label));
    plot.append(line);
  }

  sessions.forEach((session, index) => {
    const reliable = isReliable(session);
    const selected = String(session.id) === view.selection;
    const hit = el('button', `r-dot-hit${reliable ? '' : ' is-unreliable'}${selected ? ' is-selected' : ''}`);
    hit.type = 'button';
    hit.style.left = `${((index + 0.5) / sessions.length) * 100}%`;
    hit.style.top = `${yPercent(session.accuracy_px)}%`;
    hit.setAttribute('aria-label', `${session.name}: ${session.accuracy_px} pixels of error. View this session.`);
    setTip(hit, `${session.accuracy_px} px`, `${session.name} · ${formatDate(session.started_at)}`);
    hit.addEventListener('click', () => selectSession(String(session.id)));
    hit.append(el('span', 'r-dot'));
    plot.append(hit);
  });

  const legend = el('p', 'r-legend');
  const key = (className, text) => {
    const item = el('span');
    item.append(el('i', className), document.createTextNode(text));
    return item;
  };
  legend.append(key('', 'Reliable'), key('is-unreliable', 'Not reliable'));
  container.replaceChildren(plot, legend);
}

function renderSessionTable() {
  const sessions = [...sessionsOnSite()].reverse();
  const table = el('table', 'r-table');
  const headRow = el('tr');
  for (const heading of ['Session', 'Date', 'Length', 'Face tracked', 'Gaze error', 'Quality', 'Screens', '']) {
    const cell = el('th', '', heading);
    cell.scope = 'col';
    headRow.append(cell);
  }
  const head = el('thead');
  head.append(headRow);

  const body = el('tbody');
  for (const session of sessions) {
    const selected = String(session.id) === view.selection;
    const row = el('tr', selected ? 'is-selected' : '');
    const name = el('td');
    name.append(el('strong', '', session.name));
    if (session.site_url) name.append(el('small', '', session.site_url));
    if (session.notes) name.append(el('small', '', session.notes));

    const quality = describeQuality(session);
    const qualityCell = el('td');
    qualityCell.append(el('span', `r-quality is-${quality.tone}`, `${quality.icon} ${quality.label}`));

    const screens = session.images.filter(({ kind }) => kind === 'screen').length;
    const action = el('td');
    const viewButton = el('button', '', selected ? 'Viewing' : 'View');
    viewButton.type = 'button';
    viewButton.disabled = selected;
    viewButton.setAttribute('aria-label', `View ${session.name}`);
    viewButton.addEventListener('click', () => {
      selectSession(String(session.id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    action.append(viewButton);

    row.append(
      name,
      el('td', 'is-number', formatDate(session.started_at)),
      el('td', 'is-number', formatDuration(session.duration_ms)),
      el('td', 'is-number', formatPercent(faceShare(session))),
      el('td', 'is-number', session.accuracy_px === null ? '–' : `${session.accuracy_px} px`),
      qualityCell,
      el('td', 'is-number', session.heatmap_on ? String(screens) : '–'),
      action,
    );
    body.append(row);
  }
  table.append(head, body);
  $('session-table').replaceChildren(table);
}

function renderSelectionNote(sessions) {
  const note = $('selection-note');
  const left = sessionsOnSite().length - sessions.length;
  note.hidden = false;
  if (view.selection === RELIABLE && left > 0) {
    note.textContent = `${plural(left, 'session')} left out because the tracking wasn't reliable enough. Choose "All sessions" to include them.`;
  } else if (view.selection !== RELIABLE && view.selection !== ALL && sessions[0] && !isReliable(sessions[0])) {
    note.textContent = "This session's tracking wasn't reliable, so treat its results as a rough guide.";
  } else if (view.site === ALL_SITES) {
    note.textContent = 'Different websites are mixed here, so regions with the same name may not be the same thing.';
  } else {
    note.hidden = true;
  }
}

function render() {
  const sessions = selectedSessions();
  renderSelectionNote(sessions);
  renderTiles(sessions);
  renderScorecard(sessions);
  renderAttention(sessions);
  renderMatrix(sessions);
  renderHeatMaps(sessions);
  renderAccuracy();
  renderSessionTable();
}

/* Back. The page only opens from a button in the tracker, usually in its own tab so a
   running test keeps its camera and calibration. Back returns to that tab. */

function goBack() {
  if (window.opener && !window.opener.closed) {
    window.close();
    // Only runs if the browser refused to close the tab, so Back never does nothing.
    setTimeout(() => { window.location.href = '/'; }, 200);
    return;
  }
  if (snapshot || document.referrer.startsWith(window.location.origin)) window.history.back();
  else window.location.href = '/';
}

/* Standalone download: one HTML file with the styles, code, data and images inside it. */

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function fetchChecked(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} replied ${response.status}`);
  return response;
}

async function downloadHtml() {
  const button = $('download-html');
  button.disabled = true;
  button.textContent = 'Preparing...';
  try {
    const [page, baseCss, resultsCss, scoreCode, code] = await Promise.all(
      ['results.html', 'styles.css', 'results.css', 'scorecard.js', 'results.js'].map(async (file) => (await fetchChecked(file)).text()),
    );

    const images = { ...store.images };
    for (const session of store.sessions) {
      for (const image of session.images) {
        if (!images[image.id]) images[image.id] = await blobToDataUrl(await (await fetchChecked(imageUrl(image))).blob());
      }
    }

    // Escaped so nothing in a session name or note can end the script block early.
    const data = JSON.stringify({ sessions: store.sessions, images, demo: store.demo }).replace(/</g, '\\u003c');
    const html = page
      .replace('<link rel="stylesheet" href="styles.css">', () => `<style>${baseCss}</style>`)
      .replace('<link rel="stylesheet" href="results.css">', () => `<style>${resultsCss}</style>`)
      .replace('<script src="scorecard.js"><\/script>', () => `<script>${scoreCode}<\/script>`)
      .replace('<script src="results.js"><\/script>', () => `<script>window.RESULTS_SNAPSHOT = ${data};<\/script>\n<script>${code}<\/script>`);

    const link = el('a');
    link.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    link.download = 'test-results.html';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    button.textContent = 'Download as HTML';
  } catch (error) {
    button.textContent = 'Download failed. Try again';
    console.error(error);
  } finally {
    button.disabled = false;
  }
}

/* Start */

async function loadResults() {
  if (snapshot) return snapshot;
  if (isDemo) {
    await new Promise((resolve, reject) => {
      const script = el('script');
      script.src = 'results-demo.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('the demo data could not be loaded'));
      document.head.append(script);
    });
    return window.buildDemoResults();
  }
  const response = await fetch('/api/sessions');
  if (!response.ok) throw new Error(`the server replied ${response.status}`);
  return { sessions: await response.json(), images: {}, demo: false };
}

async function start() {
  $('usable-limit').textContent = USABLE_ERROR_PX;
  $('face-limit').textContent = Math.round(MIN_FACE_RATIO * 100);
  $('focus-minimum').textContent = MIN_FOCUS_GAZE_MS / 1000;
  $('go-back').addEventListener('click', goBack);
  // A downloaded copy opened on its own has nowhere to go back to.
  if (snapshot && window.history.length < 2) $('go-back').hidden = true;

  let results;
  try {
    results = await loadResults();
  } catch (error) {
    $('r-summary').textContent = `Saved sessions could not be loaded: ${error.message}.`;
    return;
  }
  Object.assign(store, results);
  $('demo-banner').hidden = !store.demo;

  if (!store.sessions.length) {
    $('r-summary').textContent = 'Nothing saved yet. Stop a recording and choose "Save to database", and it will appear here.';
    return;
  }

  $('r-summary').textContent = `${plural(store.sessions.length, 'saved session')}. Last one ${formatDate(store.sessions.reduce((latest, { started_at: at }) => (at > latest ? at : latest), ''))}.`;
  if (!snapshot) {
    $('download-html').hidden = false;
    $('download-html').addEventListener('click', downloadHtml);
  }
  buildFilters();
  $('dashboard').hidden = false;
  render();

  $('site-filter').addEventListener('change', (event) => {
    view.site = event.target.value;
    buildSessionFilter();
    render();
  });
  $('session-filter').addEventListener('change', (event) => {
    view.selection = event.target.value;
    render();
  });
}

start();
