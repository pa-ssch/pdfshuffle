"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.scss";
import DropFilesComponent from "./components/drop_files/drop_files";
import type { PDFPage } from "pdf-lib";
import { PdfFile } from "./models/PdfFile";
import { useState, useCallback, useRef, useEffect } from "react";

type AppState = "idle" | "ready" | "working" | "success";

const SUCCESS_DISPLAY_MS = 5000;
// Firefox and Safari may still be reading the blob when the click handler
// returns; revoking immediately can abort the download.
const REVOKE_DELAY_MS = 60_000;

function stateForFiles(files: PdfFile[]): AppState {
  return files.length > 0 ? "ready" : "idle";
}

export default function Home() {
  const [errorText, setErrorText] = useState("");
  const [state, setState] = useState<AppState>("idle");
  const [files, setFiles] = useState<PdfFile[]>([]);
  // Only the success-message timer touches component state, so only it must
  // be cancelled on unmount. Blob revocation timers keep running: cancelling
  // them would leak the blob, and firing after unmount is harmless.
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, []);

  const handleOnFilesChanged = useCallback((f: PdfFile[]) => {
    setFiles(f);
    setErrorText("");
    setState(stateForFiles(f));
  }, []);

  const buildShuffledPdf = async (): Promise<string | null> => {
    setState("working");
    const { PDFDocument, EncryptedPDFError } = await import("pdf-lib");
    const pages: PDFPage[] = [];
    const shuffledDoc = await PDFDocument.create();
    const unreadable: string[] = [];
    const encrypted: string[] = [];

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
        (ex instanceof EncryptedPDFError ? encrypted : unreadable).push(
          file.name,
        );
      }
    }

    if (unreadable.length > 0 || encrypted.length > 0) {
      const problems: string[] = [];
      if (encrypted.length > 0) {
        problems.push(
          `${encrypted.join(", ")} is password-protected — remove the protection first.`,
        );
      }
      if (unreadable.length > 0) {
        problems.push(
          `${unreadable.join(", ")} could not be read — is it a valid PDF?`,
        );
      }
      setErrorText(`⚠ ${problems.join(" ")}`);
      setState(stateForFiles(files));
      return null;
    }

    // Inside-out Fisher–Yates: every permutation is equally likely.
    pages.forEach((page, index) =>
      shuffledDoc.insertPage(Math.floor(Math.random() * (index + 1)), page),
    );

    const pdfBytes = await shuffledDoc.save();

    return URL.createObjectURL(
      new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }),
    );
  };

  const shuffleAndDownload = async () => {
    if (state !== "ready" && state !== "success") return;

    try {
      const url = await buildShuffledPdf();
      if (!url) return;

      const a = document.createElement("a");
      a.href = url;
      a.download = "shuffle.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);

      setState("success");
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => {
        successTimer.current = null;
        setState((current) =>
          current === "success" ? stateForFiles(files) : current,
        );
      }, SUCCESS_DISPLAY_MS);
    } catch (ex) {
      console.error(ex);
      setErrorText("⚠ Something went wrong while building the PDF. Please try again.");
      setState(stateForFiles(files));
    }
  };

  const isWorking = state === "working";
  const isSuccess = state === "success";

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/logo.webp"
          alt="PDF Shuffle Logo"
          width={720}
          height={426}
          priority
          fetchPriority="high"
        />
        <h1 className={styles.tagline}>
          Shuffle PDF pages — 100% in your browser, nothing uploaded.
        </h1>
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
            className={isWorking ? styles.hidden : styles.shufflebutton}
            disabled={state !== "ready" && state !== "success"}
            onClick={shuffleAndDownload}
          >
            {isSuccess ? "Shuffle again & Download PDF" : "Shuffle & Download PDF"}
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
