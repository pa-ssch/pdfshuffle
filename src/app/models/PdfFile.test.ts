import { describe, it, expect } from "vitest";
import { PdfFile, isPdfFile, fileKey } from "./PdfFile";

function makeFile(name: string, size = 100, lastModified = 1000): File {
  return new File(["x".repeat(size)], name, {
    type: "application/pdf",
    lastModified,
  });
}

describe("PdfFile", () => {
  it("stores the file name", () => {
    const file = makeFile("test.pdf");
    const pdfFile = new PdfFile(file);
    expect(pdfFile.name).toBe("test.pdf");
  });

  it("stores the original File reference", () => {
    const file = makeFile("test.pdf");
    const pdfFile = new PdfFile(file);
    expect(pdfFile.file).toBe(file);
  });

  it("name matches file.name", () => {
    const file = makeFile("document.pdf");
    const pdfFile = new PdfFile(file);
    expect(pdfFile.name).toBe(pdfFile.file.name);
  });
});

describe("isPdfFile", () => {
  it("accepts application/pdf regardless of name", () => {
    expect(isPdfFile(new File([""], "x", { type: "application/pdf" }))).toBe(true);
  });

  it("accepts .pdf / .PDF extension with empty MIME type", () => {
    expect(isPdfFile(new File([""], "a.pdf", { type: "" }))).toBe(true);
    expect(isPdfFile(new File([""], "A.PDF", { type: "" }))).toBe(true);
  });

  it("rejects other files", () => {
    expect(isPdfFile(new File([""], "a.txt", { type: "text/plain" }))).toBe(false);
    expect(isPdfFile(new File([""], "a.pdf.png", { type: "image/png" }))).toBe(false);
  });
});

describe("fileKey", () => {
  it("is identical for files with same name, size and mtime", () => {
    expect(fileKey(makeFile("a.pdf", 10, 5))).toBe(fileKey(makeFile("a.pdf", 10, 5)));
  });

  it("differs when any component differs", () => {
    const base = fileKey(makeFile("a.pdf", 10, 5));
    expect(fileKey(makeFile("b.pdf", 10, 5))).not.toBe(base);
    expect(fileKey(makeFile("a.pdf", 11, 5))).not.toBe(base);
    expect(fileKey(makeFile("a.pdf", 10, 6))).not.toBe(base);
  });
});
