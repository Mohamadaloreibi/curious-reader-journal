import { describe, expect, it } from "vitest";
import { articles, categories, categoryArticles, parseArticle, searchArticles } from "@/lib/articles";

describe("Editorial content rules", () => {
  it("contains only the supplied first article", () => {
    expect(articles).toHaveLength(1);
    expect(articles[0]?.title).toBe("Vi vill ha spelare som tänker själva. Men tränar vi dem för det?");
    expect(articles[0]?.slug).toBe("vi-vill-ha-spelare-som-tanker-sjalva");
  });
  it("does not fabricate a missing manuscript, metadata, or sources", () => {
    expect(articles[0]).toMatchObject({ body: "", author: "", date: "", excerpt: "", subtitle: "", readingTime: "", sources: [], language: "sv", featured: true });
  });
  it("leaves all unprovided category content empty", () => {
    expect(categoryArticles("Coaching")).toHaveLength(0);
    expect(categoryArticles("Tactics")).toHaveLength(0);
    expect(categoryArticles("Research")).toHaveLength(0);
    expect(categoryArticles("Player Development")).toHaveLength(1);
    expect(categories).toHaveLength(4);
  });
  it("preserves a supplied Markdown manuscript exactly", () => {
    const body = "## Heading\n\nWords in Swedish: tänker själva.\n\n> A supplied quotation.\n\nSource [1].";
    const raw = `---\ntitle: Test\nslug: test\ncategory: Coaching\nlanguage: en\n---\n${body}\n`;
    expect(parseArticle(raw).body).toBe(body);
  });
  it("searches the supplied title and returns no invented results", () => {
    expect(searchArticles("TÄNKER")).toHaveLength(1);
    expect(searchArticles("nonexistent article")).toHaveLength(0);
  });
});