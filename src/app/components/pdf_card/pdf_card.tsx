"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./pdf_card.module.scss";
import { PdfFile } from "../../models/PdfFile";

type PdfCardProps = {
  pdfFile: PdfFile;
  onRemove: (file: PdfFile) => void;
  onPageCount?: (file: PdfFile, count: number) => void;
};

let workerInitialized = false;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfCard({
  pdfFile,
  onRemove,
  onPageCount,
}: PdfCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnailReady, setThumbnailReady] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let task: { destroy(): Promise<void> } | null = null;

    const renderThumbnail = async () => {
      try {
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
        if (!workerInitialized) {
          GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
          workerInitialized = true;
        }

        const arrayBuffer = await pdfFile.file.arrayBuffer();
        if (cancelled) return;

        const loadingTask = getDocument({ data: arrayBuffer });
        task = loadingTask;
        const doc = await loadingTask.promise;
        if (cancelled) return;

        setPageCount(doc.numPages);
        onPageCount?.(pdfFile, doc.numPages);

        const page = await doc.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 0.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        if (!cancelled) setThumbnailReady(true);
      } catch {
        if (!cancelled) setThumbnailError(true);
      } finally {
        // Free the worker-side document; the rendered canvas stays.
        task?.destroy().catch(() => {});
      }
    };

    renderThumbnail();

    return () => {
      cancelled = true;
    };
  }, [pdfFile, onPageCount]);

  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.removeBtn}
        onClick={() => onRemove(pdfFile)}
        aria-label={`Remove ${pdfFile.name}`}
      >
        ×
      </button>
      <div className={styles.preview}>
        {!thumbnailReady && !thumbnailError && (
          <div className={styles.spinner} />
        )}
        {thumbnailError && <div className={styles.pdfFallback}>PDF</div>}
        <canvas
          ref={canvasRef}
          className={thumbnailReady ? styles.canvas : styles.hiddenCanvas}
        />
      </div>
      <div className={styles.info}>
        <span className={styles.name} title={pdfFile.name}>
          {pdfFile.name}
        </span>
        <span className={styles.size}>
          {formatFileSize(pdfFile.file.size)}
          {pageCount !== null &&
            ` · ${pageCount} ${pageCount === 1 ? "page" : "pages"}`}
        </span>
      </div>
    </div>
  );
}
