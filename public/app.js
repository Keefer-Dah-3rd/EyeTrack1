/* global RealEye */
const $ = (id) => document.getElementById(id);

// RealEye Light's own pattern and pacing, which its accuracy figure is based on.
const CALIBRATION_POINTS = RealEye.getCalibrationPoints(RealEye.getRecommendedPattern()).map(({ x, y }) => [x * 100, y * 100]);
const SAMPLES_PER_POINT = RealEye.RECOMMENDED_SAMPLES_PER_POINT;
const SAMPLE_GAP_MS = 150;
const CAPTURE_LEAD_IN_MS = 200;
const POINT_DONE_MS = 220;
const MODEL_MESSAGE_MS = 60;

// Placed between the calibration points so the check isn't graded on trained positions.
const VALIDATION_POINTS = [[14, 12], [86, 12], [14, 88], [86, 88], [50, 6], [50, 94], [6, 50], [94, 50], [50, 62]];
const CHECK_INTRO_MS = 800;
const SETTLE_MS = 600;
const RESETTLE_MS = 300;
const MEASURE_MS = 700;

// RealEye reports about 120 px for this tracker, and research puts webcam tracking in the low hundreds.
const GOOD_ERROR_PX = 120;
const USABLE_ERROR_PX = 240;
const MANY_PAUSES = 3;
const RELIABLE_AREA_SHARE = 0.75;
const USABLE_AREA_SHARE = 0.5;
const MIN_FACE_RATIO = 0.5;

// Eye distance as a share of the video width: roughly arm's length for a typical webcam.
const FACE_BOX_SHARE = 0.66;
const MIN_FACE_SIZE = 0.07;
const MAX_FACE_SIZE = 0.25;
const MIN_EYE_CONTRAST = 12;
const MIN_FRAME_RATE = 10;
const CAMERA_WARM_UP_MS = 5000;
const STEP_DOWN_FRAME_RATE = 15;
const FULL_CAMERA_WIDTH = 1280;
// How far the head can drift from where calibration started. Shift is in multiples of the eye distance.
const MAX_SIZE_CHANGE = 0.12;
const MAX_HEAD_SHIFT = 0.45;
// Relative to the person's own open eyes, since looking at the lower dots also narrows them.
const BLINK_RATIO = 0.5;
const PROBLEM_DISPLAY_DELAY_MS = 300;
const FACE_HISTORY_LENGTH = 6;
const SETUP_READY_HOLD_MS = 1000;

const PREVIEW_SETUP_WIDTH = 400;
const PREVIEW_LIVE_WIDTH = 200;
const PREVIEW_TARGET_WIDTH = 180;
// Halfway down the gap below the centre, the one spot no calibration or accuracy dot lands on.
const PREVIEW_TARGET_Y = 0.78;

// Light, because the gaze engine already steadies. More than this makes the dot trail the eyes.
const SMOOTHING = 0.7;
const MAX_FRAME_GAP_MS = 250;
const ELSEWHERE = 'Elsewhere';

const state = {
  phase: 'setup',
  cameraOn: false,
  face: null,
  recentFaces: [],
  baseline: null,
  problem: null,
  problemSince: 0,
  pauses: 0,
  setupReadyAt: 0,
  frameCount: 0,
  frameRate: null,
  frameRateAt: 0,
  cameraStartedAt: 0,
  gazeHandler: null,
  areaHits: null,
  calibratedWindow: null,
  errorPx: null,
};

function showScreen(phase) {
  state.phase = phase;
  for (const id of ['setup', 'calibrate', 'validate', 'results', 'live', 'review', 'sessions']) {
    $(id).hidden = id !== phase;
  }
  hideDotMessage();
  syncPreview();
  checkWindowDrift();
}

/* Camera */

function setStatus(message, tone) {
  const status = $('setup-status');
  status.textContent = message;
  status.className = tone ? `status is-${tone}` : 'status';
}

function describeCameraError(error) {
  switch (error && error.name) {
    case 'NotAllowedError':
      return 'Camera access was blocked. Allow the camera for this page in your browser settings, then try again.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No usable camera was found. Connect a webcam, then try again.';
    case 'NotReadableError':
      return 'The camera is busy. Close other apps using it, then try again.';
    default:
      return `The tracker couldn't start: ${(error && error.message) || 'unknown error'}.`;
  }
}

/* Face position */

function eyeOpenness(points) {
  if (!points) return null;
  const distance = (a, b) => Math.hypot(points[a][0] - points[b][0], points[a][1] - points[b][1]);
  const right = distance(159, 145) / distance(33, 133);
  const left = distance(386, 374) / distance(263, 362);
  return (left + right) / 2;
}

