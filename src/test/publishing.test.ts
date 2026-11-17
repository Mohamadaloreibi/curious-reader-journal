import { describe, expect, it } from "vitest";
import { assertAdmin, mergeArticles, publishingSchema } from "@/lib/publishing";
import { articles } from "@/lib/articles";
import { createRss } from "@/lib/rss";
const draft = { ...articles[0], title: "Test", slug: "test", readingTime: "", status: "draft" };
describe("Admin publication rules", () => {
  it("requires explicit admin permission", () => { expect(() => assertAdmin(false)).toThrow(); expect(() => assertAdmin(null)).toThrow(); expect(() => assertAdmin(true)).not.toThrow(); });
  it("permits an empty draft but rejects publishing empty text", () => { expect(publishingSchema.safeParse(draft).success).toBe(true); expect(publishingSchema.safeParse({ ...draft, status: "published" }).success).toBe(false); expect(publishingSchema.safeParse({ ...draft, body: "Provided manuscript", status: "published" }).success).toBe(true); });
  it("lets an admin-published article replace its Markdown placeholder", () => { const first = articles[0]; if (!first) throw new Error("Missing supplied article"); const result = mergeArticles(articles, [{ ...first, body: "Supplied final text" }]); expect(result).toHaveLength(1); expect(result[0]?.body).toBe("Supplied final text"); });
  it("preserves replacement text and cover image on the existing article", () => {
    const first = articles[0]; if (!first) throw new Error("Missing supplied article");
    const edited = publishingSchema.parse({ ...first, readingTime: "", body: "Rewritten manuscript", coverImage: "journal-images/test-image.jpg", coverAlt: "Training pitch", status: "published" });
    const result = mergeArticles(articles, [edited]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ slug: first.slug, body: "Rewritten manuscript", coverImage: "journal-images/test-image.jpg", coverAlt: "Training pitch" });
  });
  it("excludes missing manuscripts from RSS", () => { expect(createRss(articles, "https://journal.test")).not.toContain("<item>"); });
  it("includes completed articles with escaped XML and absolute links", () => { const first = articles[0]; if (!first) throw new Error("Missing supplied article"); const xml = createRss([{ ...first, title: "A & B <C>", body: "Text", date: "2026-11-17" }], "https://journal.test"); expect(xml).toContain("A &amp; B &lt;C&gt;"); expect(xml).toContain(`https://journal.test/articles/${first.slug}`); expect(xml).toContain("Tue, 17 Nov 2026 00:00:00 GMT"); });
});