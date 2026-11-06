/* global RealEye, isBlinking */
// Runs the camera and RealEye Light's tracker, and steadies what comes out of it.
// Its files are served from this computer, so nothing about the camera or tracker leaves it.
const TRACKER_FILES = { modelPath: '/vendor/face_landmarker.task', wasmPath: '/vendor/mediapipe-wasm' };
// More pixels around the eyes helps the tracker, which works from small crops of them.
const CAMERA_CONSTRAINTS = { video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' }, audio: false };
const STEPPED_DOWN_CAMERA = { width: { ideal: 1280 }, height: { ideal: 720 } };

const IRIS_LANDMARK_COUNT = 478;
const MIN_CALIBRATION_SAMPLES = 5;
const MAX_RIDGE_RETRIES = 6;
// Calibration samples further than this from their dot's typical reading are likely glances away.
const OUTLIER_SPREADS = 3;
const MIN_OUTLIER_DISTANCE = 0.03;

// Webcam readings wobble even when the eyes are still. Readings within that wobble are averaged
// calmly, and the further one lands beyond it, the faster the dot follows. Past a few times the
// wobble it jumps, once the reading has held for a moment so a single stray frame can't move it.
const DEFAULT_WOBBLE_PX = 65;
const MIN_WOBBLE_PX = 25;
const MAX_WOBBLE_PX = 120;
const CALM_FOLLOW_MS = 300;
const QUICK_FOLLOW_MS = 60;
const JUMP_WOBBLES = 2.2;
const JUMP_CONFIRM_MS = 70;

// How a correction may vary across the window, simplest first. Positions run from -0.5 to 0.5.
const CORRECTION_SHAPES = [
  { name: 'shift', basis: () => [1] },
  { name: 'tilt', basis: (x, y) => [1, x, y] },
  { name: 'curve', basis: (x, y) => [1, x, y, x * x, y * y, x * y] },
];
const MIN_CORRECTION_IMPROVEMENT = 0.9;

// RealEye Light uses one barely-there regularization for everyone, which lets noise in the eye
// images through. These are tried on each person's own accuracy-check frames, and the best kept.
const RIDGE_CANDIDATES = [1e-5, 10, 100, 1000, 3000, 10000, 30000];
// Wobble counts against a setting too, at half weight, because it's what a person sees most.
const WOBBLE_WEIGHT = 0.5;
const MAX_CORRECTION_PX = 300;
const CORRECTION_RIDGE = 1e-3;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/* What the eyes are doing, measured from the face landmarks */

function readEyeSignals(points) {
  if (!points || points.length < IRIS_LANDMARK_COUNT) return null;
  const between = (a, b) => Math.hypot(points[a][0] - points[b][0], points[a][1] - points[b][1]);

  const eye = (irisStart, leftCorner, rightCorner, upperLid, lowerLid) => {
    let irisX = 0;
    let irisY = 0;
    for (let i = 0; i < 5; i += 1) {
      irisX += points[irisStart + i][0] / 5;
      irisY += points[irisStart + i][1] / 5;
    }
    const [ax, ay] = points[leftCorner];
    const [bx, by] = points[rightCorner];
    const axisX = bx - ax;
    const axisY = by - ay;
    const widthSquared = axisX * axisX + axisY * axisY;
    const dx = irisX - (ax + bx) / 2;
    const dy = irisY - (ay + by) / 2;
    return {
      u: (dx * axisX + dy * axisY) / widthSquared,
      v: (axisX * dy - axisY * dx) / widthSquared,
      open: between(upperLid, lowerLid) / Math.sqrt(widthSquared),
    };
  };
  const right = eye(468, 33, 133, 159, 145);
  const left = eye(473, 362, 263, 386, 374);

  const [noseX, noseY] = points[1];
  return {
    u: (right.u + left.u) / 2,
    v: (right.v + left.v) / 2,
    open: (right.open + left.open) / 2,
    yaw: (noseX - (points[234][0] + points[454][0]) / 2) / between(234, 454),
    pitch: (noseY - (points[10][1] + points[152][1]) / 2) / between(10, 152),
  };
}

/* Steadying */

function createStabilizer() {
  let position = null;
  let time = 0;
  let pending = [];
  let pendingSince = 0;
  return {
    reset() {
      position = null;
      pending = [];
    },
    update(x, y, now) {
      if (!position) {
        position = { x, y };
        time = now;
        return position;
      }
      const elapsed = Math.max(now - time, 0);
      time = now;

      const wobble = gazeEngine.wobblePx;
      const jumpDistance = wobble * JUMP_WOBBLES;
      const distance = Math.hypot(x - position.x, y - position.y);
      if (distance <= jumpDistance) {
        pending = [];
        const urgency = Math.min(Math.max((distance - wobble) / (jumpDistance - wobble), 0), 1);
        const followMs = CALM_FOLLOW_MS + (QUICK_FOLLOW_MS - CALM_FOLLOW_MS) * urgency;
        const blend = 1 - Math.exp(-elapsed / followMs);
        position = { x: position.x + (x - position.x) * blend, y: position.y + (y - position.y) * blend };
        return position;
      }

      // A real move lands consistently in one new place, whereas noise scatters.
      const last = pending[pending.length - 1];
      if (last && Math.hypot(x - last.x, y - last.y) > jumpDistance) pending = [];
      if (!pending.length) pendingSince = now;
      pending.push({ x, y });
      if (pending.length >= 2 && now - pendingSince >= JUMP_CONFIRM_MS) {
        position = {
          x: pending.reduce((sum, point) => sum + point.x, 0) / pending.length,
          y: pending.reduce((sum, point) => sum + point.y, 0) / pending.length,
        };
        pending = [];
      }
      return position;
    },
  };
}

/* Camera and tracker */

const gazeEngine = {
  tracker: null,
  stream: null,
  video: null,
  canvas: document.createElement('canvas'),
  context: null,
  running: false,
  lastVideoTime: -1,
  onFrame: null,
  steppedDown: false,
  image: null,
  detection: null,
  points: null,
  samples: [],
  training: null,
  tuning: null,
  deviceId: null,
  stabilizer: createStabilizer(),
  latestOutput: null,
  latestRaw: null,
  wobblePx: DEFAULT_WOBBLE_PX,
  correction: null,
  recenter: { x: 0, y: 0 },
  fitMs: 0,
  ridgeLambda: 0,
};

async function createTracker() {
  try {
    const tracker = new RealEye.WebcamETLight({ ...TRACKER_FILES, delegate: 'GPU' });
    await tracker.initialize();
    return tracker;
  } catch (error) {
    console.warn('GPU tracking is unavailable, so falling back to CPU.', error);
    const tracker = new RealEye.WebcamETLight({ ...TRACKER_FILES, delegate: 'CPU' });
    await tracker.initialize();
    return tracker;
  }
}

// For a computer that can't keep up at full resolution.
function stepDownCamera() {
  if (gazeEngine.steppedDown) return;
  gazeEngine.steppedDown = true;
  const [track] = gazeEngine.stream ? gazeEngine.stream.getVideoTracks() : [];
  if (track) track.applyConstraints(STEPPED_DOWN_CAMERA).catch(() => {});
}

function stopGazeEngine() {
  gazeEngine.running = false;
  if (gazeEngine.stream) gazeEngine.stream.getTracks().forEach((track) => track.stop());
  gazeEngine.stream = null;
  if (gazeEngine.video) gazeEngine.video.srcObject = null;
  gazeEngine.image = null;
  gazeEngine.detection = null;
  gazeEngine.points = null;
}

function cameraConstraints() {
  if (!gazeEngine.deviceId) return CAMERA_CONSTRAINTS;
  return { ...CAMERA_CONSTRAINTS, video: { ...CAMERA_CONSTRAINTS.video, deviceId: { exact: gazeEngine.deviceId } } };
}

async function switchCamera(deviceId) {
  gazeEngine.deviceId = deviceId;
  const stream = await navigator.mediaDevices.getUserMedia(cameraConstraints());
  if (gazeEngine.stream) gazeEngine.stream.getTracks().forEach((track) => track.stop());
  gazeEngine.stream = stream;
  gazeEngine.steppedDown = false;
  gazeEngine.video.srcObject = stream;
  await gazeEngine.video.play();
}

async function startGazeEngine(video, onFrame) {
  gazeEngine.stream = await navigator.mediaDevices.getUserMedia(cameraConstraints());
  gazeEngine.steppedDown = false;
  gazeEngine.video = video;
  gazeEngine.onFrame = onFrame;
  try {
    video.srcObject = gazeEngine.stream;
    await video.play();
    gazeEngine.tracker = gazeEngine.tracker || await createTracker();
  } catch (error) {
    stopGazeEngine();
    throw error;
  }
  gazeEngine.context = gazeEngine.canvas.getContext('2d', { willReadFrequently: true });
  gazeEngine.lastVideoTime = -1;
  gazeEngine.running = true;
  requestAnimationFrame(runGazeLoop);
}

function predictGaze(image, detection) {
  if (!gazeEngine.tracker.isCalibrated()) return null;
  // Lids hide the iris during a blink, so hold the last position instead of jumping.
  if (gazeEngine.latestOutput && isBlinking()) return gazeEngine.latestOutput;

  const raw = gazeEngine.tracker.predictWithDetection(image, detection);
  if (!Number.isFinite(raw.x) || !Number.isFinite(raw.y)) return gazeEngine.latestOutput;
  gazeEngine.latestRaw = raw;
  gazeEngine.latestOutput = gazeEngine.stabilizer.update(raw.x, raw.y, performance.now());
  return gazeEngine.latestOutput;
}

function runGazeLoop() {
  if (!gazeEngine.running) return;
  requestAnimationFrame(runGazeLoop);

  const { video, canvas, context, tracker } = gazeEngine;
  if (video.readyState < 2 || !video.videoWidth || video.currentTime === gazeEngine.lastVideoTime) return;
  gazeEngine.lastVideoTime = video.currentTime;

  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
  context.drawImage(video, 0, 0);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);

  let detection = null;
  try {
    detection = tracker.detectFace(image);
  } catch (error) {
    console.error('Face tracking failed on a frame.', error);
  }

  gazeEngine.image = image;
  gazeEngine.detection = detection;
  gazeEngine.points = detection && detection.allLandmarks
    ? detection.allLandmarks.map((point) => [point.x * image.width, point.y * image.height])
    : null;

  // Runs first, because whether this is a blink depends on the face just read.
  gazeEngine.onFrame(gazeEngine.points, image);

  let gaze = null;
  if (detection) {
    gaze = predictGaze(image, detection);
  } else {
    gazeEngine.stabilizer.reset();
    gazeEngine.latestOutput = null;
  }
  gazeEngine.onGaze(gaze);
}

