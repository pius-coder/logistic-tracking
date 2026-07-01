// Paste this into the browser console on framercoder.com to extract the footer structure
(function () {
  const footer = document.querySelector("footer");
  if (!footer) return console.error("No <footer> found");

  function getNodeInfo(el, depth = 0) {
    if (!el || el.nodeType !== 1) return null;
    const tag = el.tagName.toLowerCase();
    const classes = Array.from(el.classList);
    const styles = {};
    const relevantProps = [
      "display", "position", "width", "height", "max-width", "min-width",
      "padding", "padding-top", "padding-bottom", "padding-left", "padding-right",
      "margin", "margin-top", "margin-bottom",
      "flex-direction", "flex-wrap", "align-items", "align-content",
      "justify-content", "gap", "flex", "flex-grow", "flex-shrink",
      "grid-template-columns", "grid-template-rows", "grid-gap",
      "background", "background-color", "background-image",
      "border", "border-top", "border-bottom", "border-radius",
      "color", "font-size", "font-weight", "font-family", "line-height",
      "letter-spacing", "text-align", "text-transform", "white-space",
      "opacity", "overflow", "z-index", "transform",
      "top", "bottom", "left", "right", "inset",
    ];
    const computed = getComputedStyle(el);
    for (const prop of relevantProps) {
      const val = computed[prop];
      if (val && val !== "none" && val !== "normal" && val !== "0px" && val !== "auto") {
        styles[prop] = val;
      }
    }

    const result = {
      tag,
      classes,
      styles,
      text: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3
        ? el.childNodes[0].textContent.trim()
        : null,
      children: [],
    };

    if (el.shadowRoot) {
      el.shadowRoot.querySelectorAll("*").forEach((child) => {
        const info = getNodeInfo(child, depth + 1);
        if (info) result.children.push(info);
      });
      return result;
    }

    for (const child of el.children) {
      const info = getNodeInfo(child, depth + 1);
      if (info) result.children.push(info);
    }

    if (el.tagName === "SVG") {
      result.svgContent = el.outerHTML;
    }

    return result;
  }

  const data = getNodeInfo(footer);
  console.log("=== FOOTER EXTRACTION ===");
  console.log(JSON.stringify(data, null, 2));
  console.log("=== FLAT CLASS LIST ===");
  const allClasses = new Set();
  function collectClasses(node) {
    if (!node) return;
    node.classes?.forEach((c) => allClasses.add(c));
    node.children?.forEach(collectClasses);
  }
  collectClasses(data);
  console.log(Array.from(allClasses).join("\n"));
  console.log("=== DONE ===");
  return data;
})();
