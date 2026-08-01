export interface DevToUser {
  name: string;
  username: string;
  twitter_username: string | null;
  github_username: string | null;
  user_id: number;
  website_url: string | null;
  profile_image: string;
  profile_image_90: string;
}

export interface DevToArticleListItem {
  type_of: string;
  id: number;
  title: string;
  description: string;
  readable_publish_date: string;
  slug: string;
  path: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  published_timestamp: string;
  cover_image: string | null;
  social_image: string | null;
  canonical_url: string;
  created_at: string;
  published_at: string;
  reading_time_minutes: number;
  tag_list: string[] | string;
  tags?: string[];
  user: DevToUser;
}

export interface DevToArticleDetail extends DevToArticleListItem {
  body_html: string;
  body_markdown: string;
}
