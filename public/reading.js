// Recognises reading from gaze. A webcam can't see which word someone is on, but reading has a
// shape it can see: the eyes drift steadily across a line, then jump back to start the next one.
const READING_SMOOTH_MS = 200;
const READING_MIN_SWEEP_PX = 120;
const READING_SWEEP_SHARE = 0.45;
const READING_SWEEP_MS = 450;
const READING_MIN_LINE_MS = 700;
const READING_MAX_LINE_MS = 7000;
// A line is read at a walking pace. Faster is a glance across, and much slower is staring.
const READING_MIN_SPEED = 40;
const READING_MAX_SPEED = 900;
// A real line builds up gradually, where a glance across gets there all at once.
const READING_MIN_GRADUAL_SHARE = 0.3;
// One sweep can happen by chance, so a line only counts once another follows soon after.
const READING_CONFIRM_GAP_MS = 9000;

function createReadingDetector(onLine) {
  let recent = [];
  let line = null;
  let waiting = null;

  function smoothed(sample) {
    recent.push(sample);
    while (recent[0].t < sample.t - READING_SMOOTH_MS) recent.shift();
    const values = recent.map(({ x }) => x).sort((a, b) => a - b);
    return values[Math.floor(values.length / 2)];
  }

  // How much of the line's duration it took to go from 20% to 80% of the way across.
  function gradualShare(points, start, end) {
    const span = end - start;
    if (span <= 0) return 0;
    const low = points.find(({ x }) => x >= start + span * 0.2);
    const high = points.find(({ x }) => x >= start + span * 0.8);
    if (!low || !high) return 0;
    const peakTime = points.reduce((best, point) => (point.x > best.x ? point : best), points[0]).t;
    const duration = peakTime - points[0].t;
    return duration > 0 ? (high.t - low.t) / duration : 0;
  }

  function isReadLine(points, peak) {
    const start = points[0];
    const across = peak.x - start.x;
    const duration = peak.t - start.t;
    if (duration < READING_MIN_LINE_MS || duration > READING_MAX_LINE_MS) return false;
    const speed = across / (duration / 1000);
    if (speed < READING_MIN_SPEED || speed > READING_MAX_SPEED) return false;
    return gradualShare(points.filter(({ t }) => t <= peak.t), start.x, peak.x) >= READING_MIN_GRADUAL_SHARE;
  }

  function startLine(point) {
    line = { points: [point], peak: point };
  }

  return {
    reset() {
      recent = [];
      line = null;
      waiting = null;
    },
    // lineWidth: how wide the text under the gaze is. target: passed through to onLine with each point.
    update(x, t, lineWidth, target) {
      const point = { x: smoothed({ x, t }), t, target };
      if (!line) {
        startLine(point);
        return;
      }
      line.points.push(point);
      if (point.x >= line.peak.x) line.peak = point;

      const sweepNeeded = Math.max(READING_MIN_SWEEP_PX, lineWidth * READING_SWEEP_SHARE);
      const swept = line.peak.x - point.x >= sweepNeeded && t - line.peak.t <= READING_SWEEP_MS;
      if (swept) {
        const across = line.peak.x - line.points[0].x;
        if (across >= sweepNeeded * 0.7 && isReadLine(line.points, line.peak)) {
          const found = { start: line.points[0].t, end: line.peak.t, points: line.points.filter((item) => item.t <= line.peak.t) };
          if (waiting && found.start - waiting.end <= READING_CONFIRM_GAP_MS) {
            if (!waiting.credited) onLine(waiting);
            onLine(found);
            found.credited = true;
          }
          waiting = found;
        }
        startLine(point);
        return;
      }

      // Too long on one attempt, or the gaze wandered back: begin again from here.
      const stale = t - line.points[0].t > READING_MAX_LINE_MS;
      const wentBack = t - line.peak.t > READING_SWEEP_MS && line.peak.x - point.x < sweepNeeded * 0.3 && point.x < line.points[0].x;
      if (stale || wentBack) startLine(point);
    },
  };
}
