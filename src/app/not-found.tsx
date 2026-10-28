import Link from "next/link";
import styles from "./components/legal_page/legal_page.module.scss";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>404 – Page not found</h1>
        <p>The page you were looking for does not exist.</p>
        <p className={styles.back}>
          <Link href="/">← Back to PDF Shuffle</Link>
        </p>
      </main>
    </div>
  );
}
