/* Scores for a page, shared by the live panel in the tracker and the results page so
   the two can never disagree. Each measure scores 0 at `zero` and 100 at `full`, in a
   straight line between them, and a group's score is the mean of the measures a page has
   data for. */

const SCORE_HIGH = 75;
const SCORE_MIDDLE = 50;
const MIN_FOCUS_GAZE_MS = 10000;
const THIS_TOOL = 'This tool';

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

const formatWhole = (value) => String(Math.round(value));
const formatShare = (value) => `${Math.round(value * 100)}%`;
const fromLayout = (read) => (page) => (page.layout ? read(page.layout) : null);
const fromPixels = (read) => (page) => (page.pixels ? read(page.pixels) : null);

function headingPoints({ total, topLevel, skips }) {
  return (topLevel === 1 ? 0.5 : 0) + (total && !skips ? 0.5 : 0);
}

const SCORECARD = [
  {
    title: 'Hierarchy',
    labels: ['Clear', 'Mixed', 'Flat'],
    measures: [
      {
        label: 'Heading structure',
        read: fromLayout((layout) => headingPoints(layout.headings)),
        zero: 0,
        full: 1,
        show: (_, { layout: { headings } }) => `${plural(headings.topLevel, 'top heading')}, ${plural(headings.skips, 'skipped level')}`,
        target: 'One top heading, no skipped levels',
        source: THIS_TOOL,
      },
      { label: 'Largest text compared with body text', read: fromLayout((layout) => layout.sizeRatio), zero: 1.1, full: 2, show: (value) => `${value.toFixed(1)}×`, target: '2× or more', source: THIS_TOOL },
      { label: 'Text sizes in use', read: fromLayout((layout) => layout.sizesInUse), zero: 10, full: 5, show: formatWhole, target: '5 or fewer', source: THIS_TOOL },
      { label: 'Text that is bold or larger than body', read: fromLayout((layout) => layout.emphasised), zero: 0.7, full: 0.35, show: formatShare, target: '35% or less', source: THIS_TOOL },
    ],
  },
  {
    title: 'Readability',
    labels: ['Easy', 'Mixed', 'Hard'],
    measures: [
      {
        label: 'Text with enough contrast',
        read: fromLayout((layout) => layout.contrastPassing),
        zero: 0.7,
        full: 1,
        show: (value, { layout }) => (layout.contrastChecked < 0.995 ? `${formatShare(value)} of the ${formatShare(layout.contrastChecked)} that could be checked` : formatShare(value)),
        target: '100%',
        source: 'WCAG 1.4.3 (AA)',
      },
      { label: 'Text at 14 px or larger', read: fromLayout((layout) => (layout.smallText === null ? null : 1 - layout.smallText)), zero: 0.5, full: 0.95, show: formatShare, target: '95% or more', source: THIS_TOOL },
      { label: 'Characters per line of body text', read: fromLayout((layout) => layout.lineLength), zero: 120, full: 80, show: formatWhole, target: '80 or fewer', source: 'WCAG 1.4.8 (AAA)' },
      { label: 'Line spacing of body text', read: fromLayout((layout) => layout.lineSpacing), zero: 1.2, full: 1.5, show: (value) => value.toFixed(2), target: '1.5 or more', source: 'WCAG 1.4.8 (AAA)' },
    ],
  },
  {
    title: 'Density',
    labels: ['Comfortable', 'Busy', 'Crowded'],
    measures: [
      { label: 'Words per screenful', read: fromLayout((layout) => layout.wordsPerScreen), zero: 500, full: 100, show: formatWhole, target: '100 or fewer', source: THIS_TOOL },
      { label: 'Links and controls per screenful', read: fromLayout((layout) => layout.controlsPerScreen), zero: 80, full: 15, show: formatWhole, target: '15 or fewer', source: THIS_TOOL },
      { label: 'Pixels on a hard edge', read: fromPixels((pixels) => pixels.edges), zero: 0.12, full: 0.03, show: (value) => `${(value * 100).toFixed(1)}%`, target: '3% or less', source: THIS_TOOL },
      { label: 'Empty space on screen', read: fromPixels((pixels) => pixels.empty), zero: 0.35, full: 0.75, show: formatShare, target: '75% or more', source: THIS_TOOL },
    ],
  },
  {
    title: 'Gaze focus',
    labels: ['Focused', 'Mixed', 'Scattered'],
    measures: [
      {
        label: 'How much gaze gathered in a few places',
        read: (page) => page.focus,
        zero: 0.15,
        full: 0.6,
        show: (value, page) => (page.focusSessions ? `${value.toFixed(2)} across ${plural(page.focusSessions, 'session')}` : `${value.toFixed(2)} so far`),
        target: '0.60 or more',
        source: THIS_TOOL,
      },
    ],
  },
];

function measurePoints(value, { zero, full }) {
  return Math.min(1, Math.max(0, (value - zero) / (full - zero)));
}

function scoreGroup(group, page) {
  const scored = group.measures.map((measure) => measure.read(page)).map((value, index) => (value === null ? null : measurePoints(value, group.measures[index])));
  const known = scored.filter((points) => points !== null);
  return {
    score: known.length ? Math.round((known.reduce((sum, points) => sum + points, 0) / known.length) * 100) : null,
    known: known.length,
    total: scored.length,
  };
}

function describeScore(score, [high, middle, low]) {
  if (score >= SCORE_HIGH) return { icon: '✓', label: high, tone: 'good' };
  if (score >= SCORE_MIDDLE) return { icon: '◐', label: middle, tone: 'warn' };
  return { icon: '✕', label: low, tone: 'bad' };
}
