import styles from "../components/legal_page/legal_page.module.scss";
import Link from "next/link";

export const metadata = {
  title: "Impressum – PDF Shuffle",
};

export default function Impressum() {
  return (
    <div className={styles.page} lang="de">
      <main className={styles.main}>
        <h1>Impressum</h1>
        <p className={styles.note} lang="en">
          This page is the legally required German site notice of PDF Shuffle.
          In short: your files never leave your browser.
        </p>

        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          9xb
          <br />
          Inhaber: Silas Mario Schnurr
          <br />
          Theodor-Heuss-Straße 14
          <br />
          77815 Bühl
          <br />
          Deutschland
        </p>

        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href="mailto:pdfshuffle@9xb.de">pdfshuffle@9xb.de</a>
        </p>

        <h2>Umsatzsteuer</h2>
        <p>
          Kleinunternehmer im Sinne von § 19 UStG; es wird keine Umsatzsteuer
          ausgewiesen.
        </p>

        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          Silas Mario Schnurr
          <br />
          Theodor-Heuss-Straße 14
          <br />
          77815 Bühl
        </p>

        <h2>Verbraucherstreitbeilegung</h2>
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen (§ 36 VSBG).
        </p>

        <h2>Haftung für Inhalte und Ergebnisse</h2>
        <p>
          Diese Webanwendung wird kostenlos und &bdquo;wie besehen&ldquo; ohne
          jegliche Gewährleistung bereitgestellt. Der Betreiber übernimmt keine
          Haftung für Schäden, die durch die Nutzung dieser Anwendung oder durch
          fehlerhafte Ergebnisse entstehen, soweit gesetzlich zulässig. Nutzer
          sind selbst dafür verantwortlich, erzeugte Dateien vor der
          Weiterverwendung zu prüfen.
        </p>
        <p>
          Sämtliche Dateien werden ausschließlich lokal im Browser verarbeitet
          und zu keinem Zeitpunkt an einen Server übertragen.
        </p>

        <h2>Haftung für Links</h2>
        <p>
          Diese Website enthält Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte ist stets
          der jeweilige Anbieter verantwortlich. Zum Zeitpunkt der Verlinkung
          waren keine Rechtsverstöße erkennbar.
        </p>

        <h2>Urheberrecht und Open Source</h2>
        <p>
          Der Quellcode von PDF Shuffle ist unter der Apache-Lizenz 2.0
          veröffentlicht:{" "}
          <a
            href="https://github.com/pa-ssch/pdfshuffle"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/pa-ssch/pdfshuffle
          </a>
          . Das Logo und die Marke &bdquo;PDF Shuffle&ldquo; sind davon
          ausgenommen.
        </p>

        <p className={styles.back}>
          <Link href="/">← Zurück zur Startseite</Link>
        </p>
      </main>
    </div>
  );
}
