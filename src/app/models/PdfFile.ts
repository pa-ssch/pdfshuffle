export const PDF_MIME = "application/pdf";

/**
 * Accepts a file as PDF if either the browser-reported MIME type or the file
 * extension says so. Dropped files on Windows/Linux frequently arrive with an
 * empty `type`, so the MIME type alone is not reliable.
 */
export function isPdfFile(file: File): boolean {
  return file.type === PDF_MIME || /\.pdf$/i.test(file.name);
}

/** Stable identity for a File across renders: name, size and mtime. */
export function fileKey(file: File): string {
  return `${file.name}-${file.lastModified}-${file.size}`;
}

export class PdfFile {
  name: string;
  key: string;
  constructor(public file: File) {
    this.name = file.name;
    this.key = fileKey(file);
  }
}
