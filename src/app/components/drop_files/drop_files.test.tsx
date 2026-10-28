import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DropFilesComponent from "./drop_files";
import { PdfFile } from "../../models/PdfFile";

// Mock PdfCard to avoid pdfjs-dist in unit tests
const MOCK_PAGE_COUNTS: Record<string, number> = { "a.pdf": 3, "b.pdf": 4 };

vi.mock("../pdf_card/pdf_card", () => ({
  default: ({
    pdfFile,
    onRemove,
    onPageCount,
  }: {
    pdfFile: PdfFile;
    onRemove: (f: PdfFile) => void;
    onPageCount?: (f: PdfFile, count: number) => void;
  }) => (
    <div
      data-testid="pdf-card"
      ref={() => onPageCount?.(pdfFile, MOCK_PAGE_COUNTS[pdfFile.name] ?? 1)}
    >
      <span>{pdfFile.name}</span>
      <button
        type="button"
        aria-label={`Remove ${pdfFile.name}`}
        onClick={() => onRemove(pdfFile)}
      >
        ×
      </button>
    </div>
  ),
}));

function makePdfFile(name: string, size = 100, lastModified = 1000): File {
  return new File(["x".repeat(size)], name, {
    type: "application/pdf",
    lastModified,
  });
}

function getDropArea(): HTMLElement {
  return screen
    .getByText(/drop pdf files in this area/i)
    .closest("div[class*='droparea']") as HTMLElement;
}

