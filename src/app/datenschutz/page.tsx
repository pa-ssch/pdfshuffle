import styles from "../components/legal_page/legal_page.module.scss";
import Link from "next/link";

export default function Datenschutz() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Datenschutzerklärung</h1>

        <h2>1. Verantwortlicher</h2>
        <p>
          9xb, Inhaber Silas Mario Schnurr<br />
          Theodor-Heuss-Straße 14<br />
          77815 Bühl<br />
          E-Mail: <a href="mailto:info@9xb.de">info@9xb.de</a>
        </p>

        <h2>2. Hosting</h2>
        <p>
          Diese Website wird über GitHub Pages gehostet, einem Dienst der GitHub
          Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA. GitHub
          Pages verarbeitet beim Abruf der Website technisch notwendige
          Verbindungsdaten, insbesondere Ihre IP-Adresse, in Server-Logfiles.
          Dies dient der Auslieferung der Website und der Sicherstellung des
          technischen Betriebs. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
          (berechtigtes Interesse an einem stabilen und sicheren Betrieb der
          Website). Weitere Informationen finden Sie in der{" "}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
            Datenschutzerklärung von GitHub
          </a>
          .
        </p>

        <h2>3. Datenverarbeitung durch die Anwendung</h2>
        <p>
          PDF Shuffle verarbeitet Ihre PDF-Dateien ausschließlich lokal in Ihrem
          Browser. Es werden keine Dateien, Dateiinhalte oder persönlichen Daten
          an Server übertragen. Die gesamte Verarbeitung findet auf Ihrem Gerät
          statt. Nach dem Schließen des Browser-Tabs sind keine Daten mehr
          vorhanden.
        </p>

        <h2>4. Cookies</h2>
        <p>
          Diese Website setzt selbst keine Cookies. GitHub Pages kann im Rahmen
          des technischen Betriebs eigene Cookies setzen; wir haben darauf
          keinen Einfluss.
        </p>

        <h2>5. Ihre Rechte</h2>
        <p>
          Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie
          betreffenden personenbezogenen Daten:
        </p>
        <ul>
          <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
          <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
          <li>Recht auf Löschung (Art. 17 DSGVO)</li>
          <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
        </ul>

        <h2>6. Beschwerderecht</h2>
        <p>
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über
          die Verarbeitung Ihrer personenbezogenen Daten zu beschweren. Die
          zuständige Aufsichtsbehörde ist:
        </p>
        <p>
          Der Landesbeauftragte für den Datenschutz und die
          Informationsfreiheit Baden-Württemberg<br />
          Lautenschlagerstraße 20<br />
          70173 Stuttgart<br />
          <a
            href="https://www.baden-wuerttemberg.datenschutz.de"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.baden-wuerttemberg.datenschutz.de
          </a>
        </p>

        <p className={styles.back}>
          <Link href="/">← Back</Link>
        </p>
      </main>
    </div>
  );
}
