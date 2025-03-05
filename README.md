# html-pdf-converter

html-pdf-converter is a lightweight JavaScript library that allows you to convert HTML elements into PDF documents using `html2canvas` and `jsPDF`. This library provides an easy way to generate and download PDFs directly from your web application.

## Features

- Convert any HTML element to a PDF file
- Supports custom margins, quality settings, and jsPDF options
- Allows printing or downloading the generated PDF
- Uses Web Workers for efficient processing

## Installation

You can install `html-pdf-converter` via npm:

```sh
npm install html-pdf-converter
```

or using yarn:

```sh
yarn add html-pdf-converter
```

## Usage

### Importing the Library

```typescript
import { convert } from 'html-pdf-converter';
```

### Basic Example

```typescript
const element = document.getElementById('content');

const { save, print } = await convert({ element });

// Save the PDF file
save('document.pdf');

// Print the PDF
print();
```

### Advanced Usage with Options

```typescript
const element = document.getElementById('content');

const { save } = await convert({
  element,
  options: {
    margin: [10, 10, 10, 10], // Top, Right, Bottom, Left margins
    quality: 0.95, // Image quality (0 to 1)
    forceElementWidth: 800, // Forces a specific element width in pixels
    jsPDFOptions: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    html2canvasOptions: { scale: 2 },
  },
});

save('custom-document.pdf');
```

## Options

| Property             | Type                               | Description                                   |
| -------------------- | ---------------------------------- | --------------------------------------------- |
| `margin`             | `[number, number, number, number]` | Set custom margins for the PDF document.      |
| `quality`            | `number` (0 to 1)                  | Adjusts image quality when rendering the PDF. |
| `forceElementWidth`  | `number`                           | Forces a specific width for the HTML element. |
| `jsPDFOptions`       | `jsPDFOptions`                     | Configuration options for jsPDF.              |
| `html2canvasOptions` | `Partial<Options>`                 | Options for html2canvas rendering.            |

## Demo

[View Demo](#) (Coming Soon)

## License

MIT License

---

Created by [Nativ Sibony](https://github.com/nativsibony)
