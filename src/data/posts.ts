import type { BlogPost } from '../models/BlogPost';

export const posts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'procedural-canvas-iso-contours-gsap',
    title: 'Procedural Topographical Maps: Rendering 60FPS Iso-Contours with Canvas 2D & GSAP',
    excerpt: 'A deep dive into combining simplex-noise, d3-contour, and GSAP ScrollTrigger to render smooth, scroll-synced topographic vector lines without GPU overhead.',
    date: '2026-03-15',
    readTime: '6 min read',
    category: 'canvas',
    tags: ['Canvas2D', 'GSAP', 'd3-contour', 'Performance', 'Mathematics'],
    author: {
      name: 'Vitor Rodrigues',
      role: 'Staff Frontend Engineer',
    },
    relatedWaypointId: 'semmiewealth',
    content: `
## Background & Architecture

When building interactive portfolio experiences, relying on massive raster image assets or heavy 3D WebGL pipelines can impair page load speeds and mobile battery performance. For the **Topographical Timeline**, the goal was to achieve a dynamic 60 FPS vector terrain background that seamlessly syncs with user scrolling.

### The Stack

1. **Simplex Noise (\`simplex-noise\`):** Generates a smooth, continuous 2D heightmap array across dynamic canvas dimensions.
2. **D3 Contours (\`d3-contour\`):** Computes vector MultiPolygon iso-lines for set threshold elevation values.
3. **GSAP ScrollTrigger:** Map scroll progress (\`0.0\` to \`1.0\`) to path rendering and glowing focal points.

\`\`\`typescript
// Extracting isolines from heightmap grid
const contourGenerator = contours()
  .size([cols, rows])
  .thresholds(12);

const isoPolygons = contourGenerator(heightGrid);
\`\`\`

### Canvas 2D Optimization Tricks

- **Viewport Debouncing:** Grid calculations only trigger on window resize rather than on every animation frame.
- **Batch Path Drawing:** Grouping isolines into unified \`Path2D\` objects reduces native context state changes by **70%**.
- **Alpha Decay Lighting:** Subtly adjusting line opacity and glow based on proximity to active timeline waypoints.
    `,
  },
  {
    id: 'post-2',
    slug: 'scaling-hybrid-mobile-web-frontend-architecture',
    title: 'Architecting Hybrid Mobile & Web Frontend Systems at Scale',
    excerpt: 'Lessons learned leading cross-platform engineering teams across React, React Native, and web design systems.',
    date: '2026-01-10',
    readTime: '8 min read',
    category: 'architecture',
    tags: ['Architecture', 'React', 'React Native', 'Design Systems', 'TypeScript'],
    author: {
      name: 'Vitor Rodrigues',
      role: 'Staff Frontend Engineer',
    },
    relatedWaypointId: 'mindera',
    content: `
## The Hybrid Challenge

Modern frontend engineering requires building experiences that span native mobile devices (iOS/Android) and responsive web browsers without duplicating core business logic, API validation, or telemetry hooks.

### Core Architectural Principles

- **Shared Headless Domain Logic:** Isolating state management, data hooks, and validation layers in agnostic TypeScript packages.
- **Unified Tokens, Native Components:** Using a single source of truth for color tokens, typography scales, and spacing metrics while letting web and mobile render native primitive components.
- **Micro-Frontend / Monorepo Layout:** Structuring repositories so shared packages compile fast with zero circular dependency traps.

\`\`\`typescript
// Platform-agnostic telemetry wrapper
export const trackEvent = (event: TelemetryEvent) => {
  if (Platform.isNative) {
    NativeTelemetryModule.log(event);
  } else {
    window.gtag?.('event', event.name, event.payload);
  }
};
\`\`\`
    `,
  },
  {
    id: 'post-3',
    slug: 'optimizing-react-19-scroll-driven-animations',
    title: 'High-Frequency Scroll State in React 19: Avoiding Unnecessary Re-Renders',
    excerpt: 'How to bind high-frequency scroll telemetry (GSAP scrub handlers) to React components without bottlenecking the main UI loop.',
    date: '2025-11-22',
    readTime: '5 min read',
    category: 'performance',
    tags: ['React 19', 'Performance', 'DOM Sync', 'Hooks'],
    author: {
      name: 'Vitor Rodrigues',
      role: 'Staff Frontend Engineer',
    },
    relatedWaypointId: 'semmiewealth',
    content: `
## The Problem with High-Frequency State

Updating React state on every frame during a smooth scroll event (\`window.onscroll\` or \`requestAnimationFrame\`) often triggers excessive virtual DOM recalculations, dropping frame rates on mid-range devices.

### Recommended Solutions

1. **Direct Canvas Mutation:** Perform background terrain drawing directly inside the GSAP \`onUpdate\` callback without passing raw progress values through React state.
2. **Throttled Telemetry HUD:** Throttle visual percentage displays (e.g. updating the HUD counter only when scroll percentage shifts by >1%).
3. **Ref-based Coordinates:** Storing calculated SVG path coordinates in React \`useRef\` or \`useMemo\` buffers rather than component state.
    `,
  },
  {
    id: 'post-4',
    slug: 'designing-futuristic-hud-telemetry-interfaces',
    title: 'Designing Tech-Forward HUD Telemetry Interfaces for the Web',
    excerpt: 'Crafting glowing tactical interfaces, dark mode glassmorphism, and responsive monospace typography using modern Tailwind CSS.',
    date: '2025-08-04',
    readTime: '7 min read',
    category: 'career',
    tags: ['UI/UX', 'TailwindCSS', 'HUD', 'Glassmorphism', 'Design'],
    author: {
      name: 'Vitor Rodrigues',
      role: 'Staff Frontend Engineer',
    },
    relatedWaypointId: 'mealhada-1982',
    content: `
## Aesthetics as Functional Telemetry

Cybernetic and tactical HUD (Heads-Up Display) designs turn raw portfolio data into an immersive narrative experience. 

### Key UI Elements

- **Monospace Coordinates & Monochromatics:** Using clean monospace fonts (e.g. \`JetBrains Mono\`, \`Fira Code\`) combined with high-contrast accent colors (lime neon, electric emerald).
- **Glassmorphism Backdrop Filters:** Utilizing \`backdrop-blur-md\` with semi-transparent dark overlays (\`bg-[#0a0d09]/85\`) to separate content from dynamic background canvas animations.
- **Interactive Waypoints:** Micro-animations on hover, pulsating indicators, and accessible keyboard focus outlines.
    `,
  },
  {
    id: 'post-5',
    slug: 'building-resilient-frontend-engineering-culture',
    title: 'Building Resilient Engineering Teams & Technical Mentorship',
    excerpt: 'Strategies for leading frontend initiatives, establishing code quality standards, and fostering continuous learning across engineering teams.',
    date: '2025-04-18',
    readTime: '6 min read',
    category: 'career',
    tags: ['Leadership', 'Mentorship', 'Code Quality', 'Engineering Culture'],
    author: {
      name: 'Vitor Rodrigues',
      role: 'Staff Frontend Engineer',
    },
    relatedWaypointId: 'mindera',
    content: `
## Cultivating Technical Excellence

Great engineering teams aren't built solely on tech stacks; they are fostered through clear communication, shared architectural patterns, and psychological safety.

### Actionable Practices

- **RFC-Driven Architecture:** Encouraging engineers to author concise RFCs for major architectural shifts before writing code.
- **Automated Quality Gates:** Enforcing strict TypeScript, linting, and automated unit testing in CI pipelines.
- **Constructive Code Reviews:** Framing PR reviews as learning opportunities rather than gatekeeping checks.
    `,
  },
];
