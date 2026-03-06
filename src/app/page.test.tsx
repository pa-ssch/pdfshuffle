import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// --- Mocks ---

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} />,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

const mockSave = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockInsertPage = vi.fn();
const mockCopyPages = vi.fn().mockResolvedValue([{}]);
const mockGetPageCount = vi.fn().mockReturnValue(2);

const mockShuffledDoc = {
  copyPages: mockCopyPages,
  insertPage: mockInsertPage,
  save: mockSave,
};

vi.mock("pdf-lib", () => ({
  PDFDocument: {
    create: vi.fn().mockResolvedValue(mockShuffledDoc),
    load: vi.fn().mockResolvedValue({ getPageCount: mockGetPageCount }),
  },
  PDFPage: class {},
}));

// --- Test helpers ---

function makePdfFile(name: string, size = 100, lastModified = 1000): File {
  return new File(["x".repeat(size)], name, {
    type: "application/pdf",
    lastModified,
  });
}

async function uploadFiles(files: File[]) {
  const input = document.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  await userEvent.upload(input, files);
}

// --- Tests ---

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSave.mockResolvedValue(new Uint8Array([1, 2, 3]));
    mockCopyPages.mockResolvedValue([{}]);
    mockGetPageCount.mockReturnValue(2);

    // Mock browser download APIs
    vi.stubGlobal(
      "URL",
      Object.assign(URL, {
        createObjectURL: vi.fn().mockReturnValue("blob:mock"),
        revokeObjectURL: vi.fn(),
      }),
    );
  });

  describe("initial state", () => {
    it("renders the logo", async () => {
      const { default: Home } = await import("./page");
      render(<Home />);
      expect(screen.getByAltText("PDF Shuffle Logo")).toBeInTheDocument();
    });

    it("renders the shuffle button disabled", async () => {
      const { default: Home } = await import("./page");
      render(<Home />);
      const btn = screen.getByRole("button", { name: /shuffle.*download/i });
      expect(btn).toBeDisabled();
    });

    it("renders Impressum and Datenschutz footer links", async () => {
      const { default: Home } = await import("./page");
      render(<Home />);
      expect(screen.getByRole("link", { name: /impressum/i })).toHaveAttribute(
        "href",
        "/impressum",
      );
      expect(
        screen.getByRole("link", { name: /datenschutz/i }),
      ).toHaveAttribute("href", "/datenschutz");
    });
  });

  describe("file selection", () => {
    it("enables the shuffle button after a file is added", async () => {
      const { default: Home } = await import("./page");
      render(<Home />);

      await uploadFiles([makePdfFile("test.pdf")]);

      const btn = screen.getByRole("button", { name: /shuffle.*download/i });
      expect(btn).toBeEnabled();
    });

    it("disables the button again after all files are removed", async () => {
      const { default: Home } = await import("./page");
      render(<Home />);

      await uploadFiles([makePdfFile("test.pdf")]);
      expect(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      ).toBeEnabled();

      const removeBtn = screen.getByRole("button", { name: /remove test\.pdf/i });
      await userEvent.click(removeBtn);

      expect(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      ).toBeDisabled();
    });
  });

  describe("shuffle and download", () => {
    it("calls pdf-lib PDFDocument.create and load", async () => {
      const { default: Home } = await import("./page");
      const { PDFDocument } = await import("pdf-lib");
      render(<Home />);

      await uploadFiles([makePdfFile("test.pdf")]);
      await userEvent.click(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      );

      await waitFor(() => {
        expect(PDFDocument.create).toHaveBeenCalledTimes(1);
        expect(PDFDocument.load).toHaveBeenCalledTimes(1);
      });
    });

    it("calls copyPages for each loaded document", async () => {
      const { default: Home } = await import("./page");
      render(<Home />);

      await uploadFiles([makePdfFile("a.pdf"), makePdfFile("b.pdf", 200, 2000)]);
      await userEvent.click(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      );

      await waitFor(() => {
        expect(mockCopyPages).toHaveBeenCalledTimes(2);
      });
    });

    it("inserts shuffled pages into the document", async () => {
      mockCopyPages.mockResolvedValue([{}, {}, {}]);
      mockGetPageCount.mockReturnValue(3);

      const { default: Home } = await import("./page");
      render(<Home />);

      await uploadFiles([makePdfFile("test.pdf")]);
      await userEvent.click(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      );

      await waitFor(() => {
        expect(mockInsertPage).toHaveBeenCalledTimes(3);
      });
    });

    it("creates an object URL and triggers download", async () => {
      const { default: Home } = await import("./page");
      render(<Home />);

      await uploadFiles([makePdfFile("test.pdf")]);
      await userEvent.click(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      );

      await waitFor(() => {
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
      });
    });

    it("shows success message after download", async () => {
      const { default: Home } = await import("./page");
      render(<Home />);

      await uploadFiles([makePdfFile("test.pdf")]);
      await userEvent.click(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      );

      await waitFor(() => {
        expect(screen.getByText(/check your downloads/i)).toBeInTheDocument();
      });
    });

    it("re-enables the button after success state expires", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { default: Home } = await import("./page");
      render(<Home />);

      await uploadFiles([makePdfFile("test.pdf")]);
      await userEvent.click(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      );

      // Wait for success state
      await waitFor(() =>
        expect(screen.getByText(/check your downloads/i)).toBeInTheDocument(),
      );

      // Advance past the 5s auto-dismiss
      await act(async () => {
        vi.advanceTimersByTime(5500);
      });

      expect(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      ).toBeEnabled();

      vi.useRealTimers();
    });
  });

  describe("error handling", () => {
    it("shows error message when a file fails to load", async () => {
      const { PDFDocument } = await import("pdf-lib");
      vi.mocked(PDFDocument.load).mockRejectedValueOnce(
        new Error("Invalid PDF"),
      );

      const { default: Home } = await import("./page");
      render(<Home />);

      await uploadFiles([makePdfFile("bad.pdf")]);
      await userEvent.click(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      );

      await waitFor(() => {
        // The error span should contain both the message and the file name
        expect(
          screen.getByText(/could not be read/i),
        ).toBeInTheDocument();
      });
    });

    it("shows only failed file names, not all files", async () => {
      const { PDFDocument } = await import("pdf-lib");
      // First call succeeds, second fails
      vi.mocked(PDFDocument.load)
        .mockResolvedValueOnce({ getPageCount: () => 1 } as never)
        .mockRejectedValueOnce(new Error("Invalid PDF"));

      const { default: Home } = await import("./page");
      render(<Home />);

      await uploadFiles([
        makePdfFile("good.pdf", 100, 1000),
        makePdfFile("bad.pdf", 200, 2000),
      ]);
      await userEvent.click(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      );

      await waitFor(() => {
        // Error message must contain the failed file name but not the successful one
        const errorSpan = screen.getByText(/could not be read/i);
        expect(errorSpan.textContent).toContain("bad.pdf");
        expect(errorSpan.textContent).not.toContain("good.pdf");
      });
    });

    it("clears the error message when new files are added", async () => {
      const { PDFDocument } = await import("pdf-lib");
      vi.mocked(PDFDocument.load).mockRejectedValueOnce(
        new Error("Invalid PDF"),
      );

      const { default: Home } = await import("./page");
      render(<Home />);

      await uploadFiles([makePdfFile("bad.pdf")]);
      await userEvent.click(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      );

      await waitFor(() =>
        expect(screen.getByText(/could not be read/i)).toBeInTheDocument(),
      );

      // Reset mock to succeed
      vi.mocked(PDFDocument.load).mockResolvedValue({
        getPageCount: () => 1,
      } as never);

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      await userEvent.upload(input, makePdfFile("good.pdf", 200, 2000));

      await waitFor(() =>
        expect(
          screen.queryByText(/could not be read/i),
        ).not.toBeInTheDocument(),
      );
    });

    it("re-enables button after error (files still loaded)", async () => {
      const { PDFDocument } = await import("pdf-lib");
      vi.mocked(PDFDocument.load).mockRejectedValueOnce(
        new Error("Invalid PDF"),
      );

      const { default: Home } = await import("./page");
      render(<Home />);

      await uploadFiles([makePdfFile("bad.pdf")]);
      await userEvent.click(
        screen.getByRole("button", { name: /shuffle.*download/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /shuffle.*download/i }),
        ).toBeEnabled();
      });
    });
  });
});
