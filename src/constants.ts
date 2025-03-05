import { ConvertOptions, Margin } from './types';

export const DEFAULT_MARGIN: Margin = [10, 10, 10, 10];
export const DEFAULT_HTML_2_CANVAS_OPTIONS: ConvertOptions['html2canvasOptions'] = { allowTaint: true };
export const DEFAULT_JS_PDF_OPTIONS: ConvertOptions['jsPDFOptions'] = { orientation: 'p', unit: 'px', format: 'a4' };

export const DEFAULT_OPTIONS: ConvertOptions = {
  quality: 1,
  margin: [...DEFAULT_MARGIN],
  html2canvasOptions: { ...DEFAULT_HTML_2_CANVAS_OPTIONS },
  jsPDFOptions: { ...DEFAULT_JS_PDF_OPTIONS },
};
