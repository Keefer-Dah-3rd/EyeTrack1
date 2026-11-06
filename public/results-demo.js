/* Made-up sessions for previewing results.html?demo. Built in the browser and never
   sent to the database, so they can't mix with real results. */
(function () {
  const SITE = '/sample/index.html';
  const WIDTH = 640;
  const HEIGHT = 400;

  // Fractions of the picture, roughly matching the layout of the sample page.
  const LAYOUT = [
    { name: 'Navigation', x: 0, y: 0, w: 1, h: 0.1, weight: 0.08 },
    { name: 'Headline', x: 0.05, y: 0.14, w: 0.62, h: 0.26, weight: 0.32 },
    { name: 'Call to action', x: 0.05, y: 0.42, w: 0.34, h: 0.1, weight: 0.17 },
    { name: 'Feature: Capture', x: 0.05, y: 0.58, w: 0.28, h: 0.24, weight: 0.13 },
    { name: 'Feature: Recall', x: 0.36, y: 0.58, w: 0.28, h: 0.24, weight: 0.12 },
    { name: 'Feature: Share', x: 0.67, y: 0.58, w: 0.28, h: 0.24, weight: 0.07 },
    { name: 'Footer', x: 0, y: 0.88, w: 1, h: 0.12, weight: 0.03 },
  ];

  const PEOPLE = [
    { label: 'A', errorPx: 86, face: 0.94, minutes: 2.4, heat: true },
    { label: 'B', errorPx: 142, face: 0.88, minutes: 3.1, heat: true },
    { label: 'C', errorPx: 74, face: 0.97, minutes: 1.9, heat: true },
    { label: 'D', errorPx: 268, face: 0.81, minutes: 2.2, heat: true },
    { label: 'E', errorPx: 118, face: 0.91, minutes: 2.8, heat: false },
    { label: 'F', errorPx: 164, face: 0.42, minutes: 1.6, heat: true },
    { label: 'G', errorPx: 95, face: 0.93, minutes: 3.4, heat: true },
  ];

  // Measured from the sample pages. Only the gaze focus below is made up.
  const PAGES = [
    {
      key: '/sample/index.html',
      layout: { screens: 1, words: 91, wordsPerScreen: 91, controlsPerScreen: 5, contrastPassing: 1, contrastChecked: 1, smallText: 0, lineLength: 52, lineSpacing: 1.45, sizeRatio: 2.88, sizesInUse: 5, emphasised: 0.42, headings: { total: 4, topLevel: 0, skips: 0 } },
      pixels: { edges: 0.035, empty: 0.79 },
      focus: 0.5,
    },
    {
      key: '/sample/pricing.html',
      layout: { screens: 1, words: 40, wordsPerScreen: 40, controlsPerScreen: 5, contrastPassing: 1, contrastChecked: 1, smallText: 0, lineLength: null, lineSpacing: null, sizeRatio: 1.63, sizesInUse: 6, emphasised: 0.38, headings: { total: 1, topLevel: 0, skips: 0 } },
      pixels: { edges: 0.02, empty: 0.84 },
      focus: 0.32,
    },
    {
      key: '/sample/signup.html',
      layout: { screens: 1, words: 37, wordsPerScreen: 37, controlsPerScreen: 7, contrastPassing: 1, contrastChecked: 1, smallText: 0, lineLength: null, lineSpacing: null, sizeRatio: 2.5, sizesInUse: 5, emphasised: 0.3, headings: { total: 1, topLevel: 0, skips: 0 } },
      pixels: { edges: 0.019, empty: 0.81 },
      focus: 0.58,
    },
  ];

  function seededRandom(seed) {
    let value = seed;
    return () => {
      value = (value * 16807) % 2147483647;
      return value / 2147483647;
    };
  }

  function drawDemoHeat(random, errorPx, label) {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fbfaf6';
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.font = '12px sans-serif';
    for (const box of LAYOUT) {
      context.fillStyle = '#eef2ed';
      context.fillRect(box.x * WIDTH, box.y * HEIGHT, box.w * WIDTH, box.h * HEIGHT);
      context.fillStyle = '#62656b';
      context.fillText(box.name, box.x * WIDTH + 8, box.y * HEIGHT + 16);
    }
    const radius = Math.min(Math.max(errorPx / 3, 18), 60);
    for (const box of LAYOUT) {
      for (let blob = 0; blob < Math.round(box.weight * 40); blob += 1) {
        const x = (box.x + random() * box.w) * WIDTH;
        const y = (box.y + random() * box.h) * HEIGHT;
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgb(214 64 31 / 0.28)');
        gradient.addColorStop(1, 'rgb(214 64 31 / 0)');
        context.fillStyle = gradient;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
    }
    context.fillStyle = '#1c1d1f';
    context.font = '600 13px sans-serif';
    context.fillText(`DEMO · Participant ${label}`, WIDTH - 160, HEIGHT - 12);
    return canvas.toDataURL('image/png');
  }

  window.buildDemoResults = function buildDemoResults() {
    const random = seededRandom(20261031);
    const images = {};
    const now = Date.now();
    const sessions = PEOPLE.map((person, index) => {
      const durationMs = Math.round(person.minutes * 60000);
      const trackedMs = Math.round(durationMs * person.face);
      const weights = LAYOUT.map(({ name, weight }) => ({ name, weight: weight * (0.65 + random() * 0.7) }));
      const elsewhere = 0.05 + random() * 0.08;
      const totalWeight = weights.reduce((sum, { weight }) => sum + weight, 0) + elsewhere;
      const regions = [...weights, { name: 'Elsewhere', weight: elsewhere }]
        .map(({ name, weight }) => ({ name, ms: Math.round((weight / totalWeight) * trackedMs) }));

      const id = index + 1;
      const sessionImages = [];
      if (person.heat) {
        const url = drawDemoHeat(random, person.errorPx, person.label);
        for (const [kind, position] of [['overview', 0], ['screen', 0]]) {
          const imageId = `demo-${id}-${kind}`;
          images[imageId] = url;
          sessionImages.push({ id: imageId, session_id: id, kind, position, gaze_ms: trackedMs, width: WIDTH, height: HEIGHT });
        }
      }
      const startedAt = new Date(now - (PEOPLE.length - index) * 26 * 3600000).toISOString();
      return {
        id,
        name: `Demo participant ${person.label}`,
        notes: '',
        site_url: SITE,
        started_at: startedAt,
        saved_at: startedAt,
        duration_ms: durationMs,
        tracked_ms: trackedMs,
        accuracy_px: person.errorPx,
        heatmap_on: person.heat ? 1 : 0,
        regions,
        page_scans: PAGES.map(({ key, layout, pixels, focus }) => ({
          key,
          label: key,
          isPage: true,
          layout,
          pixels: person.heat ? pixels : null,
          gaze: { ms: Math.round(trackedMs / PAGES.length), focus: focus + (random() - 0.5) * 0.1 },
        })),
        images: sessionImages,
      };
    });
    return { sessions, images, demo: true };
  };
}());