// Spread of brightness rather than brightness itself, so it doesn't depend on skin tone.
function eyeContrast(image, [ax, ay], [bx, by]) {
  const left = Math.max(Math.round(Math.min(ax, bx)), 0);
  const right = Math.min(Math.round(Math.max(ax, bx)), image.width - 1);
  const halfHeight = Math.max((right - left) / 3, 1);
  const top = Math.max(Math.round((ay + by) / 2 - halfHeight), 0);
  const bottom = Math.min(Math.round((ay + by) / 2 + halfHeight), image.height - 1);
  let count = 0;
  let sum = 0;
  let squares = 0;
  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      const value = image.data[(y * image.width + x) * 4 + 1];
      count += 1;
      sum += value;
      squares += value * value;
    }
  }
  if (!count) return 0;
  const mean = sum / count;
  return Math.sqrt(Math.max(0, squares / count - mean * mean));
}

function faceBox(width, height) {
  const size = Math.min(width, height) * FACE_BOX_SHARE;
  return { left: (width - size) / 2, top: (height - size) / 2, size };
}

function readFace(points, image) {
  const { width, height } = image;
  const [rightOuter, rightInner, leftInner, leftOuter] = [33, 133, 362, 263].map((index) => points[index]);
  const middle = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const rightCentre = middle(rightOuter, rightInner);
  const leftCentre = middle(leftOuter, leftInner);
  const span = Math.hypot(leftCentre[0] - rightCentre[0], leftCentre[1] - rightCentre[1]);

  const box = faceBox(width, height);
  const insideBox = ([x, y]) => x > box.left && x < box.left + box.size && y > box.top && y < box.top + box.size;

  return {
    x: (leftCentre[0] + rightCentre[0]) / 2,
    y: (leftCentre[1] + rightCentre[1]) / 2,
    span,
    sizeRatio: span / width,
    centred: [rightOuter, rightInner, leftInner, leftOuter].every(insideBox),
    contrast: state.phase === 'setup' ? (eyeContrast(image, rightOuter, rightInner) + eyeContrast(image, leftInner, leftOuter)) / 2 : null,
    openness: eyeOpenness(points),
  };
}

function findProblem() {
  const { face, baseline } = state;
  if (!face) return "Can't see your face";
  if (!baseline) return null;

  const sizeChange = face.span / baseline.span - 1;
  if (sizeChange > MAX_SIZE_CHANGE) return 'Too close: lean back a little';
  if (sizeChange < -MAX_SIZE_CHANGE) return 'Too far: lean in a little';

  // The raw camera image is mirrored compared with the person, so the image's +x is their left.
  const shiftX = (face.x - baseline.x) / baseline.span;
  const shiftY = (face.y - baseline.y) / baseline.span;
  if (shiftX > MAX_HEAD_SHIFT) return 'Head moved: shift to your right';
  if (shiftX < -MAX_HEAD_SHIFT) return 'Head moved: shift to your left';
  if (shiftY > MAX_HEAD_SHIFT) return 'Head moved: raise your head';
  if (shiftY < -MAX_HEAD_SHIFT) return 'Head moved: lower your head';
  return null;
}

function handleCameraFrame(points, image) {
  state.frameCount += 1;
  updateFrameRate();
  state.face = points ? readFace(points, image) : null;
  if (state.face) {
    state.recentFaces.push(state.face);
    if (state.recentFaces.length > FACE_HISTORY_LENGTH) state.recentFaces.shift();
  }
  const problem = findProblem();
  if (problem !== state.problem) {
    state.problem = problem;
    state.problemSince = performance.now();
  }
  drawCameraOverlay(points, image);
}

// Single frames flicker, so a problem has to last a moment before it's worth telling anyone.
function visibleProblem() {
  return performance.now() - state.problemSince >= PROBLEM_DISPLAY_DELAY_MS ? state.problem : null;
}

function isBlinking() {
  const { face, baseline } = state;
  if (!face || !baseline || face.openness === null || baseline.openness === null) return false;
  return face.openness < baseline.openness * BLINK_RATIO;
}

function setBaseline() {
  const average = (key) => {
    const values = state.recentFaces.map((face) => face[key]).filter((value) => value !== null);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  };
  state.baseline = {
    x: average('x'),
    y: average('y'),
    span: average('span'),
    openness: average('openness'),
  };
  syncPreview();
}

function cancelToSetup() {
  state.gazeHandler = null;
  state.baseline = null;
  state.problem = null;
  state.calibratedWindow = null;
  showScreen('setup');
}

async function startCamera() {
  $('start-camera').disabled = true;
  setStatus('Starting the camera and loading the face model. Allow camera access if your browser asks.');

  gazeEngine.onGaze = (gaze) => {
    if (state.gazeHandler) state.gazeHandler(gaze);
  };
  try {
    await startGazeEngine($('camera-video'), handleCameraFrame);
  } catch (error) {
    $('start-camera').disabled = false;
    setStatus(describeCameraError(error), 'bad');
    return;
  }

  state.cameraOn = true;
  state.cameraStartedAt = performance.now();
  state.frameRate = null;
  populateCameras();
  $('start-camera').hidden = true;
  $('continue').hidden = false;
  $('checks').hidden = false;
  syncPreview();
}

