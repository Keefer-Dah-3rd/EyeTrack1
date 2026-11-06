// Runs inside the page being tested and reports its mouse, clicks, scrolling and text to the recorder
// around it. The recorder adds it to pages on its own address. For a site on another address,
// add this line to that site's pages:
//   <script src="http://localhost:4321/frame-tracker.js"></script>
// It never reads what's typed, and only reaches the recorder's own address.
(() => {
  if (window.parent === window || window.uxFrameTrackerRunning) return;
  window.uxFrameTrackerRunning = true;

  const MOVE_GAP_MS = 66;
  const MAX_LABEL_LENGTH = 60;
  // Text that's tracked for reading. Add data-track-text="A name" to track anything else, under that name.
  const TEXT_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, figcaption, td, [data-track-text]';
  const MIN_TEXT_WORDS = 3;
  const MAX_TEXT_BLOCKS = 300;
  const TEXT_LABEL_LENGTH = 80;
  const TEXT_CHECK_MS = 250;
  const TEXT_RESEND_MS = 1000;
  const recorderOrigin = new URL(document.currentScript.src).origin;

  const send = (data) => {
    window.parent.postMessage({ source: 'ux-frame-tracker', page: location.pathname + location.search, ...data }, recorderOrigin);
  };

  const regionOf = (element) => {
    const region = element && element.closest ? element.closest('[data-aoi]') : null;
    return region ? region.dataset.aoi : null;
  };

  // Names what was clicked from its visible text or label, and never from a field's value.
  const describe = (element) => {
    const target = element.closest('a, button, [role="button"], input, select, textarea, label, summary') || element;
    const named = target.getAttribute('aria-label') || target.getAttribute('title') || target.getAttribute('alt');
    const isField = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
    const text = named || (isField ? target.getAttribute('placeholder') || target.getAttribute('name') || target.type : target.textContent);
    return (text || target.tagName.toLowerCase()).trim().replace(/\s+/g, ' ').slice(0, MAX_LABEL_LENGTH);
  };

  const scrollDepth = () => {
    const pageHeight = document.documentElement.scrollHeight;
    return pageHeight ? Math.min((window.scrollY + window.innerHeight) / pageHeight, 1) : 1;
  };

  let lastMove = 0;
  document.addEventListener('mousemove', (event) => {
    const now = performance.now();
    if (now - lastMove < MOVE_GAP_MS) return;
    lastMove = now;
    send({ kind: 'move', x: event.clientX, y: event.clientY, region: regionOf(event.target) });
  }, { capture: true, passive: true });

  document.documentElement.addEventListener('mouseleave', () => send({ kind: 'leave' }));

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    send({ kind: 'click', x: event.clientX, y: event.clientY, label: describe(event.target), region: regionOf(event.target) });
  }, { capture: true, passive: true });

  window.addEventListener('scroll', () => send({ kind: 'scroll', depth: scrollDepth() }), { passive: true });

  const blockIds = new WeakMap();
  let nextBlockId = 1;

  const readTextBlocks = () => {
    const blocks = [];
    for (const element of document.querySelectorAll(TEXT_SELECTOR)) {
      if (blocks.length >= MAX_TEXT_BLOCKS) break;
      const named = element.getAttribute('data-track-text');
      // The innermost text is what gets read, unless something was marked to be tracked as a whole.
      if (!named && element.querySelector(TEXT_SELECTOR)) continue;
      if (!named && element.parentElement && element.parentElement.closest('[data-track-text]')) continue;
      const text = element.textContent.trim().replace(/\s+/g, ' ');
      const words = text ? text.split(' ').length : 0;
      if (words < MIN_TEXT_WORDS) continue;
      const box = element.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0) continue;
      if (!blockIds.has(element)) {
        blockIds.set(element, nextBlockId);
        nextBlockId += 1;
      }
      blocks.push({
        id: blockIds.get(element),
        label: named || (text.length > TEXT_LABEL_LENGTH ? `${text.slice(0, TEXT_LABEL_LENGTH).trimEnd()}…` : text),
        words,
        x: Math.round(box.left),
        y: Math.round(box.top),
        w: Math.round(box.width),
        h: Math.round(box.height),
      });
    }
    return blocks;
  };

  let lastBlocks = '';
  let lastSent = 0;
  setInterval(() => {
    const blocks = readTextBlocks();
    const encoded = JSON.stringify(blocks);
    const now = performance.now();
    // Also sent when nothing changed, so the recorder can tell the tracker is still here.
    if (encoded === lastBlocks && now - lastSent < TEXT_RESEND_MS) return;
    lastBlocks = encoded;
    lastSent = now;
    send({ kind: 'text', blocks });
  }, TEXT_CHECK_MS);

  // A page that's short enough to see whole has already been fully seen.
  send({ kind: 'scroll', depth: scrollDepth() });
})();