/* Calibration */

function resetGazeModel() {
  gazeEngine.samples = [];
  gazeEngine.training = null;
  gazeEngine.tuning = null;
  gazeEngine.latestOutput = null;
  gazeEngine.latestRaw = null;
  gazeEngine.wobblePx = DEFAULT_WOBBLE_PX;
  gazeEngine.correction = null;
  gazeEngine.recenter = { x: 0, y: 0 };
  gazeEngine.stabilizer.reset();
  if (gazeEngine.tracker) gazeEngine.tracker.reset();
}

// Features are taken now rather than at the end, so dozens of full video frames aren't held in memory.
function addCalibrationSample(x, y) {
  const { image, detection, tracker } = gazeEngine;
  if (!image || !detection || !detection.allLandmarks) return false;
  const { eyeWidth, eyeHeight } = tracker.getConfig();
  const features = RealEye.extractAugmentedFeatures(
    image, detection.boundingBox, detection.keypoints, detection.allLandmarks, image.width, image.height,
    eyeWidth, eyeHeight, detection.blendshapes, detection.headPose,
  );
  gazeEngine.samples.push({
    rows: features.map((row) => Float64Array.from(row)),
    eyeWidthPx: Math.hypot(gazeEngine.points[33][0] - gazeEngine.points[133][0], gazeEngine.points[33][1] - gazeEngine.points[133][1]),
    gazeX: x,
    gazeY: y,
    signals: readEyeSignals(gazeEngine.points),
  });
  return true;
}

