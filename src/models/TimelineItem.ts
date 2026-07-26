export type TimelineType = 'location' | 'code' | 'project' | 'milestone';

export type TimelineItem = {
  id: string;
  type: TimelineType;
  title: string;
  description: string | null;
  date: string;
  routeProgressPercentage: number;
}