// Labels are only available once the camera has been allowed.
async function populateCameras() {
  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(({ kind }) => kind === 'videoinput');
  const select = $('camera-select');
  select.replaceChildren(...devices.map(({ deviceId, label }, index) => {
    const option = document.createElement('option');
    option.value = deviceId;
    option.textContent = label || `Camera ${index + 1}`;
    return option;
  }));
  const [track] = gazeEngine.stream ? gazeEngine.stream.getVideoTracks() : [];
  const current = track && track.getSettings().deviceId;
  if (current) select.value = current;
  $('camera-choice').hidden = devices.length < 2;
}

async function chooseCamera(event) {
  try {
    state.setupReadyAt = 0;
    state.cameraStartedAt = performance.now();
    await switchCamera(event.target.value);
    syncPreview();
  } catch (error) {
    setStatus(describeCameraError(error), 'bad');
  }
}

function stopCamera() {
  state.gazeHandler = null;
  state.cameraOn = false;
  state.face = null;
  state.recentFaces = [];
  state.baseline = null;
  state.problem = null;
  state.calibratedWindow = null;
  stopGazeEngine();
  stopTabCapture();
  $('camera-view').classList.add('is-off');

  $('start-camera').hidden = false;
  $('start-camera').disabled = false;
  $('continue').hidden = true;
  $('continue').disabled = true;
  $('checks').hidden = true;
  $('camera-choice').hidden = true;
  $('toggle-preview').checked = false;
  setStatus('Camera stopped.');
  showScreen('setup');
}

function syncPreview() {
  if (!state.cameraOn) return;
  const inSetup = state.phase === 'setup';
  const onTargets = state.phase === 'calibrate' || state.phase === 'validate' || recenter.open;
  const visible = inSetup || onTargets || (state.phase === 'live' && $('toggle-preview').checked && !$('panel').hidden && !$('dock-body').hidden);
  const view = $('camera-view');
  view.classList.toggle('is-off', !visible);
  view.classList.toggle('is-target', onTargets);
  if (!visible) {
    view.style.removeProperty('width');
    view.style.removeProperty('height');
    return;
  }

  const video = $('camera-video');
  const aspect = video.videoWidth ? video.videoHeight / video.videoWidth : 0.75;
  const width = inSetup ? PREVIEW_SETUP_WIDTH : onTargets ? PREVIEW_TARGET_WIDTH : PREVIEW_LIVE_WIDTH;
  const height = Math.round(width * aspect);
  view.style.width = `${width}px`;
  view.style.height = `${height}px`;
  if (inSetup) {
    const slot = $('camera-slot').getBoundingClientRect();
    view.style.left = `${slot.left}px`;
    view.style.top = `${slot.top + (slot.height - height) / 2}px`;
  } else if (onTargets) {
    view.style.left = `${(window.innerWidth - width) / 2}px`;
    view.style.top = `${window.innerHeight * PREVIEW_TARGET_Y - height / 2}px`;
  } else {
    view.style.left = '16px';
    view.style.top = `${window.innerHeight - height - 16}px`;
  }

  const box = state.baseline && video.videoWidth ? holdBox(width) : faceBox(width, height);
  const boxElement = $('camera-box');
  boxElement.style.left = `${box.left}px`;
  boxElement.style.top = `${box.top}px`;
  boxElement.style.width = `${box.width || box.size}px`;
  boxElement.style.height = `${box.height || box.size}px`;
}

// Drawn to the head-moved limits: the centre of each eye reaches the edge just as the warning starts.
function holdBox(previewWidth) {
  const { x, y, span } = state.baseline;
  const scale = previewWidth / $('camera-video').videoWidth;
  const width = span * scale * (1 + MAX_HEAD_SHIFT * 2);
  const height = span * scale * MAX_HEAD_SHIFT * 2;
  // The preview is mirrored, so x counts from the opposite side.
  return { left: previewWidth - x * scale - width / 2, top: y * scale - height / 2, width, height };
}

// Shows the eye outlines and irises the tracker has found, so it's clear it can see them.
function drawCameraOverlay(points, image) {
  const view = $('camera-view');
  if (view.classList.contains('is-off')) return;
  const overlay = $('camera-overlay');
  if (overlay.width !== image.width || overlay.height !== image.height) {
    overlay.width = image.width;
    overlay.height = image.height;
  }
  const context = overlay.getContext('2d');
  context.clearRect(0, 0, overlay.width, overlay.height);

  const judged = Boolean(state.baseline || state.face);
  const inPlace = state.baseline ? !visibleProblem() : Boolean(state.face && state.face.centred);
  $('camera-box').classList.toggle('is-good', judged && inPlace);
  $('camera-box').classList.toggle('is-bad', judged && !inPlace);
  if (!points || points.length < IRIS_LANDMARK_COUNT) return;

  const scale = image.width / 640;
  context.lineWidth = 1.5 * scale;
  context.strokeStyle = '#7dffb0';
  for (const outline of [[33, 160, 158, 133, 153, 144], [362, 385, 387, 263, 373, 380]]) {
    context.beginPath();
    outline.forEach((index, order) => {
      if (order) context.lineTo(points[index][0], points[index][1]);
      else context.moveTo(points[index][0], points[index][1]);
    });
    context.closePath();
    context.stroke();
  }
  for (const [centre, edge] of [[468, 469], [473, 474]]) {
    const radius = Math.hypot(points[centre][0] - points[edge][0], points[centre][1] - points[edge][1]);
    context.beginPath();
    context.arc(points[centre][0], points[centre][1], radius, 0, Math.PI * 2);
    context.stroke();
  }
}

