// What the page uses from RealEye Light, built into public/vendor/realeye-light.js
// by `npm run build:tracker`, because the package can't run in a browser unbundled.
export {
  WebcamETLight,
  getCalibrationPoints,
  getRecommendedPattern,
  RECOMMENDED_SAMPLES_PER_POINT,
  TrackerState,
  extractCombinedFeatures,
} from '@realeye-io/webcam-eyetracker-light-open';
// Not part of the package's public exports, but gaze-model.js needs it to fit faster.
export { extractAugmentedFeatures } from '../node_modules/@realeye-io/webcam-eyetracker-light-open/dist/lib/features/FeatureExtractor';
