import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DropFilesComponent from "./drop_files";
import { PdfFile } from "../../models/PdfFile";

// Mock PdfCard to avoid pdfjs-dist in unit tests
vi.mock("../pdf_card/pdf_card", () => ({
  default: ({
    pdfFile,
    onRemove,
  }: {
    pdfFile: PdfFile;
    onRemove: (f: PdfFile) => void;
  }) => (
    <div data-testid="pdf-card">
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

describe("DropFilesComponent", () => {
  describe("initial render", () => {
    it("renders the drop zone", () => {
      render(<DropFilesComponent />);
      expect(
        screen.getByText(/drop files in this area/i),
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

      const dropArea = screen
        .getByText(/drop files in this area/i)
        .closest("div[class*='droparea']") as HTMLElement;

      fireEvent.drop(dropArea, {
        dataTransfer: { files: [makePdfFile("dropped.pdf")] },
      });

      await waitFor(() => {
        const lastCall: PdfFile[] =
          onFilesChanged.mock.calls[onFilesChanged.mock.calls.length - 1][0];
        expect(lastCall.some((f) => f.name === "dropped.pdf")).toBe(true);
      });
    });

    it("shows dropping state on dragover", () => {
      render(<DropFilesComponent />);
      const dropArea = screen
        .getByText(/drop files in this area/i)
        .closest("div[class*='droparea']") as HTMLElement;

      fireEvent.dragOver(dropArea);

      expect(dropArea.className).toMatch(/dropping/);
    });

    it("clears dropping state on dragleave", () => {
      render(<DropFilesComponent />);
      const dropArea = screen
        .getByText(/drop files in this area/i)
        .closest("div[class*='droparea']") as HTMLElement;

      fireEvent.dragOver(dropArea);
      expect(dropArea.className).toMatch(/dropping/);

      fireEvent.dragLeave(dropArea);
      expect(dropArea.className).not.toMatch(/dropping/);
    });
  });
});
