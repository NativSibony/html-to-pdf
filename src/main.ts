import { Convert, ConvertOptions, ConversionData } from './types';
import { DEFAULT_OPTIONS } from './constants';
import { downloadPDF, printPDF } from './utils/main.utils';
import { convertToCanvasDataUrl, convertToPDF } from './plugins/converters';

export const convert = async ({ element, options }: Convert) => {
  const mergedOptions: ConvertOptions = { ...DEFAULT_OPTIONS, ...options };

  const { dataUrl, height, width } = await convertToCanvasDataUrl(element, mergedOptions);

  const conversionData: ConversionData = {
    canvasData: { dataUrl, width, height },
    options: { ...mergedOptions },
  };

  try {
    const pdfBlob = await convertToPDF(conversionData);

    if (pdfBlob instanceof Error) {
      throw new Error('Failed to generate PDF.');
    }

    const url = URL.createObjectURL(pdfBlob);

    return {
      save: (fileName: string) => downloadPDF(fileName, url),
      print: () => printPDF(url),
    };
  } catch (error) {
    throw new Error((error as Error).message);
  }
};