function keepSteadySamples(samples) {
  const byDot = new Map();
  for (const sample of samples) {
    const key = `${sample.gazeX},${sample.gazeY}`;
    if (!byDot.has(key)) byDot.set(key, []);
    byDot.get(key).push(sample);
  }
  const kept = [];
  for (const group of byDot.values()) {
    if (!group.every((sample) => sample.signals)) {
      kept.push(...group);
      continue;
    }
    const middle = { u: median(group.map((sample) => sample.signals.u)), v: median(group.map((sample) => sample.signals.v)) };
    const limit = (key) => Math.max(OUTLIER_SPREADS * median(group.map((sample) => Math.abs(sample.signals[key] - middle[key]))), MIN_OUTLIER_DISTANCE);
    const limitU = limit('u');
    const limitV = limit('v');
    kept.push(...group.filter(({ signals }) => Math.abs(signals.u - middle.u) <= limitU && Math.abs(signals.v - middle.v) <= limitV));
  }
  return kept;
}

function solvePositiveDefinite(matrix, right) {
  const size = matrix.length;
  const lower = matrix.map(() => new Float64Array(size));
  for (let i = 0; i < size; i += 1) {
    const rowI = lower[i];
    for (let j = 0; j <= i; j += 1) {
      const rowJ = lower[j];
      let sum = matrix[i][j];
      for (let k = 0; k < j; k += 1) sum -= rowI[k] * rowJ[k];
      if (i === j) {
        if (sum <= 0) return null;
        rowI[i] = Math.sqrt(sum);
      } else {
        rowI[j] = sum / rowJ[j];
      }
    }
  }
  return right.map((values) => {
    const forward = new Float64Array(size);
    for (let i = 0; i < size; i += 1) {
      let sum = values[i];
      for (let k = 0; k < i; k += 1) sum -= lower[i][k] * forward[k];
      forward[i] = sum / lower[i][i];
    }
    const result = new Float64Array(size);
    for (let i = size - 1; i >= 0; i -= 1) {
      let sum = forward[i];
      for (let k = i + 1; k < size; k += 1) sum -= lower[k][i] * result[k];
      result[i] = sum / lower[i][i];
    }
    return result;
  });
}

