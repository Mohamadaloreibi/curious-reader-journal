import type { Article } from "./articles";
import { mission } from "./articles";
export function xmlEscape(value: string) { return value.replace(/[<>&"']/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c] ?? c); }
export function createRss(articles: Article[], origin: string) {
  const items = articles.filter(a => a.body.trim()).map(a => {
    const link = `${origin}/articles/${a.slug}`;
    const date = a.date && !Number.isNaN(Date.parse(a.date)) ? `<pubDate>${new Date(a.date).toUTCString()}</pubDate>` : "";
    return `<item><title>${xmlEscape(a.title)}</title><link>${xmlEscape(link)}</link><guid isPermaLink="true">${xmlEscape(link)}</guid><description>${xmlEscape(a.excerpt || a.subtitle || a.title)}</description><category>${xmlEscape(a.category)}</category>${date}</item>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>The Football Development Journal</title><link>${xmlEscape(origin)}</link><description>${xmlEscape(mission)}</description><atom:link href="${xmlEscape(origin)}/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
}