describe("DropFilesComponent", () => {
  describe("initial render", () => {
    it("renders the drop zone", () => {
      render(<DropFilesComponent />);
      expect(
        screen.getByText(/drop pdf files in this area/i),
      ).toBeInTheDocument();
    });

    it("renders a click button", () => {
      render(<DropFilesComponent />);
      expect(
        screen.getByRole("button", { name: /click/i }),
      ).toBeInTheDocument();
    });

    it("renders no file cards initially", () => {
      render(<DropFilesComponent />);
      expect(screen.queryByTestId("pdf-card")).not.toBeInTheDocument();
    });
  });

  describe("file selection via input", () => {
    it("calls onFilesChanged with selected files", async () => {
      const onFilesChanged = vi.fn();
      render(<DropFilesComponent onFilesChanged={onFilesChanged} />);

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await userEvent.upload(input, makePdfFile("a.pdf"));

      const lastCall: PdfFile[] =
        onFilesChanged.mock.calls[onFilesChanged.mock.calls.length - 1][0];
      expect(lastCall).toHaveLength(1);
      expect(lastCall[0].name).toBe("a.pdf");
    });

    it("displays the file name after selection", async () => {
      render(<DropFilesComponent />);
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await userEvent.upload(input, makePdfFile("report.pdf"));

      expect(screen.getByText(/report\.pdf/)).toBeInTheDocument();
    });

    it("accumulates multiple files", async () => {
      render(<DropFilesComponent />);
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await userEvent.upload(input, [
        makePdfFile("a.pdf"),
        makePdfFile("b.pdf"),
      ]);

      expect(screen.getByText(/a\.pdf/)).toBeInTheDocument();
      expect(screen.getByText(/b\.pdf/)).toBeInTheDocument();
    });
  });

  describe("file removal", () => {
    it("removes a file when the remove button is clicked", async () => {
      const onFilesChanged = vi.fn();
      render(<DropFilesComponent onFilesChanged={onFilesChanged} />);
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await userEvent.upload(input, makePdfFile("remove-me.pdf"));
      expect(screen.getByText(/remove-me\.pdf/)).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole("button", { name: /remove remove-me\.pdf/i }),
      );

      expect(screen.queryByText(/remove-me\.pdf/)).not.toBeInTheDocument();
    });

    it("calls onFilesChanged with empty array after last file removed", async () => {
      const onFilesChanged = vi.fn();
      render(<DropFilesComponent onFilesChanged={onFilesChanged} />);
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await userEvent.upload(input, makePdfFile("only.pdf"));
      await userEvent.click(
        screen.getByRole("button", { name: /remove only\.pdf/i }),
      );

      const lastCall: PdfFile[] =
        onFilesChanged.mock.calls[onFilesChanged.mock.calls.length - 1][0];
      expect(lastCall).toHaveLength(0);
    });

    it("removes only the targeted file when multiple exist", async () => {
      render(<DropFilesComponent />);
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await userEvent.upload(input, [
        makePdfFile("keep.pdf", 100, 1000),
        makePdfFile("delete.pdf", 200, 2000),
      ]);

      await userEvent.click(
        screen.getByRole("button", { name: /remove delete\.pdf/i }),
      );

      expect(screen.getByText(/keep\.pdf/)).toBeInTheDocument();
      expect(screen.queryByText(/delete\.pdf/)).not.toBeInTheDocument();
    });
  });

  describe("duplicate prevention", () => {
    it("does not add the same file twice via input", async () => {
      const onFilesChanged = vi.fn();
      render(<DropFilesComponent onFilesChanged={onFilesChanged} />);
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const file = makePdfFile("dup.pdf", 100, 1000);
      await userEvent.upload(input, file);
      await userEvent.upload(input, file);

      const lastCall: PdfFile[] =
        onFilesChanged.mock.calls[onFilesChanged.mock.calls.length - 1][0];
      expect(lastCall).toHaveLength(1);
    });

    it("adds files with same name but different content", async () => {
      const onFilesChanged = vi.fn();
      render(<DropFilesComponent onFilesChanged={onFilesChanged} />);
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await userEvent.upload(input, makePdfFile("file.pdf", 100, 1000));
      await userEvent.upload(input, makePdfFile("file.pdf", 200, 2000));

      const lastCall: PdfFile[] =
        onFilesChanged.mock.calls[onFilesChanged.mock.calls.length - 1][0];
      expect(lastCall).toHaveLength(2);
    });
  });

  describe("drag and drop", () => {
    it("accepts dropped files", async () => {
      const onFilesChanged = vi.fn();
      render(<DropFilesComponent onFilesChanged={onFilesChanged} />);

      const dropArea = getDropArea();

      fireEvent.drop(dropArea, {
        dataTransfer: { files: [makePdfFile("dropped.pdf")] },
      });

      await waitFor(() => {
        const lastCall: PdfFile[] =
          onFilesChanged.mock.calls[onFilesChanged.mock.calls.length - 1][0];
        expect(lastCall.some((f) => f.name === "dropped.pdf")).toBe(true);
      });
    });

    it("shows dropping state on dragenter", () => {
      render(<DropFilesComponent />);
      const dropArea = getDropArea();

      fireEvent.dragEnter(dropArea);

      expect(dropArea.className).toMatch(/dropping/);
    });

    it("clears dropping state on dragleave", () => {
      render(<DropFilesComponent />);
      const dropArea = getDropArea();

      fireEvent.dragEnter(dropArea);
      expect(dropArea.className).toMatch(/dropping/);

      fireEvent.dragLeave(dropArea);
      expect(dropArea.className).not.toMatch(/dropping/);
    });

    it("keeps dropping state while moving over child elements", () => {
      render(<DropFilesComponent />);
      const dropArea = getDropArea();
      const child = screen.getByText(/drop pdf files in this area/i);

      fireEvent.dragEnter(dropArea);
      fireEvent.dragEnter(child);
      fireEvent.dragLeave(dropArea); // leaving the parent *into* the child
      expect(dropArea.className).toMatch(/dropping/);

      fireEvent.dragLeave(child); // now really leaving
      expect(dropArea.className).not.toMatch(/dropping/);
    });

    it("clears dropping state after a drop", () => {
      render(<DropFilesComponent />);
      const dropArea = getDropArea();

      fireEvent.dragEnter(dropArea);
      fireEvent.drop(dropArea, {
        dataTransfer: { files: [makePdfFile("dropped.pdf")] },
      });

      expect(dropArea.className).not.toMatch(/dropping/);
    });
  });

  describe("file type validation", () => {
    it("accepts a .pdf file whose MIME type is empty", async () => {
      const onFilesChanged = vi.fn();
      render(<DropFilesComponent onFilesChanged={onFilesChanged} />);

      const file = new File(["x"], "scan.PDF", { type: "", lastModified: 1 });
      fireEvent.drop(getDropArea(), { dataTransfer: { files: [file] } });

      await waitFor(() => {
        const lastCall: PdfFile[] =
          onFilesChanged.mock.calls[onFilesChanged.mock.calls.length - 1][0];
        expect(lastCall.map((f) => f.name)).toEqual(["scan.PDF"]);
      });
    });

    it("rejects non-PDF files and tells the user", async () => {
      const onFilesChanged = vi.fn();
      render(<DropFilesComponent onFilesChanged={onFilesChanged} />);

      const txt = new File(["x"], "notes.txt", { type: "text/plain" });
      fireEvent.drop(getDropArea(), {
        dataTransfer: { files: [txt, makePdfFile("ok.pdf")] },
      });

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(/notes\.txt/);
      });
      expect(screen.queryByText(/notes\.txt/)).toBeInTheDocument();
      const lastCall: PdfFile[] =
        onFilesChanged.mock.calls[onFilesChanged.mock.calls.length - 1][0];
      expect(lastCall.map((f) => f.name)).toEqual(["ok.pdf"]);
    });

    it("clears the rejection notice on the next valid selection", async () => {
      render(<DropFilesComponent />);
      const txt = new File(["x"], "notes.txt", { type: "text/plain" });
      fireEvent.drop(getDropArea(), { dataTransfer: { files: [txt] } });
      await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());

      fireEvent.drop(getDropArea(), {
        dataTransfer: { files: [makePdfFile("ok.pdf")] },
      });
      await waitFor(() =>
        expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
      );
    });
  });

  describe("re-selecting a removed file", () => {
    it("resets the input value so the same file can be chosen again", async () => {
      const onFilesChanged = vi.fn();
      render(<DropFilesComponent onFilesChanged={onFilesChanged} />);
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const file = makePdfFile("again.pdf");

      await userEvent.upload(input, file);
      expect(input.value).toBe("");
      await userEvent.click(
        screen.getByRole("button", { name: /remove again\.pdf/i }),
      );
      await userEvent.upload(input, file);

      const lastCall: PdfFile[] =
        onFilesChanged.mock.calls[onFilesChanged.mock.calls.length - 1][0];
      expect(lastCall.map((f) => f.name)).toEqual(["again.pdf"]);
    });
  });

  describe("page summary", () => {
    it("shows file count and total pages reported by the cards", async () => {
      render(<DropFilesComponent />);
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await userEvent.upload(input, [
        makePdfFile("a.pdf", 100, 1000),
        makePdfFile("b.pdf", 200, 2000),
      ]);

      await waitFor(() => {
        expect(screen.getByRole("status")).toHaveTextContent(
          "2 files · 7 pages",
        );
      });
    });

    it("drops a removed file's pages from the total", async () => {
      render(<DropFilesComponent />);
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await userEvent.upload(input, [
        makePdfFile("a.pdf", 100, 1000),
        makePdfFile("b.pdf", 200, 2000),
      ]);
      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent("7 pages"),
      );

      await userEvent.click(
        screen.getByRole("button", { name: /remove b\.pdf/i }),
      );

      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(
          "1 file · 3 pages",
        ),
      );
    });
  });
});
