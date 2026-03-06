"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.scss";
import DropFilesComponent from "./components/drop_files/drop_files";
import type { PDFPage } from "pdf-lib";
import { PdfFile } from "./models/PdfFile";
import { useState, useCallback } from "react";

type AppState = "idle" | "ready" | "working" | "success";

function stateForFiles(files: PdfFile[]): AppState {
  return files.length > 0 ? "ready" : "idle";
}

export default function Home() {
  const [errorText, setErrorText] = useState("");
  const [state, setState] = useState<AppState>("idle");
  const [files, setFiles] = useState<PdfFile[]>([]);

  const handleOnFilesChanged = useCallback((f: PdfFile[]) => {
    setFiles(f);
    setErrorText("");
    setState(stateForFiles(f));
  }, []);

  const buildShuffledPdf = async (): Promise<string | null> => {
    setState("working");
    const { PDFDocument } = await import("pdf-lib");
    const pages: PDFPage[] = [];
    const shuffledDoc = await PDFDocument.create();
    const failedFiles: string[] = [];

    for (const file of files) {
      try {
        const doc = await PDFDocument.load(await file.file.arrayBuffer());
        pages.push(
          ...(await shuffledDoc.copyPages(
            doc,
            Array.from(Array(doc.getPageCount()).keys()),
          )),
        );
      } catch (ex) {
        console.error(ex, file);
        failedFiles.push(file.name);
      }
    }

    if (failedFiles.length > 0) {
      setErrorText(
        `⚠ ${failedFiles.join(", ")} could not be read — is it a valid PDF?`,
      );
      setState(stateForFiles(files));
      return null;
    }

    pages.forEach((page, index) =>
      shuffledDoc.insertPage(Math.floor(Math.random() * (index + 1)), page),
    );

    const pdfBytes = await shuffledDoc.save();

    const url = URL.createObjectURL(
      new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }),
    );
    return url;
  };

  const shuffleAndDownload = async () => {
    if (state !== "ready") return;

    let url: string | null = null;
    try {
      url = await buildShuffledPdf();
      if (!url) return;

      const a = document.createElement("a");
      a.href = url;
      a.download = "shuffle.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setState("success");
      setTimeout(() => {
        setState(stateForFiles(files));
      }, 5000);
    } catch (ex) {
      console.error(ex);
      setState(stateForFiles(files));
    } finally {
      if (url) URL.revokeObjectURL(url);
    }
  };

  const isWorking = state === "working";
  const isSuccess = state === "success";

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="logo.png"
          alt="PDF Shuffle Logo"
          width={180}
          height={180}
          priority
        />
        <p className={styles.tagline}>
          Shuffle PDF pages — 100% in your browser, nothing uploaded.
        </p>
        <h2 className={styles.stepLabel}>
          <span className={styles.stepBadge}>1</span> Add your PDF files
        </h2>
        <div className={styles.dropFilesArea}>
          <DropFilesComponent onFilesChanged={handleOnFilesChanged} />
        </div>
        <h2 className={styles.stepLabel}>
          <span className={styles.stepBadge}>2</span> Shuffle &amp; Download
        </h2>
        <div className={styles.result}>
          <span
            className={!isWorking && errorText ? styles.error : styles.hidden}
            role="alert"
          >
            {errorText}
          </span>
          <button
            className={
              isWorking || isSuccess ? styles.hidden : styles.shufflebutton
            }
            disabled={state !== "ready"}
            onClick={shuffleAndDownload}
          >
            Shuffle &amp; Download PDF
          </button>
          <div
            className={isWorking ? styles.loader : styles.hidden}
            role="status"
            aria-label="Processing PDF"
          ></div>
        </div>
        {isSuccess && (
          <div className={styles.stepDone} role="status">
            <span className={styles.stepBadge}>3</span>
            <span className={styles.successText}>
              Done — check your Downloads!
            </span>
          </div>
        )}
      </main>
      <footer className={styles.footer}>
        <Link href="/impressum">Impressum</Link>
        <Link href="/datenschutz">Datenschutz</Link>
      </footer>
    </div>
  );
}
