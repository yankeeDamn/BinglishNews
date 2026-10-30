/** @typedef {import('../../types/index').Article} Article */
/**
 * Select from one bounded provider snapshot.
 * @param {Article[]} articles
 * @param {{ page: number, pageSize: number, region?: string, category?: string, query?: string }} options
 * @returns {{ articles: Article[], total: number }}
 */
export function selectNews(articles, { page, pageSize, region, category, query }) {
  const urls = new Set();
  const titles = new Set();
  const unique = [];
  for (const article of articles) {
    if (!article.url && !article.title) continue;
    const url = article.url.split('?')[0].split('#')[0];
    const title = article.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    if ((url && urls.has(url)) || (title.length > 10 && titles.has(title))) continue;
    if (url) urls.add(url);
    if (title.length > 10) titles.add(title);
    unique.push(article);
  }
  let filtered = unique;
  if (region === 'IN' || category === 'india') {
    filtered = filtered.filter((a) => a.category === 'india' || a.region === 'IN' || (a.region || '').toLowerCase().includes('india'));
  } else if (category === 'world' || category === 'tech') {
    filtered = filtered.filter((a) => a.category === category);
  }
  const term = query?.trim().toLocaleLowerCase();
  if (term) filtered = filtered.filter((a) => `${a.title} ${a.summary}`.toLocaleLowerCase().includes(term));
  filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return { articles: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}
