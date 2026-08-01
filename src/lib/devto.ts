import type { DevToArticleDetail, DevToArticleListItem } from '../models/DevToArticle';

const DEV_TO_API_BASE = 'https://dev.to/api';

export async function getDevToArticles(username = 'vitorstick'): Promise<DevToArticleListItem[]> {
  const response = await fetch(`${DEV_TO_API_BASE}/articles/latest?username=${encodeURIComponent(username)}`);
  if (!response.ok) {
    throw new Error(`Dev.to API error: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as DevToArticleListItem[];
  return data;
}

export async function getDevToArticleDetail(idOrSlug: string | number): Promise<DevToArticleDetail> {
  const response = await fetch(`${DEV_TO_API_BASE}/articles/${idOrSlug}`);
  if (!response.ok) {
    throw new Error(`Dev.to API error: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as DevToArticleDetail;
  return data;
}

export function parseDevToTags(tagList: string[] | string | undefined): string[] {
  if (!tagList) return [];
  if (Array.isArray(tagList)) return tagList;
  return tagList
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}
