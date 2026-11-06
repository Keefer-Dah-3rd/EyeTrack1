// Works out which screens were used by watching the pixels of this browser tab.
// That covers any site in the frame, and a screen counts once it has settled, so
// animations and transitions don't each become an image.
const SIGNATURE_WIDTH = 80;
const SIGNATURE_HEIGHT = 45;
const SCREEN_SAMPLE_MS = 250;
const CELL_CHANGE_LEVELS = 12;
const NEW_SCREEN_SHARE = 0.15;
const SAME_SCREEN_SHARE = 0.08;
const SETTLE_SAMPLES = 3;
const MAX_UNSETTLED_MS = 5000;
const CAPTURE_HANDLE = `eye-tracker-${Date.now()}-${Math.random()}`;

const tabCapture = { stream: null, video: null, onEnded: null, pending: null };

function stopTabCapture() {
  if (!tabCapture.stream) return;
  tabCapture.stream.getTracks().forEach((track) => track.stop());
  tabCapture.stream = null;
  tabCapture.video = null;
}

// A second request while one is open joins it. Otherwise the tab gets shared twice,
// with a second browser bar and a share nothing can stop.
function requestTabCapture() {
  if (tabCapture.stream) return Promise.resolve();
  if (!tabCapture.pending) {
    tabCapture.pending = startTabCapture().finally(() => {
      tabCapture.pending = null;
    });
  }
  return tabCapture.pending;
}

async function startTabCapture() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    throw new DOMException('Tab capture is not available', 'NotSupportedError');
  }
  // Lets us recognise this tab in the capture, since another tab of the same window looks identical in size.
  if (navigator.mediaDevices.setCaptureHandleConfig) {
    navigator.mediaDevices.setCaptureHandleConfig({ handle: CAPTURE_HANDLE, exposeOrigin: false, permittedOrigins: [window.location.origin] });
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { cursor: 'never', frameRate: { ideal: 10 } },
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: 'include',
    surfaceSwitching: 'exclude',
  });
  const [track] = stream.getVideoTracks();
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  await video.play();

  // Gaze positions only line up with the frames if the frames show this tab.
  const handle = track.getCaptureHandle ? track.getCaptureHandle() : null;
  const isThisTab = track.getCaptureHandle ? Boolean(handle) && handle.handle === CAPTURE_HANDLE : true;
  if (track.getSettings().displaySurface !== 'browser' || !isThisTab) {
    stream.getTracks().forEach((item) => item.stop());
    throw new DOMException('Another surface was shared', 'WrongSurfaceError');
  }

  await restrictCaptureToPage(track);

  track.addEventListener('ended', () => {
    tabCapture.stream = null;
    tabCapture.video = null;
    if (tabCapture.onEnded) tabCapture.onEnded();
  });
  tabCapture.stream = stream;
  tabCapture.video = video;
}

// Captures only the page, so the recorder floating over it never appears in the images
// or counts as a screen change. Browsers without this capture the whole tab, panel included.
async function restrictCaptureToPage(track) {
  if (!window.RestrictionTarget || !track.restrictTo) return;
  try {
    await track.restrictTo(await window.RestrictionTarget.fromElement(document.getElementById('stage')));
  } catch (error) {
    console.warn('The capture could not be limited to the page:', error);
  }
}

function changedShare(a, b) {
  let changed = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (Math.abs(a[i] - b[i]) > CELL_CHANGE_LEVELS) changed += 1;
  }
  return changed / a.length;
}

// getArea returns the part of the window to watch, in page pixels. getPage names the page
// being shown, or returns null for a site this tool can't look inside.
function startScreenTracker(getArea, getPage) {
  const signatureCanvas = document.createElement('canvas');
  signatureCanvas.width = SIGNATURE_WIDTH;
  signatureCanvas.height = SIGNATURE_HEIGHT;
  const signatureContext = signatureCanvas.getContext('2d', { willReadFrequently: true });

  const screens = [];
  let current = null;
  let candidate = null;
  let settledSamples = 0;
  let unsettledSince = 0;
  let pending = [];
  let timer = null;

  function sourceRect(area) {
    const { video } = tabCapture;
    const scaleX = video.videoWidth / window.innerWidth;
    const scaleY = video.videoHeight / window.innerHeight;
    return [area.left * scaleX, area.top * scaleY, area.width * scaleX, area.height * scaleY];
  }

  function readSignature(area) {
    signatureContext.drawImage(tabCapture.video, ...sourceRect(area), 0, 0, SIGNATURE_WIDTH, SIGNATURE_HEIGHT);
    const { data } = signatureContext.getImageData(0, 0, SIGNATURE_WIDTH, SIGNATURE_HEIGHT);
    const signature = new Uint8Array(SIGNATURE_WIDTH * SIGNATURE_HEIGHT);
    for (let i = 0; i < signature.length; i += 1) {
      signature[i] = data[i * 4] * 0.3 + data[i * 4 + 1] * 0.59 + data[i * 4 + 2] * 0.11;
    }
    return signature;
  }

  function grabFrame(area) {
    const source = sourceRect(area);
    const frame = document.createElement('canvas');
    frame.width = Math.round(source[2]);
    frame.height = Math.round(source[3]);
    frame.getContext('2d').drawImage(tabCapture.video, ...source, 0, 0, frame.width, frame.height);
    return frame;
  }

  function sameSize(entry, area) {
    return entry.width === area.width && entry.height === area.height;
  }

  function flushPending() {
    if (!current) return;
    for (const sample of pending) {
      sample.screen = current.index;
      if (sample.kind === 'cursor') {
        current.cursor.push(sample);
      } else if (sample.kind === 'click') {
        current.clicks.push(sample);
      } else {
        current.samples.push(sample);
        current.gazeMs += sample.ms;
      }
    }
    pending = [];
  }

  // Coming back to an earlier screen adds to it rather than making a duplicate.
  function enterScreen(signature, area) {
    current = screens.find((entry) => sameSize(entry, area) && changedShare(entry.signature, signature) < SAME_SCREEN_SHARE);
    if (!current) {
      current = {
        index: screens.length,
        signature,
        frame: grabFrame(area),
        page: getPage(),
        width: area.width,
        height: area.height,
        samples: [],
        cursor: [],
        clicks: [],
        gazeMs: 0,
      };
      screens.push(current);
    }
    candidate = null;
    settledSamples = 0;
    unsettledSince = 0;
    flushPending();
  }

  function tick() {
    if (!tabCapture.video) return;
    const area = getArea();
    const signature = readSignature(area);
    if (!current) {
      enterScreen(signature, area);
      return;
    }

    if (sameSize(current, area) && changedShare(current.signature, signature) < NEW_SCREEN_SHARE) {
      candidate = null;
      settledSamples = 0;
      unsettledSince = 0;
      flushPending();
      return;
    }

    const now = performance.now();
    unsettledSince = unsettledSince || now;
    settledSamples = candidate && changedShare(candidate, signature) < SAME_SCREEN_SHARE ? settledSamples + 1 : 0;
    candidate = signature;
    // Video or a looping animation may never settle, so don't wait forever.
    if (settledSamples >= SETTLE_SAMPLES || now - unsettledSince > MAX_UNSETTLED_MS) enterScreen(signature, area);
  }

  timer = setInterval(tick, SCREEN_SAMPLE_MS);

  return {
    // Holds a sample while the view is changing, until it's clear which screen it belongs to.
    addSample(sample) {
      pending.push(sample);
      if (current && !candidate) flushPending();
    },
    finish() {
      clearInterval(timer);
      flushPending();
      return screens;
    },
  };
}
