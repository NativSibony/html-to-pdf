export function downloadPDF(fileName: string, url: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printPDF(url: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.contentWindow?.print();
  document.body.removeChild(iframe);
}

export function createTemporaryAbsoluteElement(element: HTMLElement, width = 0) {
  const clonedElement = element.cloneNode(true) as HTMLElement;
  clonedElement.style.position = 'absolute';
  clonedElement.style.overflow = 'visible';
  clonedElement.style.width = width ? `${width}px` : 'auto';
  clonedElement.style.height = 'auto';
  clonedElement.style.left = '-9999px';
  clonedElement.style.top = '-9999px';

  return {
    clonedElement,
    addToDom: () => {
      document.body.appendChild(clonedElement);
    },
    removeFromDom: () => {
      document.body.removeChild(clonedElement);
    },
  };
}
