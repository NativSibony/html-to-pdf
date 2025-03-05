import { jsPDF } from 'jspdf';
import { MessageData } from './types';
import { findBlankRow, loadImageBitmap, offscreenCanvasToDataURL } from './utils/worker.utils';
import { DEFAULT_MARGIN } from './constants';

self.addEventListener('message', async (event: MessageEvent) => {
  try {
    const { canvasData, options } = event.data as MessageData;
    const { dataUrl, height, width } = canvasData;
    const { jsPDFOptions, margin } = options;

    const imageBitmap = await loadImageBitmap(dataUrl);
    const fullCanvas = new OffscreenCanvas(width, height);
    const fullCtx = fullCanvas.getContext('2d', { willReadFrequently: true })!;
    fullCtx.drawImage(imageBitmap, 0, 0);

    const pdf = new jsPDF({ ...jsPDFOptions });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const [marginTop, marginRight, marginBottom, marginLeft] = margin || DEFAULT_MARGIN;
    const effectivePdfWidth = pdfWidth - marginLeft - marginRight;
    const effectivePdfHeight = pdfHeight - marginTop - marginBottom;

    const scaleFactor = effectivePdfWidth / width;
    const scaledImgHeight = height * scaleFactor;

    let currentY = 0;
    const searchRange = 100; // in PDF-space pixels: how far upward to scan for a near-blank row

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
      pdf.addImage(tempDataUrl, 'PNG', marginLeft, marginTop, effectivePdfWidth, drawHeight);

      currentY = pageBottom;
      if (scaledImgHeight - currentY > 1) pdf.addPage();
    }

    const pdfBlob = pdf.output('blob');
    self.postMessage({ status: 'success', pdfBlob });
  } catch (error) {
    self.postMessage({ status: 'error', message: (error as Error).message });
  }
});
