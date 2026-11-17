import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), sign: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { storage: { from: () => ({ createSignedUrl: mocks.sign }) } },
}));

import { readPublicArticles } from "@/lib/public-articles.server";

describe("Public article image access", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

  function setup(rows: unknown[]) {
    vi.stubEnv("SUPABASE_URL", "https://backend.test");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), range: vi.fn().mockResolvedValue({ data: rows, error: null }) };
    mocks.createClient.mockReturnValue({ from: () => query, storage: { from: () => ({ createSignedUrl: mocks.sign }) } });
    mocks.sign.mockResolvedValue({ data: { signedUrl: "https://backend.test/signed-image" } });
    return query;
  }

  const row = { title: "Provided article", slug: "provided-article", subtitle: "", excerpt: "", category: "Player Development", author: "", date: "", language: "sv", reading_time: "", featured: false, sources: [], body: "Provided text", cover_alt: "", seo_title: "", seo_description: "", cover_image: "journal-images/cover.jpg", og_image: "journal-images/share.jpg", status: "published" };

  it("signs only published image references after the public RLS query", async () => {
    const query = setup([row]);
    await readPublicArticles();
    expect(query.eq).toHaveBeenCalledWith("status", "published");
    expect(mocks.sign.mock.calls).toEqual([["cover.jpg", 3600], ["share.jpg", 3600]]);
  });

  it("does not sign draft references even if an unexpected draft row is returned", async () => {
    setup([{ ...row, status: "draft" }]);
    await readPublicArticles();
    expect(mocks.sign).not.toHaveBeenCalled();
  });

  it("does not access privileged storage when there are no published images", async () => {
    setup([]);
    await readPublicArticles();
    expect(mocks.sign).not.toHaveBeenCalled();
  });
});