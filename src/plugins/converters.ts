import { ConversionData, ConvertOptions } from '../types';
import { findBlankRow, loadImageBitmap, offscreenCanvasToDataURL } from '../utils/converters.utils';
import { DEFAULT_MARGIN } from '../constants';
import { createTemporaryAbsoluteElement } from '../utils/main.utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { addHyperlinksToPdfPage, extractHyperlinks } from './hyperlinks';

export const convertToCanvasDataUrl = async (element: HTMLElement, options: ConvertOptions) => {
  const { clonedElement, addToDom, removeFromDom } = createTemporaryAbsoluteElement(
    element,
    options?.forceElementWidth,
  );

  addToDom();
  const canvas = await html2canvas(clonedElement, { ...options.html2canvasOptions });
  const dataUrl = canvas.toDataURL('image/png', options.quality);
  const hyperlinks = extractHyperlinks(clonedElement);
  removeFromDom();

  return { dataUrl, width: canvas.width, height: canvas.height, hyperlinks };
};

export const convertToPDF = async (data: ConversionData) => {
  try {
    const { canvasData, options, hyperlinks } = data;
    const { dataUrl, height, width } = canvasData;
    const { jsPDFOptions, margin } = options;
    const pdf = new jsPDF({ ...jsPDFOptions });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const [marginTop, marginRight, marginBottom, marginLeft] = margin || DEFAULT_MARGIN;
    const effectivePdfWidth = pdfWidth - marginLeft - marginRight;
    const effectivePdfHeight = pdfHeight - marginTop - marginBottom;

    const imageBitmap = await loadImageBitmap(dataUrl);
    const fullCanvas = new OffscreenCanvas(width, height);
    const fullCtx = fullCanvas.getContext('2d', { willReadFrequently: true })!;
    fullCtx.drawImage(imageBitmap, 0, 0);

    const scaleFactor = effectivePdfWidth / width;
    const scaledImgHeight = height * scaleFactor;
    let currentY = 0;
    const searchRange = 100; // in PDF-space pixels

    while (currentY < scaledImgHeight) {
      let naiveBottom = currentY + effectivePdfHeight;
      if (naiveBottom > scaledImgHeight) {
        naiveBottom = scaledImgHeight;
      }
      const bestBreak = findBlankRow(fullCtx, width, currentY, naiveBottom, scaleFactor, searchRange);
      let pageBottom = bestBreak ?? naiveBottom;
      let sliceHeight = pageBottom - currentY;
      if (sliceHeight <= 0) {
        pageBottom = currentY + 1;
        sliceHeight = 1;
      }
      const srcY = currentY / scaleFactor;
      const srcHeight = sliceHeight / scaleFactor;
      const drawHeight = sliceHeight;

      const tempCanvas = new OffscreenCanvas(width, srcHeight);
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
      tempCtx.drawImage(fullCanvas, 0, srcY, width, srcHeight, 0, 0, width, srcHeight);

      const tempDataUrl = await offscreenCanvasToDataURL(tempCanvas);

      // Save the starting position of this page slice for link calculations.
      const pageSliceStart = currentY;

      // Add the image slice to the PDF.
      pdf.addImage(tempDataUrl, 'PNG', marginLeft, marginTop, effectivePdfWidth, drawHeight);

      // If hyperlink data exists, add link annotations for this page.
      if (hyperlinks && hyperlinks.length > 0) {
        addHyperlinksToPdfPage(pdf, hyperlinks, pageSliceStart, effectivePdfHeight, scaleFactor, margin);
      }

      currentY = pageBottom;
      if (scaledImgHeight - currentY > 1) {
        pdf.addPage();
      }
    }

    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } catch (error) {
    return Error((error as Error).message);
  }
};
