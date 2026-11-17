import { describe, expect, it } from "vitest";
import { formatSelection } from "@/lib/editor-formatting";
describe("Markdown formatting", () => {
  it("formats selected text without overwriting surrounding paragraphs", () => {
    expect(formatSelection("Before word after", 7, 11, "bold").value).toBe("Before **word** after");
  });
  it("supports H2 and H3 headings", () => {
    expect(formatSelection("Heading", 0, 7, "h2").value).toBe("## Heading");
    expect(formatSelection("Heading", 0, 7, "h3").value).toBe("### Heading");
  });
  it("formats blockquotes and lists", () => {
    expect(formatSelection("One\nTwo", 0, 7, "quote").value).toBe("> One\n> Two");
    expect(formatSelection("One\nTwo", 0, 7, "bullet").value).toBe("- One\n- Two");
    expect(formatSelection("One\nTwo", 0, 7, "number").value).toBe("1. One\n2. Two");
  });
  it("inserts a clickable link and paragraph break", () => {
    expect(formatSelection("Paper", 0, 5, "link", "https://journal.test/paper").value).toBe("[Paper](https://journal.test/paper)");
    expect(formatSelection("OneTwo", 3, 3, "paragraph").value).toBe("One\n\nTwo");
  });
});