// Gives the same answer as the tracker's own fit, which solves for every feature (about 1,600).
// There are fewer rows than features, so solving for the rows instead takes a fraction of the time.
function buildKernel(rows) {
  const count = rows.length;
  const features = rows[0].length;
  const kernel = rows.map(() => new Float64Array(count));
  for (let i = 0; i < count; i += 1) {
    const rowI = rows[i];
    for (let j = 0; j <= i; j += 1) {
      const rowJ = rows[j];
      let sum = 0;
      for (let k = 0; k < features; k += 1) sum += rowI[k] * rowJ[k];
      kernel[i][j] = sum;
      kernel[j][i] = sum;
    }
  }
  return kernel;
}

function solveRidge(kernel, rows, targets, strength) {
  const matrix = kernel.map((row, i) => {
    const copy = Float64Array.from(row);
    copy[i] += strength;
    return copy;
  });
  const weights = solvePositiveDefinite(matrix, targets);
  if (!weights) return null;
  const features = rows[0].length;
  return weights.map((set) => {
    const coefficients = new Array(features).fill(0);
    for (let i = 0; i < rows.length; i += 1) {
      const weight = set[i];
      const row = rows[i];
      for (let k = 0; k < features; k += 1) coefficients[k] += weight * row[k];
    }
    return coefficients;
  });
}

// Does what the tracker's calibrate() does, using the features taken as each sample was captured.
function fitCalibration() {
  const { tracker } = gazeEngine;
  const started = performance.now();
  const samples = keepSteadySamples(gazeEngine.samples);
  if (samples.length < MIN_CALIBRATION_SAMPLES) return false;

  const rows = [];
  const targetX = [];
  const targetY = [];
  for (const sample of samples) {
    for (const row of sample.rows) {
      rows.push(row);
      targetX.push(sample.gazeX);
      targetY.push(sample.gazeY);
    }
    sample.rows = null;
  }

  try {
    const kernel = buildKernel(rows);
    let fitted = null;
    let strength = tracker.getConfig().ridgeLambda;
    for (let attempt = 0; attempt < MAX_RIDGE_RETRIES && !fitted; attempt += 1) {
      fitted = solveRidge(kernel, rows, [targetX, targetY], strength);
      if (!fitted) strength *= 100;
    }
    if (!fitted) return false;
    gazeEngine.ridgeLambda = strength;
    [tracker.coefficientsX, tracker.coefficientsY] = fitted;
    tracker.state = RealEye.TrackerState.Calibrated;
    gazeEngine.training = { rows, targetX, targetY, kernel };
    gazeEngine.fitMs = performance.now() - started;
    return true;
  } catch (error) {
    console.error('Calibration failed.', error);
    return false;
  }
}

