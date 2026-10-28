import { PDFDocument, StandardFonts } from "pdf-lib";

/**
 * Builds a PDF whose pages can be told apart after shuffling: page i of a
 * document with `tag` gets a unique width (tag*1000 + i) so the output order
 * can be recovered without text extraction.
 */
export async function makePdf(tag: number, pageCount: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([tag * 1000 + i, 400]);
    page.drawText(`Doc ${tag} – page ${i}`, { x: 40, y: 200, size: 24, font });
  }
  return Buffer.from(await doc.save());
}

export function pageWidthsOf(bytes: Buffer): Promise<number[]> {
  return PDFDocument.load(bytes).then((doc) =>
    doc.getPages().map((p) => Math.round(p.getWidth())),
  );
}

export function expectedWidths(tag: number, pageCount: number): number[] {
  return Array.from({ length: pageCount }, (_, i) => tag * 1000 + i + 1);
}
