import type { BlogPostDetail } from '../models/BlogPost';

export const posts: BlogPostDetail[] = [
  {
    type_of: 'article',
    id: 1,
    title: 'Procedural Topographical Maps: Rendering 60FPS Iso-Contours with Canvas 2D & GSAP',
    description: 'A deep dive into combining simplex-noise, d3-contour, and GSAP ScrollTrigger to render smooth, scroll-synced topographic vector lines without GPU overhead.',
    slug: 'procedural-canvas-iso-contours-gsap',
    path: '/blog/procedural-canvas-iso-contours-gsap',
    url: 'https://dev.to/vitor/procedural-canvas-iso-contours-gsap',
    published_timestamp: '2026-03-15T10:00:00Z',
    published_at: '2026-03-15T10:00:00Z',
    created_at: '2026-03-15T09:00:00Z',
    cover_image: '',
    social_image: '',
    canonical_url: 'https://dev.to/vitor/procedural-canvas-iso-contours-gsap',
    page_views_count: 1420,
    reading_time_minutes: 6,
    tag_list: ['Canvas2D', 'GSAP', 'd3-contour', 'Performance', 'Mathematics'],
    tags: 'Canvas2D, GSAP, d3-contour, Performance, Mathematics',
    body_html: '',
    category: 'canvas',
    author: {
      name: 'Vitor Rodrigues',
      role: 'Staff Frontend Engineer',
    },
    relatedWaypointId: 'semmiewealth',
    body_markdown: `
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
    type_of: 'article',
    id: 2,
    title: 'Architecting Hybrid Mobile & Web Frontend Systems at Scale',
    description: 'Lessons learned leading cross-platform engineering teams across React, React Native, and web design systems.',
    slug: 'scaling-hybrid-mobile-web-frontend-architecture',
    path: '/blog/scaling-hybrid-mobile-web-frontend-architecture',
    url: 'https://dev.to/vitor/scaling-hybrid-mobile-web-frontend-architecture',
    published_timestamp: '2026-01-10T10:00:00Z',
    published_at: '2026-01-10T10:00:00Z',
    created_at: '2026-01-10T09:00:00Z',
    cover_image: '',
    social_image: '',
    canonical_url: 'https://dev.to/vitor/scaling-hybrid-mobile-web-frontend-architecture',
    page_views_count: 980,
    reading_time_minutes: 8,
    tag_list: ['Architecture', 'React', 'React Native', 'Design Systems', 'TypeScript'],
    tags: 'Architecture, React, React Native, Design Systems, TypeScript',
    body_html: '',
    category: 'architecture',
    author: {
      name: 'Vitor Rodrigues',
      role: 'Staff Frontend Engineer',
    },
    relatedWaypointId: 'mindera',
    body_markdown: `
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
    type_of: 'article',
    id: 3,
    title: 'High-Frequency Scroll State in React 19: Avoiding Unnecessary Re-Renders',
    description: 'How to bind high-frequency scroll telemetry (GSAP scrub handlers) to React components without bottlenecking the main UI loop.',
    slug: 'optimizing-react-19-scroll-driven-animations',
    path: '/blog/optimizing-react-19-scroll-driven-animations',
    url: 'https://dev.to/vitor/optimizing-react-19-scroll-driven-animations',
    published_timestamp: '2025-11-22T10:00:00Z',
    published_at: '2025-11-22T10:00:00Z',
    created_at: '2025-11-22T09:00:00Z',
    cover_image: '',
    social_image: '',
    canonical_url: 'https://dev.to/vitor/optimizing-react-19-scroll-driven-animations',
    page_views_count: 2150,
    reading_time_minutes: 5,
    tag_list: ['React 19', 'Performance', 'DOM Sync', 'Hooks'],
    tags: 'React 19, Performance, DOM Sync, Hooks',
    body_html: '',
    category: 'performance',
    author: {
      name: 'Vitor Rodrigues',
      role: 'Staff Frontend Engineer',
    },
    relatedWaypointId: 'semmiewealth',
    body_markdown: `
## The Problem with High-Frequency State

Updating React state on every frame during a smooth scroll event (\`window.onscroll\` or \`requestAnimationFrame\`) often triggers excessive virtual DOM recalculations, dropping frame rates on mid-range devices.

### Recommended Solutions

1. **Direct Canvas Mutation:** Perform background terrain drawing directly inside the GSAP \`onUpdate\` callback without passing raw progress values through React state.
2. **Throttled Telemetry HUD:** Throttle visual percentage displays (e.g. updating the HUD counter only when scroll percentage shifts by >1%).
3. **Ref-based Coordinates:** Storing calculated SVG path coordinates in React \`useRef\` or \`useMemo\` buffers rather than component state.
    `,
  },
  {
    type_of: 'article',
    id: 4,
    title: 'Designing Tech-Forward HUD Telemetry Interfaces for the Web',
    description: 'Crafting glowing tactical interfaces, dark mode glassmorphism, and responsive monospace typography using modern Tailwind CSS.',
    slug: 'designing-futuristic-hud-telemetry-interfaces',
    path: '/blog/designing-futuristic-hud-telemetry-interfaces',
    url: 'https://dev.to/vitor/designing-futuristic-hud-telemetry-interfaces',
    published_timestamp: '2025-08-04T10:00:00Z',
    published_at: '2025-08-04T10:00:00Z',
    created_at: '2025-08-04T09:00:00Z',
    cover_image: '',
    social_image: '',
    canonical_url: 'https://dev.to/vitor/designing-futuristic-hud-telemetry-interfaces',
    page_views_count: 1890,
    reading_time_minutes: 7,
    tag_list: ['UI/UX', 'TailwindCSS', 'HUD', 'Glassmorphism', 'Design'],
    tags: 'UI/UX, TailwindCSS, HUD, Glassmorphism, Design',
    body_html: '',
    category: 'career',
    author: {
      name: 'Vitor Rodrigues',
      role: 'Staff Frontend Engineer',
    },
    relatedWaypointId: 'mealhada-1982',
    body_markdown: `
## Aesthetics as Functional Telemetry

Cybernetic and tactical HUD (Heads-Up Display) designs turn raw portfolio data into an immersive narrative experience. 

### Key UI Elements

- **Monospace Coordinates & Monochromatics:** Using clean monospace fonts (e.g. \`JetBrains Mono\`, \`Fira Code\`) combined with high-contrast accent colors (lime neon, electric emerald).
- **Glassmorphism Backdrop Filters:** Utilizing \`backdrop-blur-md\` with semi-transparent dark overlays (\`bg-[#0a0d09]/85\`) to separate content from dynamic background canvas animations.
- **Interactive Waypoints:** Micro-animations on hover, pulsating indicators, and accessible keyboard focus outlines.
    `,
  },
  {
    type_of: 'article',
    id: 5,
    title: 'Building Resilient Engineering Teams & Technical Mentorship',
    description: 'Strategies for leading frontend initiatives, establishing code quality standards, and fostering continuous learning across engineering teams.',
    slug: 'building-resilient-frontend-engineering-culture',
    path: '/blog/building-resilient-frontend-engineering-culture',
    url: 'https://dev.to/vitor/building-resilient-frontend-engineering-culture',
    published_timestamp: '2025-04-18T10:00:00Z',
    published_at: '2025-04-18T10:00:00Z',
    created_at: '2025-04-18T09:00:00Z',
    cover_image: '',
    social_image: '',
    canonical_url: 'https://dev.to/vitor/building-resilient-frontend-engineering-culture',
    page_views_count: 760,
    reading_time_minutes: 6,
    tag_list: ['Leadership', 'Mentorship', 'Code Quality', 'Engineering Culture'],
    tags: 'Leadership, Mentorship, Code Quality, Engineering Culture',
    body_html: '',
    category: 'career',
    author: {
      name: 'Vitor Rodrigues',
      role: 'Staff Frontend Engineer',
    },
    relatedWaypointId: 'mindera',
    body_markdown: `
## Cultivating Technical Excellence

Great engineering teams aren't built solely on tech stacks; they are fostered through clear communication, shared architectural patterns, and psychological safety.

### Actionable Practices

- **RFC-Driven Architecture:** Encouraging engineers to author concise RFCs for major architectural shifts before writing code.
- **Automated Quality Gates:** Enforcing strict TypeScript, linting, and automated unit testing in CI pipelines.
- **Constructive Code Reviews:** Framing PR reviews as learning opportunities rather than gatekeeping checks.
    `,
  },
];
