/**
 * Resolves a formation's imageUrl into something a browser can actually
 * load. Handles both cases that can appear in the database:
 *  - relative paths from our own upload endpoint, e.g.
 *    "/uploads/formations/abc123.jpg" — these need the backend's origin
 *    prefixed, since the browser would otherwise resolve them against
 *    the Angular dev server's origin (localhost:4200) and get a 404.
 *  - full external URLs (e.g. paste-a-URL fallback) — returned as-is.
 *
 * Falls back to a provided placeholder when imageUrl is null/empty.
 */
export function resolveFormationImageUrl(
  imageUrl: string | null | undefined,
  fallback: string,
  backendOrigin: string = 'http://localhost:8080'
): string {
  if (!imageUrl) {
    return fallback;
  }
  return imageUrl.startsWith('http') ? imageUrl : `${backendOrigin}${imageUrl}`;
}
