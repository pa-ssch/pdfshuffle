import styles from "../components/legal_page/legal_page.module.scss";
import Link from "next/link";

export const metadata = {
  title: "Datenschutzerklärung – PDF Shuffle",
};

export default function Datenschutz() {
  return (
    <div className={styles.page} lang="de">
      <main className={styles.main}>
        <h1>Datenschutzerklärung</h1>
        <p className={styles.note} lang="en">
          This is the German privacy policy of PDF Shuffle. In short: files are
          processed only in your browser, nothing is uploaded, no cookies or
          analytics are used. The host (GitHub Pages) logs IP addresses for
          technical operation.
        </p>

        <h2>1. Verantwortlicher</h2>
        <p>
          9xb, Inhaber Silas Mario Schnurr
          <br />
          Theodor-Heuss-Straße 14
          <br />
          77815 Bühl, Deutschland
          <br />
          E-Mail: <a href="mailto:pdfshuffle@9xb.de">pdfshuffle@9xb.de</a>
        </p>

        <h2>2. Überblick</h2>
        <p>
          PDF Shuffle ist eine reine Browser-Anwendung. Die von Ihnen
          ausgewählten PDF-Dateien werden vollständig auf Ihrem Gerät
          verarbeitet. Es gibt keinen Anwendungsserver, keine Nutzerkonten,
          keine Cookies, keine Analyse- oder Tracking-Dienste und keine
          Einbindung externer Dienste (auch keine externen Schriftarten oder
          Skripte).
        </p>

        <h2>3. Verarbeitung Ihrer PDF-Dateien</h2>
        <p>
          Dateien, die Sie in die Anwendung laden, verbleiben im
          Arbeitsspeicher Ihres Browsers und werden dort gemischt. Es findet
          keine Übertragung von Dateien, Dateiinhalten, Dateinamen oder
          sonstigen personenbezogenen Daten an uns oder Dritte statt. Mit dem
          Schließen oder Neuladen der Seite werden die Daten aus dem
          Arbeitsspeicher entfernt. Die von Ihnen heruntergeladene Ergebnisdatei
          liegt ausschließlich auf Ihrem Gerät.
        </p>

        <h2>4. Hosting (GitHub Pages)</h2>
        <p>
          Die statischen Dateien dieser Website werden über GitHub Pages
          ausgeliefert, einen Dienst der GitHub, Inc., 88 Colin P Kelly Jr St,
          San Francisco, CA 94107, USA, bzw. in Europa der GitHub B.V.,
          Prins Bernhardplein 200, 1097 JB Amsterdam, Niederlande.
        </p>
        <p>
          Beim Aufruf der Website verarbeitet GitHub technisch notwendige
          Verbindungsdaten, insbesondere Ihre IP-Adresse, Datum und Uhrzeit des
          Zugriffs, die aufgerufene Datei, den Browsertyp sowie das
          Betriebssystem, in Server-Logfiles. Dies ist erforderlich, um die
          Website auszuliefern und deren Sicherheit und Stabilität zu
          gewährleisten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
          (berechtigtes Interesse am sicheren und effizienten Betrieb der
          Website). Wir selbst haben keinen Zugriff auf diese Logfiles.
        </p>
        <p>
          Dabei können Daten in die USA übermittelt werden. GitHub ist unter
          dem EU-US Data Privacy Framework zertifiziert; die Übermittlung
          stützt sich auf den Angemessenheitsbeschluss der EU-Kommission
          (Art. 45 DSGVO). Weitere Informationen:{" "}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
            Datenschutzerklärung von GitHub
          </a>
          .
        </p>

        <h2>5. Cookies und lokale Speicherung</h2>
        <p>
          Diese Website setzt keine Cookies und legt keine Daten im lokalen
          Speicher Ihres Browsers ab. GitHub Pages setzt nach eigenen Angaben
          für die Auslieferung der Seiten ebenfalls keine Cookies.
        </p>

        <h2>6. Kontaktaufnahme</h2>
        <p>
          Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir die von Ihnen
          mitgeteilten Daten (E-Mail-Adresse, Inhalt der Nachricht) zur
          Bearbeitung Ihrer Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
          DSGVO (vorvertragliche Maßnahmen) bzw. lit. f DSGVO (berechtigtes
          Interesse an der Beantwortung). Die Daten werden gelöscht, sobald die
          Anfrage abschließend bearbeitet ist und keine gesetzlichen
          Aufbewahrungspflichten entgegenstehen.
        </p>

        <h2>7. Ihre Rechte</h2>
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
          <li>
            Recht auf Widerspruch gegen Verarbeitungen auf Grundlage von
            Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)
          </li>
        </ul>
        <p>
          Zur Ausübung Ihrer Rechte genügt eine E-Mail an{" "}
          <a href="mailto:pdfshuffle@9xb.de">pdfshuffle@9xb.de</a>.
        </p>

        <h2>8. Beschwerderecht bei einer Aufsichtsbehörde</h2>
        <p>
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über
          die Verarbeitung Ihrer personenbezogenen Daten zu beschweren
          (Art. 77 DSGVO). Die für uns zuständige Aufsichtsbehörde ist:
        </p>
        <p>
          Der Landesbeauftragte für den Datenschutz und die
          Informationsfreiheit Baden-Württemberg
          <br />
          Lautenschlagerstraße 20
          <br />
          70173 Stuttgart
          <br />
          <a
            href="https://www.baden-wuerttemberg.datenschutz.de"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.baden-wuerttemberg.datenschutz.de
          </a>
        </p>

        <h2>9. Änderungen</h2>
        <p>
          Wir passen diese Datenschutzerklärung an, wenn sich die Anwendung
          oder die Rechtslage ändert. Es gilt die jeweils hier veröffentlichte
          Fassung.
        </p>
        <p>Stand: Oktober 2026</p>

        <p className={styles.back}>
          <Link href="/">← Zurück zur Startseite</Link>
        </p>
      </main>
    </div>
  );
}
