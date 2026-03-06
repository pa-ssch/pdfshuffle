import styles from "../components/legal_page/legal_page.module.scss";
import Link from "next/link";

export default function Impressum() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Impressum</h1>

        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          9xb<br />
          Inhaber: Silas Mario Schnurr<br />
          Theodor-Heuss-Straße 14<br />
          77815 Bühl
        </p>

        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href="mailto:info@9xb.de">info@9xb.de</a>
        </p>

        <h2>Umsatzsteuer</h2>
        <p>
          Gemäß § 19 UStG wird keine Umsatzsteuer erhoben.
        </p>

        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          Silas Mario Schnurr<br />
          Theodor-Heuss-Straße 14<br />
          77815 Bühl
        </p>

        <h2>Haftungsausschluss</h2>
        <p>
          Diese Webanwendung wird &bdquo;as is&ldquo; (so wie sie ist) ohne
          jegliche Gewährleistung bereitgestellt. Die Nutzung erfolgt auf eigene
          Gefahr. Der Betreiber übernimmt keine Haftung für Schäden, die durch
          die Nutzung dieser Anwendung oder durch fehlerhafte Ergebnisse
          entstehen. Der Nutzer ist selbst dafür verantwortlich, die erzeugten
          Dateien vor der Weiterverwendung zu prüfen.
        </p>
        <p>
          Sämtliche Dateien werden ausschließlich lokal im Browser verarbeitet
          und zu keinem Zeitpunkt an einen Server übertragen.
        </p>

        <p className={styles.back}>
          <Link href="/">← Back</Link>
        </p>
      </main>
    </div>
  );
}
