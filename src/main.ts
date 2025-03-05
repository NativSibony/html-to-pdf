import html2canvas from 'html2canvas';
import { Convert, ConvertOptions, MessageData } from './types';
import { DEFAULT_OPTIONS } from './constants';
import { downloadPDF, createTemporaryAbsoluteElement, printPDF } from './utils/main.utils';

export const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

export const convert = async ({ element, options }: Convert) => {
  const { clonedElement, addToDom, removeFromDom } = createTemporaryAbsoluteElement(
    element,
    options?.forceElementWidth,
  );

  addToDom();
  const mergedOptions: ConvertOptions = { ...DEFAULT_OPTIONS, ...options };
  const canvas = await html2canvas(clonedElement, { ...mergedOptions.html2canvasOptions });
  const dataUrl = canvas.toDataURL('image/png', mergedOptions.quality);
  removeFromDom();

  const messageData: MessageData = {
    canvasData: { dataUrl, width: canvas.width, height: canvas.height },
    options: { ...mergedOptions },
  };

  const pdfBlob = await new Promise<Blob>((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.status === 'success') {
        resolve(event.data.pdfBlob);
      } else {
        reject(new Error(event.data.message));
      }
      worker.removeEventListener('message', handleMessage);
    };

    worker.addEventListener('message', handleMessage);
    worker.postMessage(messageData);
  });

  const url = URL.createObjectURL(pdfBlob);

  return {
    save: (fileName: string) => downloadPDF(fileName, url),
    print: () => printPDF(url),
  };
};