// One frame's features, for trying other settings on it after the accuracy check.
function captureCheckRow() {
  const { image, detection, tracker } = gazeEngine;
  if (!image || !detection || !detection.allLandmarks) return null;
  const { useLandmarks, eyeWidth, eyeHeight } = tracker.getConfig();
  return Float64Array.from(RealEye.extractCombinedFeatures(
    image, detection.boundingBox, detection.keypoints, useLandmarks, detection.allLandmarks, image.width, image.height,
    eyeWidth, eyeHeight, detection.blendshapes, detection.headPose,
  ));
}

function typicalWobble(sets) {
  return median(sets.flatMap((samples) => {
    const meanX = samples.reduce((sum, sample) => sum + sample.x, 0) / samples.length;
    const meanY = samples.reduce((sum, sample) => sum + sample.y, 0) / samples.length;
    return samples.map((sample) => Math.hypot(sample.x - meanX, sample.y - meanY));
  }));
}

const nextPaint = () => new Promise((resolve) => setTimeout(resolve));

// Tries each setting on the accuracy-check frames, which it wasn't trained on, and keeps the best.
// measured: [{ target, frames: [{ row, t }] }]. Its samples are replaced with the winner's readings.
async function tuneModel(measured) {
  const { tracker, training } = gazeEngine;
  const started = performance.now();
  const { rows, targetX, targetY, kernel } = training;
  const dotsWithFrames = measured.filter(({ frames }) => frames.length);
  const { innerWidth: width, innerHeight: height } = window;

  const results = [];
  let best = null;
  for (const strength of RIDGE_CANDIDATES) {
    await nextPaint();
    const fitted = solveRidge(kernel, rows, [targetX, targetY], strength);
    if (!fitted) continue;
    const predict = (row) => {
      let x = 0;
      let y = 0;
      for (let i = 0; i < row.length; i += 1) {
        x += fitted[0][i] * row[i];
        y += fitted[1][i] * row[i];
      }
      return { x, y };
    };
    const dots = dotsWithFrames.map(({ target, frames }) => ({ target, rawSamples: frames.map(({ row }) => predict(row)) }));
    const correction = bestCorrection(dots.map(({ target, rawSamples }) => ({ target, samples: rawSamples })), width, height);
    const wobble = typicalWobble(dots.map(({ rawSamples }) => rawSamples));
    const score = correction.errorPx + WOBBLE_WEIGHT * wobble;
    results.push({ strength, errorPx: Math.round(correction.errorPx), wobblePx: Math.round(wobble) });
    if (!best || score < best.score) best = { score, strength, fitted, dots, wobble };
  }

  gazeEngine.training = null;
  if (!best) return;
  [tracker.coefficientsX, tracker.coefficientsY] = best.fitted;
  gazeEngine.wobblePx = Math.min(Math.max(best.wobble, MIN_WOBBLE_PX), MAX_WOBBLE_PX);

  // What the dot would have shown with this setting, for the score and the map.
  dotsWithFrames.forEach((dot, index) => {
    const { rawSamples } = best.dots[index];
    const stabilizer = createStabilizer();
    dot.rawSamples = rawSamples;
    dot.samples = rawSamples.map((sample, frame) => ({ ...stabilizer.update(sample.x, sample.y, dot.frames[frame].t) }));
    dot.frames = [];
  });
  gazeEngine.stabilizer.reset();
  gazeEngine.tuning = { strength: best.strength, ms: Math.round(performance.now() - started), results };
}

/* Adjusting to the accuracy check */

function fitShape(shape, dots, width, height) {
  const designs = dots.map(({ mean }) => shape.basis(mean.x / width - 0.5, mean.y / height - 0.5));
  const size = designs[0].length;
  const matrix = Array.from({ length: size }, (_, i) => {
    const row = new Float64Array(size);
    for (let j = 0; j < size; j += 1) {
      for (const design of designs) row[j] += design[i] * design[j];
    }
    row[i] += CORRECTION_RIDGE;
    return row;
  });
  const right = ['x', 'y'].map((axis) => Array.from({ length: size }, (_, i) =>
    dots.reduce((sum, { mean, target }, dot) => sum + designs[dot][i] * (target[axis] - mean[axis]), 0)));
  const weights = solvePositiveDefinite(matrix, right);
  return weights && { shape, weightsX: Array.from(weights[0]), weightsY: Array.from(weights[1]), width, height };
}

