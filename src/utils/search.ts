import { server } from './helper'

export async function searchNews(query: string) {
  try {
    const response = await fetch(`${server.BASE_URL}/news/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}
