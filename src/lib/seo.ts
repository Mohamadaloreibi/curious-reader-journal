const name = "The Football Development Journal";
export function editorialHead(title: string, description: string, path: string, type = "website") {
  const fullTitle = title === name ? title : `${title} — ${name}`;
  return {
    meta: [
      { title: fullTitle }, { name: "description", content: description },
      { property: "og:title", content: fullTitle }, { property: "og:description", content: description },
      { property: "og:type", content: type }, { property: "og:url", content: path },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle }, { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: path }],
  };
}