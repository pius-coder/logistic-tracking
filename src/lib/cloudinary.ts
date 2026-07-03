const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_NAME ||
  process.env.CLOUDINARY_NAME ||
  "dgcnhlzwl";
const BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

function buildTransforms(options?: { w?: number; h?: number }): string[] {
  const transforms = ["q_auto", "f_auto"];
  if (options?.w) transforms.unshift(`w_${options.w}`);
  if (options?.h) transforms.unshift(`h_${options.h}`);
  return transforms;
}

/**
 * Transform an image src to a Cloudinary URL with auto-optimization.
 *
 * - Local path: extracts filename, builds full Cloudinary URL with transforms
 * - Full Cloudinary URL (same cloud): rebuilds with transforms applied
 * - Other http URL: returned as-is (external image, non-Cloudinary)
 * - Cloudinary disabled (NEXT_PUBLIC_USE_CLOUDINARY !== 'true'): returns src unchanged
 */
export function cloudinary(
  src: string,
  options?: { w?: number; h?: number },
): string {
  if (process.env.NEXT_PUBLIC_USE_CLOUDINARY !== "true") return src;

  const cloudinaryPrefix = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;

  if (src.startsWith(cloudinaryPrefix)) {
    // Already a Cloudinary URL for our cloud — rebuild with transforms
    const rest = src.slice(cloudinaryPrefix.length);
    // Strip existing transform segments (everything before first slash that contains only word chars, numbers, underscores, %, and commas)
    const publicId = rest.replace(/^[\w%,._-]+\//, "").replace(/\?.*$/, "");
    const transforms = buildTransforms(options);
    return `${cloudinaryPrefix}${transforms.join(",")}/${publicId}`;
  }

  if (src.startsWith("http")) return src;

  const filename = src.split("/").pop() || src;
  const transforms = buildTransforms(options);
  return `${BASE}/${transforms.join(",")}/${filename}`;
}
