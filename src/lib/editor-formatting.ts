export type Format = "h2" | "h3" | "bold" | "quote" | "bullet" | "number" | "paragraph" | "link";
export function formatSelection(value: string, start: number, end: number, format: Format, url = "") {
  const selected = value.slice(start, end);
  const text = selected || (format === "link" ? "Länktext" : "Text");
  const prefixes = { h2: "## ", h3: "### ", quote: "> ", bullet: "- ", number: "1. " };
  let insertion: string;
  if (format === "bold") insertion = `**${text}**`;
  else if (format === "link") insertion = `[${text}](${url})`;
  else if (format === "paragraph") insertion = `\n\n${selected}`;
  else insertion = text.split("\n").map((line, i) => `${format === "number" ? `${i + 1}. ` : prefixes[format]}${line}`).join("\n");
  if (["h2", "h3", "quote", "bullet", "number"].includes(format)) {
    if (start > 0 && value[start - 1] !== "\n") insertion = `\n\n${insertion}`;
    if (end < value.length && value[end] !== "\n") insertion += "\n\n";
  }
  return { value: value.slice(0, start) + insertion + value.slice(end), start, end: start + insertion.length };
}