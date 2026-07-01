// Paste this in your browser console on the Framer page.
// It extracts all CSS classes, computed styles, structure, and inline styles
// for the #featues section (yes, the ID is literally "featues" in the Framer HTML).

(function () {
  const section = document.querySelector("#featues, [data-framer-name='Features']");
  if (!section) {
    console.error("❌ Could not find #featues element");
    return;
  }

  const results = [];

  function walk(el, depth = 0) {
    const tag = el.tagName.toLowerCase();
    const classes = Array.from(el.classList).join(" ");
    const styles = getComputedStyle(el);
    const inline = el.getAttribute("style") || "";

    const data = {
      tag,
      depth,
      classes,
      id: el.id || "",
      "data-framer-name": el.getAttribute("data-framer-name") || "",
      "data-framer-appear-id": el.getAttribute("data-framer-appear-id") || "",
      href: el.getAttribute("href") || "",
      target: el.getAttribute("target") || "",
      rel: el.getAttribute("rel") || "",
      src: el.getAttribute("src") || "",
      alt: el.getAttribute("alt") || "",
      "aria-hidden": el.getAttribute("aria-hidden") || "",
      role: el.getAttribute("role") || "",
      "data-framer-component-type": el.getAttribute("data-framer-component-type") || "",
      "data-code-component-plugin-id": el.getAttribute("data-code-component-plugin-id") || "",
      style_inline: inline,
      computed: {
        display: styles.display,
        position: styles.position,
        width: styles.width,
        height: styles.height,
        flexDirection: styles.flexDirection,
        flexWrap: styles.flexWrap,
        flexShrink: styles.flexShrink,
        alignItems: styles.alignItems,
        justifyContent: styles.justifyContent,
        gap: styles.gap,
        padding: styles.padding,
        margin: styles.margin,
        inset: `${styles.top} ${styles.right} ${styles.bottom} ${styles.left}`,
        borderRadius: styles.borderRadius,
        background: styles.background,
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        boxShadow: styles.boxShadow,
        backdropFilter: styles.backdropFilter,
        opacity: styles.opacity,
        overflow: styles.overflow,
        zIndex: styles.zIndex,
        transform: styles.transform,
        willChange: styles.willChange,
        pointerEvents: styles.pointerEvents,
        mixBlendMode: styles.mixBlendMode,
        maskImage: styles.maskImage,
        WebkitMaskImage: styles.WebkitMaskImage,
        clipPath: styles.clipPath,
        objectFit: styles.objectFit,
        objectPosition: styles.objectPosition,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
        letterSpacing: styles.letterSpacing,
        color: styles.color,
        textAlign: styles.textAlign,
        whiteSpace: styles.whiteSpace,
        animationName: styles.animationName,
        animationDuration: styles.animationDuration,
        animationTimingFunction: styles.animationTimingFunction,
        animationIterationCount: styles.animationIterationCount,
        animationPlayState: styles.animationPlayState,
        transformOrigin: styles.transformOrigin,
      },
      text: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 ? el.textContent.trim() : "",
    };

    results.push(data);

    // Recurse into children (skip text nodes)
    for (const child of el.children) {
      walk(child, depth + 1);
    }

    // Also capture inline <style> blocks
    if (tag === "style") {
      results.push({
        tag: "style",
        depth,
        text: el.textContent.trim(),
      });
    }

    // Capture SVG <use> href
    if (tag === "use") {
      results.push({
        tag: "use",
        depth: depth + 1,
        href: el.getAttribute("href") || "",
      });
    }

    // Capture video sources
    if (tag === "video") {
      results.push({
        tag: "video",
        depth,
        src: el.getAttribute("src") || "",
        loop: el.hasAttribute("loop"),
        muted: el.hasAttribute("muted"),
        playsinline: el.hasAttribute("playsinline"),
        autoplay: el.hasAttribute("autoplay"),
        preload: el.getAttribute("preload") || "",
      });
    }
  }

  walk(section);

  const json = JSON.stringify(results, null, 2);
  console.log("✅ Extracted", results.length, "nodes");
  console.log(json);
  copy(json);
  console.log("📋 Copied to clipboard!");
  console.log("⚠️ Total characters:", json.length);
})();
