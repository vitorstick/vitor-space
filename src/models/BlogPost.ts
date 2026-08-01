export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
  category: 'architecture' | 'canvas' | 'performance' | 'mobile' | 'career';
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  relatedWaypointId?: string;
}
