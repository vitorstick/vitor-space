# Project Goal
Build a high-performance personal portfolio using a "Topographical Timeline" aesthetic. The architecture uses a hybrid pattern: a Canvas 2D background for procedural terrain and an HTML/CSS overlay for scroll-synced interactive content.

# File Structure Strategy
* `src/components/TopoBackground.tsx` (Handles all Canvas logic)
* `src/components/WaypointsOverlay.tsx` (Handles the HTML/CSS content overlay)
* `src/data/timeline.ts` (Static data source)

# Technology Stack & Dependencies
* `npm install simplex-noise d3-contour gsap`
* **React + Vite / Tailwind CSS:** Component architecture and exact positioning (`absolute`, `z-index`).
* **GSAP:** `ScrollTrigger` (scroll sync) and `MotionPathPlugin` (SVG path to Canvas coordinate conversion).
* **simplex-noise & d3-contour:** Procedural heightmap generation and vector iso-line extraction.

# Implementation Tasks

### Step 1: Static Data Structure
- [ ] Create `src/data/timeline.ts`. Export an array of objects representing projects/milestones.
- [ ] Each object must include: `id`, `title`, `description`, `date`, and `routeProgressPercentage` (a float between `0.0` and `1.0` indicating its position along the timeline path).

### Step 2: Procedural Terrain Background (Canvas Layer)
- [ ] Create `src/components/TopoBackground.tsx` returning a `<canvas className="fixed inset-0 -z-10" />`.
- [ ] Implement a `window.addEventListener('resize')` hook. It must update the canvas dimensions and completely recalculate the terrain generation so the canvas does not stretch or distort.
- [ ] Initialize `simplex-noise` to generate a 2D heightmap grid based on window dimensions.
- [ ] Map the heightmap values to `d3-contour` to extract vector MultiPolygons (iso-contours).
- [ ] Use the Canvas 2D API (`beginPath`, `moveTo`, `lineTo`, `stroke`) to draw the iso-contours. Style with a subtle dark color and low opacity.

### Step 3: Main Route & Scroll Sync (GSAP Layer)
- [ ] Define the main snaking timeline route using an SVG `Path2D` string.
- [ ] Create a wrapper layout component setting a large scrollable height (e.g., `min-h-[500vh]`).
- [ ] Initialize a GSAP `ScrollTrigger` that tracks window scroll and maps it to a progress variable (`0.0` to `1.0`).
- [ ] Create an `onUpdate` hook in GSAP that clears the canvas, redraws the background terrain, and then draws the main `Path2D` route up to the current progress percentage. Apply `ctx.shadowColor` and `ctx.shadowBlur` to create a neon glow.

### Step 4: HTML Waypoint Overlays (Foreground Layer)
- [ ] Create `src/components/WaypointsOverlay.tsx`.
- [ ] Import the timeline data and map over it to render HTML `<div>` elements.
- [ ] **Crucial Math:** Use GSAP's `MotionPathPlugin.getPositionOnPath()` to convert each item's `routeProgressPercentage` into exact X/Y pixel coordinates relative to the main SVG path.
- [ ] Apply `absolute` positioning using those calculated X/Y coordinates (`top` and `left`) so the HTML cards float precisely over the glowing canvas route.
- [ ] Style the waypoints using Tailwind CSS to mimic technical milestone markers (dark backgrounds, neon borders, monospace typography).