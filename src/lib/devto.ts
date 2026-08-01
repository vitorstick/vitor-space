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
  const target = String(idOrSlug).trim();

  // Try direct endpoint first (works for IDs like 1499931 and full path slugs)
  let response = await fetch(`${DEV_TO_API_BASE}/articles/${target}`);

  // Fallback for username/slug if direct endpoint returns 404 and target is not pure numbers
  if (!response.ok && response.status === 404 && !/^\d+$/.test(target)) {
    response = await fetch(`${DEV_TO_API_BASE}/articles/vitorstick/${target}`);
  }

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
