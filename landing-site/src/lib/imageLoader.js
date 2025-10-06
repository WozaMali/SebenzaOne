// Custom image loader for static export
export default function imageLoader({ src, width, quality }) {
  // For static export, return the src as-is since images are in public folder
  return src;
}
