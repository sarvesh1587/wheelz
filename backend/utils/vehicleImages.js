/**
 * Vehicle image helpers
 *
 * Uploaded photos are stored inline as base64 data URIs, which made every
 * vehicle list response several megabytes. API responses now swap each inline
 * image for a URL to GET /api/vehicles/:id/images/:index, which streams the
 * binary with long-lived caching. Writes map those URLs back to the stored
 * data so editing a vehicle keeps its photos.
 */

const PORT = process.env.PORT || 5000;
const API_ORIGIN = (
  process.env.PUBLIC_API_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  `http://localhost:${PORT}`
).replace(/\/+$/, "").replace(/\/api$/, "");

const IMAGE_URL_RE = /\/api\/vehicles\/([a-f0-9]{24})\/images\/(\d+)/i;

const isInline = (img) => typeof img === "string" && img.startsWith("data:");

// Cheap content version so a replaced photo at the same index busts caches.
const version = (img) => `${img.length.toString(36)}${img.slice(-8).replace(/[^a-z0-9]/gi, "")}`;

function toPublicImages(id, images) {
  if (!Array.isArray(images)) return images;
  return images.map((img, i) =>
    isInline(img) ? `${API_ORIGIN}/api/vehicles/${id}/images/${i}?v=${version(img)}` : img,
  );
}

// Turn image URLs that point back at this API into the stored data again.
function restoreImages(id, stored = [], incoming) {
  if (!Array.isArray(incoming)) return incoming;
  return incoming.map((img) => {
    const m = typeof img === "string" && img.match(IMAGE_URL_RE);
    if (m && m[1] === String(id) && stored[Number(m[2])] !== undefined) {
      return stored[Number(m[2])];
    }
    return img;
  });
}

function decodeDataUri(img) {
  const m = isInline(img) && img.match(/^data:([^;,]+)?(;base64)?,(.*)$/s);
  if (!m) return null;
  return {
    type: m[1] || "application/octet-stream",
    body: m[2] ? Buffer.from(m[3], "base64") : Buffer.from(decodeURIComponent(m[3])),
  };
}

module.exports = { toPublicImages, restoreImages, decodeDataUri, isInline };
