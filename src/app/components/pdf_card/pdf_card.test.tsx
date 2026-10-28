import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PdfCard, { formatFileSize } from "./pdf_card";
import { PdfFile } from "../../models/PdfFile";

const mockRender = vi.fn().mockReturnValue({ promise: Promise.resolve() });
const mockGetPage = vi.fn().mockResolvedValue({
  getViewport: () => ({ width: 100, height: 141 }),
  render: mockRender,
});
const mockDestroy = vi.fn().mockResolvedValue(undefined);
let mockNumPages = 5;
let mockLoadFails = false;

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: vi.fn(() => ({
    promise: mockLoadFails
      ? Promise.reject(new Error("bad pdf"))
      : Promise.resolve({ numPages: mockNumPages, getPage: mockGetPage }),
    destroy: mockDestroy,
  })),
}));

function makePdfFile(name = "doc.pdf", size = 2048): PdfFile {
  return new PdfFile(
    new File(["x".repeat(size)], name, { type: "application/pdf" }),
  );
}

describe("formatFileSize", () => {
  it("formats bytes, KB and MB", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});

describe("PdfCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNumPages = 5;
    mockLoadFails = false;
    HTMLCanvasElement.prototype.getContext = vi
      .fn()
      .mockReturnValue({}) as never;
  });

  it("shows name, size and page count and reports the count upward", async () => {
    const onPageCount = vi.fn();
    const file = makePdfFile();
    render(<PdfCard pdfFile={file} onRemove={() => {}} onPageCount={onPageCount} />);

    expect(screen.getByText("doc.pdf")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/2\.0 KB · 5 pages/)).toBeInTheDocument();
    });
    expect(onPageCount).toHaveBeenCalledWith(file, 5);
  });

  it("renders the first page and releases the document afterwards", async () => {
    render(<PdfCard pdfFile={makePdfFile()} onRemove={() => {}} />);
    await waitFor(() => expect(mockRender).toHaveBeenCalledTimes(1));
    expect(mockGetPage).toHaveBeenCalledWith(1);
    await waitFor(() => expect(mockDestroy).toHaveBeenCalled());
  });

  it("falls back to a placeholder when the PDF cannot be rendered", async () => {
    mockLoadFails = true;
    render(<PdfCard pdfFile={makePdfFile("broken.pdf")} onRemove={() => {}} />);
    await waitFor(() => expect(screen.getByText("PDF")).toBeInTheDocument());
    expect(screen.queryByText(/pages/)).not.toBeInTheDocument();
  });

  it("calls onRemove with its file", async () => {
    const onRemove = vi.fn();
    const file = makePdfFile("remove.pdf");
    render(<PdfCard pdfFile={file} onRemove={onRemove} />);
    await userEvent.click(
      screen.getByRole("button", { name: /remove remove\.pdf/i }),
    );
    expect(onRemove).toHaveBeenCalledWith(file);
  });
});
