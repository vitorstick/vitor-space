export type TimelineItem = {
  id: string
  title: string
  description: string
  date: string
  routeProgressPercentage: number
}

export const timeline: TimelineItem[] = [
  {
    id: 'atlas-01',
    title: 'Atlas Commerce Rebuild',
    description:
      'Migrated a legacy storefront to a component-driven architecture with server-side rendering and faster checkout flows.',
    date: '2023-04',
    routeProgressPercentage: 0.12,
  },
  {
    id: 'signal-02',
    title: 'SignalOps Dashboard',
    description:
      'Designed a telemetry dashboard that unified incident data and reduced triage time for on-call engineers.',
    date: '2023-11',
    routeProgressPercentage: 0.31,
  },
  {
    id: 'northstar-03',
    title: 'Northstar Design System',
    description:
      'Introduced tokens, accessibility guardrails, and reusable patterns consumed by four product teams.',
    date: '2024-05',
    routeProgressPercentage: 0.52,
  },
  {
    id: 'relay-04',
    title: 'Relay Data Platform',
    description:
      'Built an event ingestion layer with real-time views and historical replay for product analytics.',
    date: '2024-12',
    routeProgressPercentage: 0.74,
  },
  {
    id: 'orbit-05',
    title: 'Orbit Mobile Launch',
    description:
      'Led cross-platform delivery and rollout strategy, shipping a polished v1 to iOS and Android.',
    date: '2025-09',
    routeProgressPercentage: 0.91,
  },
]
