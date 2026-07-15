"use client";

import dynamic from "next/dynamic";

// Code-split the three.js/postprocessing bundle out of the main chunk — it's only
// needed once this gallery actually mounts, never during SSR (it's pointer-driven WebGL).
export const LazyWaterRippleGallery = dynamic(
  () => import("./WaterRippleGallery").then((m) => m.WaterRippleGallery),
  { ssr: false },
);
