// Paste this in the console on framercoder.com.
// It walks the ENTIRE footer tree and outputs ALL computed CSS + class + tag data.
// Copy the output and paste it here so I can implement it exactly.

(function () {
  const footer = document.querySelector("footer");
  if (!footer) return console.error("No footer found");

  const ALL_PROPS = [
    // Layout
    "display", "position", "width", "height", "min-width", "max-width", "min-height", "max-height",
    "flex", "flex-direction", "flex-wrap", "flex-grow", "flex-shrink", "flex-basis",
    "align-items", "align-content", "align-self", "justify-content", "justify-items", "justify-self",
    "gap", "row-gap", "column-gap", "grid-gap", "grid-template-columns", "grid-template-rows",
    "order",
    // Spacing
    "padding", "padding-top", "padding-bottom", "padding-left", "padding-right",
    "margin", "margin-top", "margin-bottom", "margin-left", "margin-right",
    "top", "right", "bottom", "left", "inset",
    // Box
    "box-sizing", "border", "border-top", "border-bottom", "border-left", "border-right",
    "border-width", "border-style", "border-color",
    "border-radius", "border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius",
    "outline", "outline-width", "outline-style", "outline-color",
    // Background
    "background", "background-color", "background-image", "background-size", "background-position",
    "background-repeat", "background-clip", "background-origin",
    "box-shadow",
    // Typography
    "font-family", "font-size", "font-weight", "font-style", "font-variant", "font-stretch",
    "line-height", "letter-spacing", "word-spacing", "white-space", "text-align",
    "text-transform", "text-decoration", "text-decoration-line", "text-decoration-style", "text-decoration-color",
    "text-indent", "text-overflow", "text-shadow",
    "color", "opacity",
    // Overflow / Clip
    "overflow", "overflow-x", "overflow-y", "clip", "clip-path",
    // Positioning
    "z-index", "transform", "transform-origin", "transform-style",
    "perspective", "perspective-origin", "backface-visibility",
    "will-change",
    // Visual
    "mix-blend-mode", "isolation",
    "filter", "backdrop-filter",
    // Pointer / Events
    "pointer-events", "user-select", "cursor",
    // SVG / Image
    "object-fit", "object-position",
    "image-rendering",
    // Animation
    "animation", "animation-name", "animation-duration", "animation-timing-function",
    "animation-delay", "animation-iteration-count", "animation-direction",
    "animation-fill-mode", "animation-play-state",
    "transition", "transition-property", "transition-duration", "transition-timing-function", "transition-delay",
    // List
    "list-style", "list-style-type", "list-style-position",
    // Table
    "border-collapse", "border-spacing",
    "empty-cells",
    "caption-side",
    // Columns
    "columns", "column-count", "column-gap", "column-rule", "column-width",
    // Misc
    "visibility", "float", "clear",
    "writing-mode", "direction", "unicode-bidi",
    "tab-size",
    "orphans", "widows",
    "content",
    "mask-image", "mask-size", "mask-position", "mask-repeat",
    "-webkit-mask-image", "-webkit-mask-size", "-webkit-mask-position", "-webkit-mask-repeat",
    "scroll-behavior",
    "contain",
    "aspect-ratio",
  ];

  const results = [];

  function walk(el, depth = 0) {
    if (el.nodeType !== 1) return;
    const tag = el.tagName.toLowerCase();
    const classes = Array.from(el.classList);
    const inlineStyle = el.getAttribute("style") || "";
    const style = getComputedStyle(el);
    const computed = {};
    for (const prop of ALL_PROPS) {
      const val = style[prop];
      if (val && val !== "none" && val !== "normal" && val !== "auto" && val !== "0px" && val !== "" && val !== "initial" && val !== "inherit") {
        computed[prop] = val;
      }
    }
    const entry = {
      tag,
      classes,
      "data-framer-name": el.getAttribute("data-framer-name") || "",
      "data-framer-component-type": el.getAttribute("data-framer-component-type") || "",
      href: el.getAttribute("href") || "",
      target: el.getAttribute("target") || "",
      rel: el.getAttribute("rel") || "",
      src: el.getAttribute("src") || "",
      alt: el.getAttribute("alt") || "",
      "aria-hidden": el.getAttribute("aria-hidden") || "",
      style_inline: inlineStyle,
      computed,
      text: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 ? el.textContent.trim() : "",
    };
    if (entry.text) {
      entry.textContent = el.textContent;
    }
    results.push(entry);

    for (const child of el.children) {
      walk(child, depth + 1);
    }
  }

  walk(footer);

  console.log("=== FULL FOOTER EXTRACTION ===");
  console.log(JSON.stringify(results, null, 2));
  console.log("Nodes:", results.length);
  console.log("=== COPY ABOVE JSON ===");
})();
