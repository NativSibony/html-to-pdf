/**
 * Converts an OffscreenCanvas to a data URL by converting it to a Blob first.
 */
export async function offscreenCanvasToDataURL(canvas: OffscreenCanvas): Promise<string> {
  const blob = await canvas.convertToBlob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Loads an image from a data URL using fetch and createImageBitmap.
 */
export async function loadImageBitmap(dataUrl: string): Promise<ImageBitmap> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return createImageBitmap(blob);
}

/**
 * Scans from scaledTop to scaledBottom (in PDF-space) for a row that is mostly blank.
 * Returns the scaled Y coordinate of that row or null if not found.
 */
export function findBlankRow(
  ctx: OffscreenCanvasRenderingContext2D,
  imgWidth: number,
  scaledTop: number,
  scaledBottom: number,
  scaleFactor: number,
  searchRange: number,
): number | null {
  // Convert PDF-space coordinates to unscaled image coordinates.
  const unscaledBottom = Math.floor(scaledBottom / scaleFactor);
  const unscaledTop = Math.floor(scaledTop / scaleFactor);
  const searchRangeUnscaled = Math.floor(searchRange / scaleFactor);
  let searchStart = unscaledBottom - searchRangeUnscaled;
  if (searchStart < unscaledTop) {
    searchStart = unscaledTop;
  }
  if (searchStart >= unscaledBottom) {
    return null;
  }

  const heightToSearch = unscaledBottom - searchStart;
  const imageData = ctx.getImageData(0, searchStart, imgWidth, heightToSearch);
  const { data } = imageData;
  const blankThreshold = 240; // pixel brightness threshold (0-255)
  const blankPercent = 0.9; // require 90% of pixels in a row to be "blank"
  const rowPixelCount = imgWidth;

  // Scan from the bottom of the search range upward.
  for (let row = heightToSearch - 1; row >= 0; row--) {
    let brightCount = 0;
    const rowOffset = row * imgWidth * 4;
    for (let col = 0; col < imgWidth; col++) {
      const idx = rowOffset + col * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r > blankThreshold && g > blankThreshold && b > blankThreshold) {
        brightCount++;
      }
    }
    if (brightCount / rowPixelCount >= blankPercent) {
      // Found a mostly blank row; convert back to PDF-space.
      const foundUnscaledY = searchStart + row;
      return foundUnscaledY * scaleFactor;
    }
  }
  return null;
}