function setCheck(id, status, text) {
  const check = $(id);
  check.className = `check is-${status}`;
  check.textContent = text;
}

function updateFrameRate() {
  const now = performance.now();
  if (now - state.frameRateAt < 1000) return;
  if (state.frameRateAt) state.frameRate = Math.round((state.frameCount * 1000) / (now - state.frameRateAt));
  state.frameCount = 0;
  state.frameRateAt = now;
}

function updateSetupStatus() {
  if (state.phase !== 'setup' || !state.cameraOn) return;
  const { face } = state;
  const button = $('continue');

  // The first frames are slow while the graphics card gets ready, so don't judge speed by them.
  const warmedUp = performance.now() - state.cameraStartedAt > CAMERA_WARM_UP_MS;
  if (warmedUp && state.frameRate !== null && state.frameRate < STEP_DOWN_FRAME_RATE && $('camera-video').videoWidth > FULL_CAMERA_WIDTH) {
    stepDownCamera();
  }
  const fastEnough = !warmedUp || state.frameRate === null || state.frameRate >= MIN_FRAME_RATE;
  setCheck('check-speed', fastEnough ? 'pass' : 'fail', fastEnough ? 'Tracking speed is fine' : `Tracking is slow (${state.frameRate} updates/s): close other tabs and apps`);

  if (!face) {
    setCheck('check-face', 'fail', 'Looking for your face');
    setCheck('check-centred', 'pending', 'Eyes inside the box');
    setCheck('check-distance', 'pending', "About arm's length away");
    setCheck('check-light', 'pending', 'Enough light on your eyes');
  } else {
    const closeEnough = face.sizeRatio >= MIN_FACE_SIZE;
    const farEnough = face.sizeRatio <= MAX_FACE_SIZE;
    const lightEnough = face.contrast === null || face.contrast >= MIN_EYE_CONTRAST;
    setCheck('check-face', 'pass', 'Face found');
    setCheck('check-centred', face.centred ? 'pass' : 'fail', face.centred ? 'Eyes inside the box' : 'Move so your eyes are inside the box');
    if (!closeEnough) setCheck('check-distance', 'fail', 'Too far: move a little closer');
    else if (!farEnough) setCheck('check-distance', 'fail', 'Too close: move back a little');
    else setCheck('check-distance', 'pass', 'Good distance');
    setCheck('check-light', lightEnough ? 'pass' : 'fail', lightEnough ? 'Enough light on your eyes' : 'Your eyes are hard to see: add light in front of you');

    if (face.centred && closeEnough && farEnough && lightEnough && fastEnough) state.setupReadyAt = performance.now();
  }

  // These limits are estimates that vary by webcam, so a failed check warns rather than locks anyone out.
  const ready = performance.now() - state.setupReadyAt < SETUP_READY_HOLD_MS;
  button.disabled = !face;
  button.classList.toggle('primary', ready);
  button.textContent = ready || !face ? 'Continue to calibration' : 'Continue anyway';
  if (!face) setStatus('Move into the frame and face the camera.');
  else if (ready) setStatus('All set. Stay roughly in this position from here on.', 'good');
  else setStatus('Fix the items above for the best accuracy.');

  // The text above changes the card's height, which moves the slot the preview sits over.
  syncPreview();
}

/* Targets */

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function placeTarget(element, [xPercent, yPercent]) {
  element.style.left = `${xPercent}%`;
  element.style.top = `${yPercent}%`;
}

function setDotState(dot, status, progress) {
  dot.className = `${dot.dataset.base} is-${status}`;
  dot.style.setProperty('--progress', progress);
}

// Shown beside the dot, because that's where the person's eyes already are.
function showDotMessage([xPercent, yPercent], text, tone) {
  const message = $('dot-message');
  message.textContent = text;
  message.className = `dot-message${tone ? ` is-${tone}` : ''}`;
  message.style.left = `${xPercent}%`;
  message.style.top = `${yPercent}%`;
  const alignX = xPercent < 25 ? '-20px' : xPercent > 75 ? 'calc(-100% + 20px)' : '-50%';
  const alignY = yPercent > 70 ? 'calc(-100% - 32px)' : '32px';
  message.style.transform = `translate(${alignX}, ${alignY})`;
  message.hidden = false;
}

function hideDotMessage() {
  $('dot-message').hidden = true;
}

/* Calibration */

const CALIBRATE_INSTRUCTIONS = 'Look at the dot, then click it or press Space. Keep your eyes on it until the ring fills.';
const calibration = { points: [], index: 0, samples: 0, capturing: false, advancing: false, nextSampleAt: 0, paused: false };

function buildPips() {
  const pips = $('calibrate-pips');
  pips.replaceChildren();
  for (const point of CALIBRATION_POINTS) {
    const pip = document.createElement('i');
    pip.dataset.point = point.join();
    pip.style.left = `${point[0]}%`;
    pip.style.top = `${point[1]}%`;
    pips.append(pip);
  }
}

