import sanitizeHtml from "sanitize-html";

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a", "strong", "em", "i", "b", "u", "s",
      "table", "thead", "tbody", "tr", "th", "td",
      "img", "figure", "figcaption",
      "div", "span",
    ],
    allowedAttributes: {
      "a": ["href", "target", "rel", "title"],
      "img": ["src", "alt", "title", "width", "height"],
      "td": ["colspan", "rowspan"],
      "th": ["colspan", "rowspan"],
      "div": ["class"],
      "span": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
  });
}
