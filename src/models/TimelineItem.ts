export type TimelineType = 'location' | 'code' | 'project' | 'milestone';

export type TimelineItem = {
  id: string;
  type: TimelineType;
  title: string;
  role?: string;
  company?: string;
  description: string | null;
  bullets?: string[];
  technologies?: string[];
  date: string;
  routeProgressPercentage: number;
  status?: string;
}