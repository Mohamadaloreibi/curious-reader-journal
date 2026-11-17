import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleContent } from "@/components/article-content";
describe("Editorial content rendering", () => {
  it("renders semantic Markdown and structured references without running embedded HTML", () => {
    const { container } = render(<ArticleContent language="sv" body={'## Heading\n\n### Detail\n\n**Strong** paragraph [1]\n\n> Quoted text\n\n- First\n- Second\n\n1. Ordered\n\n[Paper](https://journal.test/paper)\n\n<script>alert(1)</script>'} sources={[{ title: "Research paper", authors: "A. Author", year: "2024", url: "https://journal.test/source" }]} />);
    expect(screen.getByRole("heading", { level: 2, name: "Heading" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Detail" })).toBeInTheDocument();
    expect(container.querySelector("strong")?.textContent).toBe("Strong");
    expect(container.querySelector("blockquote")?.textContent).toContain("Quoted text");
    expect(container.querySelector("ul li")?.textContent).toBe("First");
    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute("href", "#reference-1");
    expect(screen.getByRole("link", { name: "Research paper" })).toHaveAttribute("href", "https://journal.test/source");
    expect(screen.getByText("A. Author (2024)")).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
  });
});