function renderPips() {
  const done = new Set(calibration.points.slice(0, calibration.index).map((point) => point.join()));
  const current = calibration.points[calibration.index];
  for (const pip of $('calibrate-pips').children) {
    pip.classList.toggle('is-done', done.has(pip.dataset.point));
    pip.classList.toggle('is-current', Boolean(current) && pip.dataset.point === current.join());
  }
  $('calibrate-progress').textContent = `Dot ${Math.min(calibration.index + 1, calibration.points.length)} of ${calibration.points.length}`;
}

async function startCalibration() {
  state.gazeHandler = null;
  state.baseline = null;
  state.problem = null;
  state.pauses = 0;
  state.calibratedWindow = currentWindow();
  resetGazeModel();
  calibration.points = shuffled(CALIBRATION_POINTS);
  calibration.index = 0;
  calibration.samples = 0;
  calibration.capturing = false;
  calibration.advancing = false;
  calibration.paused = false;
  showScreen('calibrate');
  $('calibration-dot').hidden = false;
  $('calibrate-instructions').textContent = CALIBRATE_INSTRUCTIONS;
  buildPips();
  renderCalibrationPoint();
  state.gazeHandler = handleCalibrationFrame;
  $('calibration-dot').focus();
}

function renderCalibrationPoint() {
  placeTarget($('calibration-dot'), calibration.points[calibration.index]);
  renderPips();
  renderCalibrationFeedback();
}

function renderCalibrationFeedback() {
  if (calibration.advancing) return;
  const dot = $('calibration-dot');
  const point = calibration.points[calibration.index];
  const problem = visibleProblem();
  const progress = calibration.samples / SAMPLES_PER_POINT;

  if (problem) {
    setDotState(dot, 'blocked', progress);
    showDotMessage(point, problem, 'warning');
  } else if (calibration.capturing) {
    setDotState(dot, 'capturing', progress);
    if (calibration.index === 0) showDotMessage(point, 'Keep looking until the ring fills');
    else hideDotMessage();
  } else {
    setDotState(dot, 'ready', progress);
    if (calibration.index === 0) showDotMessage(point, 'Look here, then click or press Space');
    else hideDotMessage();
  }
}

function handleCalibrationClick() {
  if (calibration.capturing || calibration.advancing) return;
  const dot = $('calibration-dot');

  if (state.problem) {
    showDotMessage(calibration.points[calibration.index], state.problem, 'warning');
    dot.classList.remove('is-rejected');
    void dot.offsetWidth;
    dot.classList.add('is-rejected');
    return;
  }

  // Head position is judged against where it was at the first click.
  if (!state.baseline) setBaseline();
  calibration.capturing = true;
  calibration.nextSampleAt = performance.now() + CAPTURE_LEAD_IN_MS;
  renderCalibrationFeedback();
}

function handleCalibrationFrame() {
  renderCalibrationFeedback();
  if (!calibration.capturing) return;

  if (state.problem) {
    if (!calibration.paused) state.pauses += 1;
    calibration.paused = true;
    return;
  }
  calibration.paused = false;

  const now = performance.now();
  if (now < calibration.nextSampleAt || isBlinking()) return;

  // Train on the dot's centre, since that's where the eyes are, not wherever the cursor landed.
  const dot = $('calibration-dot').getBoundingClientRect();
  if (!addCalibrationSample(dot.left + dot.width / 2, dot.top + dot.height / 2)) return;
  calibration.samples += 1;
  calibration.nextSampleAt = now + SAMPLE_GAP_MS;
  renderCalibrationFeedback();

  if (calibration.samples === SAMPLES_PER_POINT) finishCalibrationPoint();
}

async function finishCalibrationPoint() {
  calibration.capturing = false;
  calibration.advancing = true;
  calibration.samples = 0;
  setDotState($('calibration-dot'), 'done', 1);
  hideDotMessage();
  await wait(POINT_DONE_MS);
  if (state.phase !== 'calibrate') return;

  calibration.advancing = false;
  calibration.index += 1;
  if (calibration.index === calibration.points.length) {
    state.gazeHandler = null;
    $('calibration-dot').hidden = true;
    hideDotMessage();
    $('calibrate-progress').textContent = 'Building your tracking model';
    $('calibrate-instructions').textContent = 'Stay where you are.';
    // Fitting holds up the page for a moment, so let the message appear first.
    await wait(MODEL_MESSAGE_MS);
    if (!fitCalibration()) {
      cancelToSetup();
      setStatus("Calibration didn't produce a usable result. Check the items above and try again.", 'bad');
      return;
    }
    runAccuracyCheck();
    return;
  }
  renderCalibrationPoint();
}