function applyCorrection(correction, point) {
  if (!correction) return { x: point.x, y: point.y };
  const { shape, weightsX, weightsY, width, height } = correction;
  const design = shape.basis(point.x / width - 0.5, point.y / height - 0.5);
  const limit = (value) => Math.min(Math.max(value, -MAX_CORRECTION_PX), MAX_CORRECTION_PX);
  const change = (weights) => limit(design.reduce((sum, value, i) => sum + value * weights[i], 0));
  return { x: point.x + change(weightsX), y: point.y + change(weightsY) };
}

// Each dot is scored with a correction worked out from the other dots only, so the reported
// number isn't flattered by correcting against itself.
function heldOutError(shape, dots, width, height) {
  const errors = [];
  dots.forEach(({ target, samples }, index) => {
    const correction = fitShape(shape, dots.filter((_, other) => other !== index), width, height);
    for (const sample of samples) {
      const point = applyCorrection(correction, sample);
      errors.push(Math.hypot(point.x - target.x, point.y - target.y));
    }
  });
  return median(errors);
}

// measured: [{ target: {x, y}, samples: [{x, y}] }], one entry per dot in the accuracy check.
// Readings can come out off by a fixed amount, or by different amounts in different parts of the
// screen. Both can be measured here and corrected, as long as the correction proves itself.
function bestCorrection(measured, width, height) {
  const dots = measured.map(({ target, samples }) => ({
    target,
    samples,
    mean: {
      x: samples.reduce((sum, sample) => sum + sample.x, 0) / samples.length,
      y: samples.reduce((sum, sample) => sum + sample.y, 0) / samples.length,
    },
  }));

  const raw = median(dots.flatMap(({ target, samples }) => samples.map((sample) => Math.hypot(sample.x - target.x, sample.y - target.y))));
  let best = null;
  let errorPx = raw;
  for (const shape of CORRECTION_SHAPES) {
    const error = heldOutError(shape, dots, width, height);
    if (error < errorPx * MIN_CORRECTION_IMPROVEMENT) {
      best = shape;
      errorPx = error;
    }
  }
  return { dots, best, errorPx, rawErrorPx: raw };
}

function fitCorrection(measured) {
  const { innerWidth: width, innerHeight: height } = window;
  const { dots, best, errorPx, rawErrorPx } = bestCorrection(measured, width, height);
  gazeEngine.correction = best && fitShape(best, dots, width, height);
  return { errorPx, rawErrorPx, adjusted: Boolean(best), shape: best ? best.name : 'none' };
}

// How often each check dot lands in the right third of the screen, across and down. Scored with
// corrections from the other dots only, so it can't be flattered by correcting against itself.
function areaHits(measured) {
  const { innerWidth: width, innerHeight: height } = window;
  const { dots, best } = bestCorrection(measured, width, height);
  const third = (value, size) => Math.min(Math.max(Math.floor((value / size) * 3), 0), 2);
  let columns = 0;
  let rows = 0;
  let cells = 0;
  dots.forEach(({ target, mean }, index) => {
    const correction = best ? fitShape(best, dots.filter((_, other) => other !== index), width, height) : null;
    const point = applyCorrection(correction, mean);
    const columnRight = third(point.x, width) === third(target.x, width);
    const rowRight = third(point.y, height) === third(target.y, height);
    if (columnRight) columns += 1;
    if (rowRight) rows += 1;
    if (columnRight && rowRight) cells += 1;
  });
  return { columns, rows, cells, total: dots.length };
}

function correctGaze(point) {
  const corrected = applyCorrection(gazeEngine.correction, point);
  return { x: corrected.x + gazeEngine.recenter.x, y: corrected.y + gazeEngine.recenter.y };
}

// Whatever has drifted since calibrating, assuming the eyes are on this target right now.
function recenterGaze(gaze, target) {
  const corrected = applyCorrection(gazeEngine.correction, gaze);
  gazeEngine.recenter = { x: target.x - corrected.x, y: target.y - corrected.y };
  gazeEngine.stabilizer.reset();
  return Math.hypot(gazeEngine.recenter.x, gazeEngine.recenter.y);
}
