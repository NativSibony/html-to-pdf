import { jsPDF } from 'jspdf';
import { HyperlinkData, Margin } from '../types';
import { DEFAULT_MARGIN } from '../constants';

/**
 * Scans the given element for all <a> tags and extracts their hyperlink data.
 * The returned bounding box (rect) is relative to the element.
 */
export function extractHyperlinks(element: HTMLElement): HyperlinkData[] {
  const links = Array.from(element.querySelectorAll('a'));
  const elementRect = element.getBoundingClientRect();

  return links.map((link) => {
    const linkRect = link.getBoundingClientRect();
    return {
      href: link.getAttribute('href') || '',
      rect: {
        x: linkRect.left - elementRect.left,
        y: linkRect.top - elementRect.top,
        width: linkRect.width,
        height: linkRect.height,
      },
    };
  });
}

/**
 * Adds clickable hyperlink annotations to the current PDF page.
 *
 * @param pdf - The jsPDF instance.
 * @param hyperlinks - Array of extracted HyperlinkData.
 * @param currentY - The top boundary (in PDF-space coordinates) of the current page slice.
 *                   This is the cumulative Y offset (in PDF space) of the slice.
 * @param effectivePdfHeight - The height (in PDF-space) available for the image (after subtracting margins).
 * @param scaleFactor - The scale factor used to convert canvas coordinates to PDF coordinates.
 * @param margin - The margin array [marginTop, marginRight, marginBottom, marginLeft] used in PDF layout.
 *
 * This function converts each hyperlink’s bounding box from the original element (or canvas)
 * to PDF coordinates and, if the link’s vertical position falls within the current page slice,
 * adds a clickable annotation using jsPDF’s link API.
 */
export function addHyperlinksToPdfPage(
  pdf: jsPDF,
  hyperlinks: HyperlinkData[],
  currentY: number,
  effectivePdfHeight: number,
  scaleFactor: number,
  margin?: Margin,
): void {
  const [marginTop, , , marginLeft] = margin || DEFAULT_MARGIN;
  hyperlinks.forEach((link) => {
    const linkPdfY = link.rect.y * scaleFactor;
    if (linkPdfY >= currentY && linkPdfY < currentY + effectivePdfHeight) {
      const x = marginLeft + link.rect.x * scaleFactor;
      const y = marginTop + (linkPdfY - currentY);
      const width = link.rect.width * scaleFactor;
      const height = link.rect.height * scaleFactor;
      pdf.link(x, y, width, height, { url: link.href });
    }
  });
}