/* Accuracy check */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Waits out head movement and lost tracking rather than measuring through them, so a
// momentary lapse pauses the check instead of spoiling the result.
function measureDot(point, target) {
  const dot = $('validation-dot');
  return new Promise((resolve) => {
    const samples = [];
    const rawSamples = [];
    const frames = [];
    let readyAt = performance.now() + SETTLE_MS;
    let measuredMs = 0;
    let lastFrame = performance.now();
    let paused = false;

    state.gazeHandler = (data) => {
      const now = performance.now();
      const elapsed = now - lastFrame;
      lastFrame = now;

      const shownProblem = visibleProblem();
      if (shownProblem) showDotMessage(point, shownProblem, 'warning');
      else hideDotMessage();
      setDotState(dot, shownProblem ? 'blocked' : 'capturing', measuredMs / MEASURE_MS);

      if (state.problem || !data) {
        if (!paused) state.pauses += 1;
        paused = true;
        readyAt = now + RESETTLE_MS;
        return;
      }
      paused = false;
      if (now < readyAt || isBlinking()) return;

      samples.push({ x: data.x, y: data.y });
      if (gazeEngine.latestRaw) rawSamples.push({ x: gazeEngine.latestRaw.x, y: gazeEngine.latestRaw.y });
      const row = captureCheckRow();
      if (row) frames.push({ row, t: now });
      measuredMs += elapsed;
      if (measuredMs >= MEASURE_MS) {
        state.gazeHandler = null;
        resolve({ target, samples, rawSamples, frames });
      }
    };
  });
}

async function runAccuracyCheck() {
  state.gazeHandler = null;
  showScreen('validate');
  $('validate-instructions').textContent = 'Keep your eyes on each dot until it moves. No clicking.';
  const dot = $('validation-dot');
  dot.hidden = true;
  $('validate-progress').textContent = 'Accuracy check';
  await wait(CHECK_INTRO_MS);
  if (state.phase !== 'validate') return;
  dot.hidden = false;

  const measured = [];
  for (const [index, point] of VALIDATION_POINTS.entries()) {
    $('validate-progress').textContent = `Dot ${index + 1} of ${VALIDATION_POINTS.length}`;
    placeTarget(dot, point);
    setDotState(dot, 'capturing', 0);
    const target = {
      x: (point[0] / 100) * window.innerWidth,
      y: (point[1] / 100) * window.innerHeight,
    };
    measured.push(await measureDot(point, target));
  }

  state.gazeHandler = null;
  dot.hidden = true;
  hideDotMessage();
  $('validate-progress').textContent = 'Fine-tuning for your eyes';
  $('validate-instructions').textContent = 'This takes a few seconds.';
  await tuneModel(measured);
  if (state.phase !== 'validate') return;
  showResults(measured);
}

const meanOf = (samples) => ({
  x: samples.reduce((sum, sample) => sum + sample.x, 0) / samples.length,
  y: samples.reduce((sum, sample) => sum + sample.y, 0) / samples.length,
});

function drawResultsMap(measured) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const map = $('results-map');
  map.replaceChildren();

  // A miniature of the window, so markers keep their real positions relative to the screen.
  const { innerWidth: width, innerHeight: height } = window;
  const markerRadius = width * 0.014;
  map.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const add = (tag, attributes) => {
    const element = document.createElementNS(svgNS, tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    map.append(element);
  };

  for (const { target, samples } of measured) {
    const { x, y } = correctGaze(meanOf(samples));
    add('line', { x1: target.x, y1: target.y, x2: x, y2: y, stroke: '#1c1d1f', 'stroke-width': markerRadius / 2.5 });
    add('circle', { cx: x, cy: y, r: markerRadius, fill: '#1c1d1f' });
    add('circle', { cx: target.x, cy: target.y, r: markerRadius, fill: '#d6401f' });
  }
}

// Typical distance from where the gaze settled while looking at one spot.
function wobble(sets) {
  return Math.round(median(sets.flatMap((samples) => {
    const mean = meanOf(samples);
    return samples.map((sample) => Math.hypot(sample.x - mean.x, sample.y - mean.y));
  })));
}

function showResults(measured) {
  const fit = fitCorrection(measured);
  // Dot movement is tuned to how much this person's readings actually wobble.
  gazeEngine.wobblePx = Math.min(Math.max(wobble(measured.map(({ rawSamples }) => rawSamples)), MIN_WOBBLE_PX), MAX_WOBBLE_PX);
  state.errorPx = Math.round(fit.errorPx);
  const areas = areaHits(measured);
  state.areaHits = areas;
  $('results-error').textContent = `${areas.cells} of ${areas.total}`;
  drawResultsMap(measured);

  const verdict = $('results-verdict');
  const tips = state.pauses >= MANY_PAUSES
    ? 'Your position kept changing, so try resting your elbows or leaning back in your chair.'
    : 'Keep your eyes on each dot from before you click until its ring fills.';
  const reliable = areas.cells >= areas.total * RELIABLE_AREA_SHARE;
  const usable = areas.cells >= areas.total * USABLE_AREA_SHARE;
  if (reliable) {
    verdict.textContent = 'Ready: it can tell which area of the screen you looked at';
    verdict.className = 'verdict is-good';
  } else if (usable) {
    verdict.textContent = 'Usable: treat the areas as a guide';
    verdict.className = 'verdict is-warn';
  } else {
    verdict.textContent = 'Not reliable this time: please recalibrate';
    verdict.className = 'verdict is-bad';
  }
  const breakdown = `Left, center or right was right for ${areas.columns} of ${areas.total}, and top, middle or bottom for ${areas.rows} of ${areas.total}.`;
  $('results-detail').textContent = usable
    ? `${breakdown} It can't tell which button someone looked at. Mouse, clicks and scrolling are recorded exactly.`
    : `${breakdown} ${tips}`;

  $('start-live').classList.toggle('primary', usable);
  $('recalibrate-results').classList.toggle('primary', !usable);
  state.gazeHandler = null;
  showScreen('results');
  saveCalibrationLog(measured, fit);
}

