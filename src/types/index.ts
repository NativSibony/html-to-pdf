import { Options } from 'html2canvas';
import { jsPDFOptions } from 'jspdf';

export type ConversionData = {
  canvasData: CanvasData;
  options: ConvertOptions;
  hyperlinks?: HyperlinkData[];
};

export type Convert = {
  element: HTMLElement;
  options?: ConvertOptions;
};

export type ConvertOptions = {
  margin?: Margin;
  quality?: number;
  forceElementWidth?: number;
  jsPDFOptions?: jsPDFOptions;
  html2canvasOptions?: Partial<Options>;
};

export type HyperlinkData = {
  href: string;
  rect: { x: number; y: number; width: number; height: number };
};

export type CanvasData = {
  dataUrl: string;
  width: number;
  height: number;
};

export type Margin = [number, number, number, number];
