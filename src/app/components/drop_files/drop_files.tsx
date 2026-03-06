"use client";

import styles from "./drop_files.module.scss";
import { useRef, useCallback, useState, useEffect } from "react";
import { PdfFile } from "../../models/PdfFile";
import PdfCard from "../pdf_card/pdf_card";

type DropFilesComponentProps = {
  onFilesChanged?: (files: PdfFile[]) => void;
};

const PDF_MIME = "application/pdf";

export default function DropFilesComponent({
  onFilesChanged,
}: DropFilesComponentProps) {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [state, setState] = useState<"idle" | "dropping">("idle");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onFilesChanged?.(files);
  }, [files, onFilesChanged]);

  const isDuplicate = useCallback(
    (file: File) =>
      files.some(
        (f) =>
          f.name === file.name &&
          f.file.size === file.size &&
          f.file.lastModified === file.lastModified,
      ),
    [files],
  );

  const addFiles = useCallback(
    (incoming: File[]) => {
      const newFiles = incoming
        .filter((file) => file.type === PDF_MIME)
        .filter((file) => !isDuplicate(file))
        .map((file) => new PdfFile(file));
      if (newFiles.length === 0) return;
      setFiles((prev) => [...prev, ...newFiles]);
    },
    [isDuplicate],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setState("dropping");
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setState("idle");
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      addFiles(Array.from(e.dataTransfer.files));
      setState("idle");
    },
    [addFiles],
  );

  const handleClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(Array.from(e.target.files ?? []));
    },
    [addFiles],
  );

  const removeDocument = useCallback(
    (file: PdfFile) => {
      setFiles((prev) => prev.filter((f) => f !== file));
    },
    [],
  );

  return (
    <div className={styles.dropareacontainer}>
      <div
        className={[
          styles.droparea,
          state === "dropping" ? styles.dropping : "",
        ].join(" ")}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.text}>
          <div className={styles.dropText}>
            <span className={styles.desktopHint}>
              Drop files in this area or&nbsp;
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
              key={`${f.name}-${f.file.lastModified}-${f.file.size}`}
              pdfFile={f}
              onRemove={removeDocument}
            />
          ))}
        </div>
      </div>

      <input
        hidden
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        multiple
        onChange={handleUpload}
      />
    </div>
  );
}
