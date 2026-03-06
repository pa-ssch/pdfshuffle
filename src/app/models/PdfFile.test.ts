import { describe, it, expect } from "vitest";
import { PdfFile } from "./PdfFile";

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
