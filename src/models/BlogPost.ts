export interface BlogPost {
  id: number;
  title: string;
  description: string;
  slug: string;
  path: string;
  url: string;
  published_timestamp: string;
  cover_image: string;
  social_image: string;
  canonical_url: string;
  created_at: string;
  reading_time_minutes: number;
  tag_list: string[];
  tags: string;
  category?: 'architecture' | 'canvas' | 'performance' | 'mobile' | 'career';
  author?: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  relatedWaypointId?: string;
}

export interface BlogPostDetail {
  type_of: string;
  id: number;
  title: string;
  slug: string;
  path: string;
  url: string;
  cover_image: string;
  social_image: string;
  canonical_url: string;
  page_views_count: number;
  published_timestamp: string;
  published_at: string;
  reading_time_minutes: number;
  tag_list: string[];
  tags: string;
  body_html: string;
  body_markdown: string;
  category?: 'architecture' | 'canvas' | 'performance' | 'mobile' | 'career';
  author?: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  relatedWaypointId?: string;
}