// Numbers only, no images, kept on this computer, so tracking can be tuned on real runs.
function saveCalibrationLog(measured, fit) {
  const round = (value, places = 4) => Number(value.toFixed(places));
  const video = $('camera-video');
  const [track] = gazeEngine.stream ? gazeEngine.stream.getVideoTracks() : [];
  const capabilities = track && track.getCapabilities ? track.getCapabilities() : {};
  const log = {
    at: new Date().toISOString(),
    engine: 'realeye-light',
    delegate: gazeEngine.tracker.getConfig().delegate,
    window: { width: window.innerWidth, height: window.innerHeight },
    video: { width: video.videoWidth, height: video.videoHeight },
    camera: track ? track.label : null,
    cameraMaxWidth: capabilities.width ? capabilities.width.max : null,
    steppedDown: gazeEngine.steppedDown,
    eyeWidthPx: Math.round(median(gazeEngine.samples.map(({ eyeWidthPx }) => eyeWidthPx))),
    tuning: gazeEngine.tuning,
    framesPerSecond: state.frameRate,
    pauses: state.pauses,
    areaHits: areaHits(measured),
    fitMs: Math.round(gazeEngine.fitMs),
    ridgeLambda: gazeEngine.ridgeLambda,
    errorPx: round(fit.errorPx, 1),
    rawErrorPx: round(fit.rawErrorPx, 1),
    wobblePx: wobble(measured.map(({ samples }) => samples)),
    rawWobblePx: wobble(measured.map(({ rawSamples }) => rawSamples)),
    tunedWobblePx: gazeEngine.wobblePx,
    correctionShape: fit.shape,
    check: measured.map(({ target, samples }) => {
      const mean = meanOf(samples);
      return { target: { x: round(target.x, 1), y: round(target.y, 1) }, mean: { x: round(mean.x, 1), y: round(mean.y, 1) }, samples: samples.length };
    }),
    calibration: gazeEngine.samples.map(({ gazeX, gazeY, signals }) => ({
      x: round(gazeX, 1),
      y: round(gazeY, 1),
      signals: signals && Object.fromEntries(Object.entries(signals).map(([key, value]) => [key, round(value)])),
    })),
  };
  fetch('/api/calibration-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(log) }).catch(() => {});
}

/* Quick re-center: fixes drift in a couple of seconds, without calibrating again. */

const RECENTER_LEAD_IN_MS = 200;
const RECENTER_MEASURE_MS = 700;
const RECENTER_MIN_SAMPLES = 5;

const recenter = { open: false, capturing: false, startAt: 0, samples: [], returnHandler: null };

function openRecenter() {
  if (state.phase !== 'live' || !state.cameraOn || recording.active || recenter.open) return;
  recenter.open = true;
  recenter.capturing = false;
  recenter.samples = [];
  recenter.returnHandler = state.gazeHandler;
  state.gazeHandler = handleRecenterFrame;
  $('recenter-hint').textContent = 'Look at the dot, then click it or press Space.';
  $('recenter-screen').hidden = false;
  setDotState($('recenter-dot'), 'ready', 0);
  $('recenter-dot').focus();
  syncPreview();
}

function closeRecenter() {
  $('recenter-screen').hidden = true;
  state.gazeHandler = recenter.returnHandler;
  recenter.open = false;
  syncPreview();
  dwell.lastTime = 0;
  smoothed.ready = false;
}

function handleRecenterClick() {
  if (recenter.capturing) return;
  if (!state.face) {
    $('recenter-hint').textContent = "Can't see your face, so that click wasn't counted.";
    return;
  }
  $('recenter-hint').textContent = 'Keep looking until the ring fills.';
  recenter.capturing = true;
  recenter.samples = [];
  recenter.startAt = performance.now() + RECENTER_LEAD_IN_MS;
}

function handleRecenterFrame(data) {
  if (!recenter.capturing) return;
  const elapsed = performance.now() - recenter.startAt;
  if (elapsed < 0) return;
  if (data && gazeEngine.latestRaw && !isBlinking()) recenter.samples.push({ ...gazeEngine.latestRaw });
  setDotState($('recenter-dot'), 'capturing', Math.min(elapsed / RECENTER_MEASURE_MS, 1));
  if (elapsed < RECENTER_MEASURE_MS || recenter.samples.length < RECENTER_MIN_SAMPLES) return;

  const gaze = { x: median(recenter.samples.map(({ x }) => x)), y: median(recenter.samples.map(({ y }) => y)) };
  const dot = $('recenter-dot').getBoundingClientRect();
  const movedPx = Math.round(recenterGaze(gaze, { x: dot.left + dot.width / 2, y: dot.top + dot.height / 2 }));
  // This is the position to hold from now on, so the head-moved warning compares against it.
  setBaseline();
  state.problem = null;
  closeRecenter();
  setBarNote(`Re-centered, moving gaze ${movedPx} px.`);
  fetch('/api/calibration-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ at: new Date().toISOString(), type: 'recenter', movedPx }) }).catch(() => {});
}

/* Calibration is tied to where the window sits on screen. */

function currentWindow() {
  return {
    x: window.screenX,
    y: window.screenY,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function checkWindowDrift() {
  const calibrated = state.calibratedWindow;
  const now = currentWindow();
  // Recalibrating from review or saved sessions would throw away what's on screen, so it waits.
  const drifted = Boolean(calibrated) && !['review', 'sessions'].includes(state.phase) &&
    Object.keys(now).some((key) => now[key] !== calibrated[key]);
  if (drifted && recording.active) recording.windowMoved = true;
  $('drift-banner').hidden = !drifted;
}

/* Wiring */

$('start-camera').addEventListener('click', startCamera);
$('camera-select').addEventListener('change', chooseCamera);
$('continue').addEventListener('click', continueFromSetup);
$('fullscreen').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
});
$('calibration-dot').addEventListener('click', handleCalibrationClick);
$('cancel-calibration').addEventListener('click', cancelToSetup);
$('cancel-check').addEventListener('click', cancelToSetup);
$('recenter').addEventListener('click', openRecenter);
$('recenter-dot').addEventListener('click', handleRecenterClick);
$('recenter-cancel').addEventListener('click', closeRecenter);
$('start-live').addEventListener('click', startLive);
$('recalibrate-results').addEventListener('click', startCalibration);
$('recalibrate-live').addEventListener('click', startCalibration);
$('recalibrate-drift').addEventListener('click', startCalibration);
$('stop-camera').addEventListener('click', stopCamera);
$('reset-data').addEventListener('click', resetLiveData);

$('toggle-regions').addEventListener('change', (event) => {
  const page = frameDocument();
  if (page) page.documentElement.classList.toggle('show-regions', event.target.checked);
});
$('toggle-preview').addEventListener('change', syncPreview);

$('record-start').addEventListener('click', startRecording);
$('record-stop').addEventListener('click', stopRecording);
$('toggle-heatmap').addEventListener('change', handleHeatmapToggle);
$('toggle-panel').addEventListener('click', togglePanel);
$('dock-toggle').addEventListener('click', toggleDock);
$('site-form').addEventListener('submit', (event) => {
  event.preventDefault();
  loadSite($('site-url').value);
});
$('site-frame').addEventListener('load', handleFrameLoad);
$('review-form').addEventListener('submit', saveReviewedSession);
$('retry-session').addEventListener('click', retryReview);
$('discard-session').addEventListener('click', discardReview);
$('record-another').addEventListener('click', () => leaveReview('live'));
$('saved-to-sessions').addEventListener('click', () => leaveReview('sessions'));
$('open-sessions').addEventListener('click', () => openSessions('live'));
$('open-sessions-setup').addEventListener('click', () => openSessions('setup'));
$('close-sessions').addEventListener('click', () => showScreen(sessionsReturnPhase));
tabCapture.onEnded = handleCaptureEnded;

window.addEventListener('message', handleFrameMessage);
setInterval(recordInteractionTick, CURSOR_TICK_MS);

document.addEventListener('keydown', handleRecordingKeys);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && recenter.open) closeRecenter();
});
document.addEventListener('keydown', (event) => {
  const typing = ['INPUT', 'TEXTAREA'].includes(event.target.tagName);
  if (state.phase === 'live' && !typing && event.key.toLowerCase() === 'h' && !event.metaKey && !event.ctrlKey && !event.altKey) {
    toggleDock();
  }
});

// Clicking into a site on another address takes the keyboard with it, and the browser
// doesn't let this page listen there, so say so rather than letting the shortcuts seem broken.
window.addEventListener('blur', () => {
  setTimeout(() => {
    if (state.phase === 'live' && document.activeElement === $('site-frame') && !frameDocument()) {
      setBarNote('The site has the keyboard, so use the Start and Stop buttons.');
    }
  });
});
window.addEventListener('focus', () => setBarNote(''));

window.addEventListener('resize', () => {
  syncPreview();
  checkWindowDrift();
});

if (MOUSE_MODE) startMouseMode();

setInterval(updateSetupStatus, 250);
setInterval(checkWindowDrift, 1000);
setInterval(renderDwell, 250);
setInterval(refreshLiveScore, LIVE_SCORE_MS);
setInterval(renderTimer, TIMER_TICK_MS);
setInterval(() => {
  $('rate').textContent = rate.count;
  rate.count = 0;
}, 1000);
