/* Live page score in the recorder. Uses the same measurements and scales as a saved
   session. It stops refreshing while recording, when the recorder collapses so that
   nothing draws the eye. */

const LIVE_SCORE_MS = 1000;
const LIVE_MEASURE_MS = 2000;
// Measuring may take at most this share of the time, so a huge page doesn't slow gaze tracking.
const LIVE_MEASURE_SHARE = 0.05;
const MAX_LIVE_SAMPLES = 9000;

const live = { pageKey: null, layout: null, pixels: null, samples: [], gazeMs: 0, nextMeasureAt: 0 };

function resetLiveScore() {
  live.samples = [];
  live.gazeMs = 0;
  live.nextMeasureAt = 0;
}

function syncLivePage() {
  const key = currentPageKey();
  if (key === live.pageKey) return;
  live.pageKey = key;
  live.layout = null;
  live.pixels = null;
  resetLiveScore();
}

function recordLiveGaze(x, y, ms) {
  syncLivePage();
  live.samples.push({ x, y, ms });
  live.gazeMs += ms;
  if (live.samples.length > MAX_LIVE_SAMPLES) live.gazeMs -= live.samples.shift().ms;
}

// Without capture limited to the page, the open recorder would be measured as part of it.
function readLivePixels() {
  const { video } = tabCapture;
  if (!video || !video.videoWidth || !window.RestrictionTarget) return null;
  const frame = document.createElement('canvas');
  frame.width = video.videoWidth;
  frame.height = video.videoHeight;
  frame.getContext('2d').drawImage(video, 0, 0);
  return scanFramePixels(frame);
}

function measureLivePage() {
  const startedAt = performance.now();
  const page = frameDocument();
  try {
    if (!page) live.layout = null;
    else if (page.readyState === 'complete') live.layout = scanPageLayout(page);
    live.pixels = readLivePixels();
  } catch (error) {
    // A page that can't be measured shouldn't interrupt the live view.
    console.error(error);
  }
  const spentMs = performance.now() - startedAt;
  live.nextMeasureAt = startedAt + Math.max(LIVE_MEASURE_MS, spentMs / LIVE_MEASURE_SHARE);
}

function livePageSummary() {
  const hasFocus = live.gazeMs >= MIN_FOCUS_GAZE_MS;
  return {
    layout: live.layout && live.layout.words ? live.layout : null,
    pixels: live.pixels,
    focus: hasFocus ? gazeFocus(live.samples, stageArea()).focus : null,
    focusSessions: 0,
  };
}

function buildLiveTile(group, page) {
  const { score, known, total } = scoreGroup(group, page);
  const tile = document.createElement('div');
  tile.className = 'live-score-tile';
  const add = (className, text) => {
    const line = document.createElement('span');
    line.className = className;
    line.textContent = text;
    tile.append(line);
  };

  add('live-score-title', group.title);
  add('live-score-value', score === null ? '–' : String(score));
  if (score !== null) {
    const status = describeScore(score, group.labels);
    add(`live-score-status is-${status.tone}`, `${status.icon} ${status.label}`);
    if (known < total) add('live-score-basis', `from ${known} of ${total} measures`);
  } else if (group.title === 'Gaze focus') {
    add('live-score-basis', `${Math.floor(live.gazeMs / 1000)}s of ${MIN_FOCUS_GAZE_MS / 1000}s of gaze`);
  } else {
    add('live-score-basis', 'No data');
  }
  return tile;
}

function liveScoreNote(page) {
  const addHeatMap = page.pixels ? '' : ' Turn on Heat map to score the screen itself.';
  if (!frameDocument()) return `This site is on another address, so Hierarchy and Readability can't be read.${addHeatMap}`;
  if (!page.layout) return 'Reading this page. A page with no readable text can only be scored from the screen.';
  return addHeatMap.trim();
}

function renderLiveMeasures(page) {
  const rows = [];
  for (const group of SCORECARD) {
    const title = document.createElement('h4');
    title.textContent = group.title;
    rows.push(title);
    for (const measure of group.measures) {
      const value = measure.read(page);
      const row = document.createElement('p');
      const label = document.createElement('span');
      label.textContent = measure.label;
      const reading = document.createElement('strong');
      reading.textContent = value === null ? 'No data' : measure.show(value, page);
      const target = document.createElement('small');
      target.textContent = value === null ? `Target: ${measure.target}` : `${Math.round(measurePoints(value, measure) * 100)} points · target: ${measure.target}`;
      row.append(label, reading, target);
      rows.push(row);
    }
  }
  $('live-score-measures').replaceChildren(...rows);
}

function refreshLiveScore() {
  if (state.phase !== 'live' || recording.active || $('dock-body').hidden) return;
  syncLivePage();
  if (performance.now() >= live.nextMeasureAt) measureLivePage();

  const page = livePageSummary();
  $('live-score-page').textContent = live.pageKey || 'This site';
  $('live-score-page').title = live.pageKey || '';
  $('live-score-grid').replaceChildren(...SCORECARD.map((group) => buildLiveTile(group, page)));
  $('live-score-note').textContent = liveScoreNote(page);
  if ($('live-score-details').open) renderLiveMeasures(page);
}
