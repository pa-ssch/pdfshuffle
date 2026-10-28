"use client";

import styles from "./drop_files.module.scss";
import { useRef, useCallback, useState, useEffect } from "react";
import { PdfFile, isPdfFile } from "../../models/PdfFile";
import PdfCard from "../pdf_card/pdf_card";

type DropFilesComponentProps = {
  onFilesChanged?: (files: PdfFile[]) => void;
};

export default function DropFilesComponent({
  onFilesChanged,
}: DropFilesComponentProps) {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  // number = pages reported by pdf.js, null = file could not be parsed
  const [pageCounts, setPageCounts] = useState<Record<string, number | null>>(
    {},
  );
  const [dragging, setDragging] = useState(false);
  // dragenter/dragleave fire for every child element; count them so the
  // highlight does not flicker while moving over the cards.
  const dragDepth = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onFilesChanged?.(files);
  }, [files, onFilesChanged]);

  const addFiles = useCallback((incoming: File[]) => {
    const pdfs: File[] = [];
    const notPdf: string[] = [];
    for (const file of incoming) {
      if (isPdfFile(file)) pdfs.push(file);
      else notPdf.push(file.name);
    }
    setRejected(notPdf);

    setFiles((prev) => {
      const known = new Set(prev.map((f) => f.key));
      const added: PdfFile[] = [];
      for (const file of pdfs) {
        const pdf = new PdfFile(file);
        if (known.has(pdf.key)) continue;
        known.add(pdf.key);
        added.push(pdf);
      }
      return added.length === 0 ? prev : [...prev, ...added];
    });
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles],
  );

  const handleClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(Array.from(e.target.files ?? []));
      // Reset so that re-selecting the same file (e.g. after removing it)
      // triggers a change event again.
      e.target.value = "";
    },
    [addFiles],
  );

  const removeDocument = useCallback((file: PdfFile) => {
    setFiles((prev) => prev.filter((f) => f !== file));
    setPageCounts((prev) => {
      if (!(file.key in prev)) return prev;
      const next = { ...prev };
      delete next[file.key];
      return next;
    });
  }, []);

  const handlePageCount = useCallback((file: PdfFile, count: number | null) => {
    setPageCounts((prev) =>
      prev[file.key] === count ? prev : { ...prev, [file.key]: count },
    );
  }, []);

  const countedFiles = files.filter((f) => f.key in pageCounts);
  const totalPages = countedFiles.reduce(
    (sum, f) => sum + (pageCounts[f.key] ?? 0),
    0,
  );
  const unreadable = countedFiles.filter((f) => pageCounts[f.key] === null).length;
  const allCounted = countedFiles.length === files.length;

  return (
    <div className={styles.dropareacontainer}>
      <div
        className={[styles.droparea, dragging ? styles.dropping : ""].join(" ")}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.text}>
          <div className={styles.dropText}>
            <span className={styles.desktopHint}>
              Drop PDF files in this area or&nbsp;
              <button
                type="button"
                className={styles.clickLink}
                onClick={handleClick}
              >
                click
              </button>
              &nbsp;to select files
            </span>
            <button
              type="button"
              className={`${styles.clickLink} ${styles.touchHint}`}
              onClick={handleClick}
            >
              Tap to select PDF files
            </button>
          </div>
        </div>

        <div className={styles.cardGrid}>
          {files.map((f) => (
            <PdfCard
              key={f.key}
              pdfFile={f}
              onRemove={removeDocument}
              onPageCount={handlePageCount}
            />
          ))}
        </div>

        {files.length > 0 && (
          <p className={styles.summary} role="status">
            {files.length} {files.length === 1 ? "file" : "files"}
            {allCounted
              ? ` · ${totalPages} ${totalPages === 1 ? "page" : "pages"}`
              : " · counting pages…"}
            {unreadable > 0 && ` · ${unreadable} unreadable`}
          </p>
        )}
      </div>

      {rejected.length > 0 && (
        <p className={styles.rejected} role="alert">
          Skipped (not a PDF): {rejected.join(", ")}
        </p>
      )}

      <input
        hidden
        type="file"
        ref={fileInputRef}
        accept="application/pdf,.pdf"
        multiple
        onChange={handleUpload}
      />
    </div>
  );
}
