import React from 'react';
import { Shield, Server, Lock, Trash2, Mail, Globe } from 'lucide-react';

export default function Privacy({ onNavigate }) {
  const lastUpdated = '04. April 2026';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 font-[Inter,system-ui,sans-serif]">

      {/* ── Minimal Header ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold"
        >
          ← Zurück zu Retro-Lite
        </button>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
          <Shield className="w-4 h-4" />
          Datenschutz
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">

        {/* ── Page Title ── */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-black uppercase tracking-[0.2em]">
            <Shield className="w-3 h-3" /> DSGVO-konform
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
            Datenschutz&shy;erklärung
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Zuletzt aktualisiert: {lastUpdated}
          </p>
        </div>

        {/* ── Overview card ── */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Kurzübersicht</p>
          <ul className="space-y-2 text-[14px] text-slate-300 leading-relaxed">
            <li className="flex gap-3 items-start"><span className="text-emerald-400 shrink-0 mt-0.5">✓</span>Keine Werbetracking-Cookies.</li>
            <li className="flex gap-3 items-start"><span className="text-emerald-400 shrink-0 mt-0.5">✓</span>Alle Daten verbleiben in der EU (Frankfurt, Deutschland).</li>
            <li className="flex gap-3 items-start"><span className="text-emerald-400 shrink-0 mt-0.5">✓</span>Google-Login nur für den Sitzungsadministrator. Teilnehmer bleiben anonym.</li>
            <li className="flex gap-3 items-start"><span className="text-emerald-400 shrink-0 mt-0.5">✓</span>Datenlöschung auf Anfrage jederzeit möglich.</li>
          </ul>
        </div>

        {/* ── Verantwortlicher ── */}
        <Section title="1. Verantwortlicher" icon={<Globe className="w-4 h-4" />}>
          <p className="text-slate-600 text-[15px] leading-relaxed">
            Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
          </p>
          <div className="bg-slate-50 rounded-2xl p-6 space-y-1 text-[14px] text-slate-700">
            <p className="font-bold text-slate-900">Stefan Asemota</p>
            <p>Zunzgen, Schweiz</p>
            <p>
              E-Mail:{' '}
              <a href="mailto:info@sabiai.work" className="text-indigo-600 hover:underline font-medium">
                info@sabiai.work
              </a>
            </p>
          </div>
        </Section>

        {/* ── Hosting ── */}
        <Section title="2. Hosting & Infrastruktur" icon={<Server className="w-4 h-4" />}>
          <SubSection heading="Frontend — Hostpoint AG">
            <p>
              Die Weboberfläche von Retro-Lite wird auf Servern der <strong>Hostpoint AG</strong> (Schweiz) gehostet. Hostpoint stellt ausschließlich statische Dateien (HTML, CSS, JavaScript) bereit. Es werden keine personenbezogenen Daten auf den Hostpoint-Servern gespeichert.
            </p>
            <InfoBox label="Anbieter">Hostpoint AG, Glattalstrasse 8, 8301 Glattzentrum, Schweiz</InfoBox>
          </SubSection>

          <SubSection heading="Backend & Datenbank — Google Firebase">
            <p>
              Sämtliche Session-Daten (Retrospektiven-Einträge, Abstimmungen, Maßnahmen) werden in <strong>Google Firebase Firestore</strong> gespeichert.
            </p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-1">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Datenspeicherort</p>
              <p className="text-[15px] font-bold text-emerald-900">
                Google Cloud Region: <code className="bg-emerald-100 px-2 py-0.5 rounded-lg text-sm">europe-west3</code> (Frankfurt, Deutschland)
              </p>
              <p className="text-[13px] text-emerald-700 mt-1">
                Alle Daten verbleiben innerhalb der Europäischen Union. Die Datenverarbeitung erfolgt gemäß den Standardvertragsklauseln (SCCs) der EU-Kommission.
              </p>
            </div>
            <InfoBox label="Anbieter">Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland</InfoBox>
            <p>
              Google Firebase unterliegt den{' '}
              <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">
                Firebase Privacy and Security Policies
              </a>
              {' '}sowie dem{' '}
              <a href="https://cloud.google.com/terms/data-processing-addendum" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">
                Google Cloud Data Processing Addendum
              </a>
              .
            </p>
          </SubSection>
        </Section>

        {/* ── Authentication ── */}
        <Section title="3. Authentifizierung" icon={<Lock className="w-4 h-4" />}>
          <SubSection heading="Anonyme Teilnehmer">
            <p>
              Teilnehmer treten Retro-Sessionen über einen Sitzungscode bei. Es ist <strong>keine Anmeldung erforderlich</strong>. Die App weist jedem Teilnehmer anonym eine temporäre, zufällige Nutzer-ID (Firebase Anonymous UID) zu. Diese ID ist nicht mit einer E-Mail-Adresse oder einem Namen verknüpft und wird beim Verlassen der Session verworfen.
            </p>
          </SubSection>

          <SubSection heading="Google OAuth — Nur für den Administrator">
            <p>
              Der Sitzungshost verwendet <strong>Google OAuth 2.0</strong> zur Anmeldung. Dabei werden ausschließlich folgende Daten von Google übermittelt und gespeichert:
            </p>
            <ul className="space-y-2 mt-2">
              <DataPoint label="E-Mail-Adresse" desc="Zur Autorisierungsprüfung (einziger erlaubter Administrator)." />
              <DataPoint label="Google User UID" desc="Zur Identifikation des Sitzungserstellers in Firestore (hostId-Feld)." />
            </ul>
            <p className="text-slate-500 text-[13px] mt-3">
              Profilbild, Name, Telefonnummer oder andere Google-Profildaten werden <strong>nicht</strong> gespeichert oder verarbeitet. Nach dem Logout werden alle lokalen Firebase-Auth-Tokens gelöscht.
            </p>
            <InfoBox label="Rechtsgrundlage">Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Zugriffskontrolle)</InfoBox>
          </SubSection>
        </Section>

        {/* ── What we store ── */}
        <Section title="4. Gespeicherte Daten" icon={<Server className="w-4 h-4" />}>
          <p className="text-slate-600 text-[15px] leading-relaxed">
            In Google Firebase Firestore werden ausschließlich Daten gespeichert, die zur Durchführung der Retrospektive notwendig sind:
          </p>
          <table className="w-full text-[13px] border-collapse mt-2">
            <thead>
              <tr className="text-left text-slate-400 font-black uppercase tracking-[0.15em] text-[10px] border-b border-slate-100">
                <th className="pb-2 pr-4">Datenkategorie</th>
                <th className="pb-2 pr-4">Inhalt</th>
                <th className="pb-2">Speicherdauer</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-50">
                <td className="py-3 pr-4 font-semibold">Session-Dokument</td>
                <td className="py-3 pr-4">Sitzungsname, Phase, Drill-Pfad, Blur-Status, Timer, hostId</td>
                <td className="py-3">Bis zur Löschung durch Admin</td>
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-3 pr-4 font-semibold">Sticky Notes (Einträge)</td>
                <td className="py-3 pr-4">Text, Phase, anonyme UID, Stimmen</td>
                <td className="py-3">Bis zur Löschung durch Admin</td>
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-3 pr-4 font-semibold">Maßnahmen (Action Items)</td>
                <td className="py-3 pr-4">Aufgabentext, Verantwortliche Person, Fälligkeitsdatum, Ursprung</td>
                <td className="py-3">Bis zur Löschung durch Admin</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold">Admin-ID</td>
                <td className="py-3 pr-4">E-Mail &amp; Google UID des Hosts</td>
                <td className="py-3">Bis zur Löschung durch Admin</td>
              </tr>
            </tbody>
          </table>
          <p className="text-slate-400 text-[13px] mt-3">
            Keine Cookies zu Werbezwecken. Kein Google Analytics. Keine automatische Profilerstellung.
          </p>
        </Section>

        {/* ── Rights ── */}
        <Section title="5. Ihre Rechte" icon={<Trash2 className="w-4 h-4" />}>
          <p className="text-slate-600 text-[15px] leading-relaxed">
            Als betroffene Person haben Sie folgende Rechte gemäß DSGVO:
          </p>
          <ul className="space-y-3 mt-2">
            <Right title="Auskunft (Art. 15 DSGVO)">
              Sie können jederzeit Auskunft darüber verlangen, welche Daten über Sie gespeichert sind.
            </Right>
            <Right title="Berichtigung (Art. 16 DSGVO)">
              Unrichtige Daten können auf Anfrage korrigiert werden.
            </Right>
            <Right title="Löschung (Art. 17 DSGVO)">
              Sie haben das Recht, die Löschung Ihrer gespeicherten Retro-Daten (Einträge, Maßnahmen, Session-Dokumente) jederzeit zu verlangen. Senden Sie eine E-Mail an{' '}
              <a href="mailto:info@sabiai.work" className="text-indigo-600 hover:underline font-medium">info@sabiai.work</a>
              {' '}mit dem Betreff „Datenlöschung Retro-Lite".
            </Right>
            <Right title="Widerspruch (Art. 21 DSGVO)">
              Sie können der Verarbeitung Ihrer Daten widersprechen.
            </Right>
            <Right title="Beschwerde bei der Aufsichtsbehörde">
              Sie haben das Recht, sich bei der zuständigen Datenschutzbehörde zu beschweren. In Deutschland ist dies der Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI). In der Schweiz ist es der Eidgenössische Datenschutz- und Öffentlichkeitsbeauftragte (EDÖB).
            </Right>
          </ul>
        </Section>

        {/* ── Contact ── */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 flex gap-4 items-start">
          <Mail className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500">Datenschutz-Anfragen</p>
            <p className="text-slate-700 text-[15px] leading-relaxed">
              Für alle datenschutzrelevanten Anfragen wenden Sie sich bitte an{' '}
              <a href="mailto:info@sabiai.work" className="text-indigo-600 font-semibold hover:underline">
                info@sabiai.work
              </a>
              . Anfragen zur Datenlöschung werden innerhalb von 30 Tagen bearbeitet.
            </p>
          </div>
        </div>

        {/* ── Footer nav ── */}
        <div className="pt-4 flex gap-6 text-sm text-slate-400">
          <button onClick={() => onNavigate('/impressum')} className="hover:text-indigo-600 transition-colors font-medium">
            Impressum
          </button>
          <button onClick={() => onNavigate('/')} className="hover:text-indigo-600 transition-colors font-medium">
            Zurück zur App
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, icon, children }) {
  return (
    <section className="space-y-5">
      <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 border-b border-slate-100 pb-3">
        {icon} {title}
      </h2>
      <div className="space-y-5 text-slate-600 text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}

function SubSection({ heading, children }) {
  return (
    <div className="space-y-3">
      <h3 className="font-black text-slate-800 text-[15px]">{heading}</h3>
      <div className="space-y-3 text-slate-600 text-[15px] leading-relaxed">{children}</div>
    </div>
  );
}

function InfoBox({ label, children }) {
  return (
    <div className="flex gap-3 bg-slate-50 rounded-xl p-4">
      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mt-0.5 w-24">{label}</span>
      <span className="text-[13px] text-slate-600">{children}</span>
    </div>
  );
}

function DataPoint({ label, desc }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
      <span>
        <strong className="text-slate-800 font-bold">{label}:</strong>{' '}
        <span className="text-slate-600">{desc}</span>
      </span>
    </li>
  );
}

function Right({ title, children }) {
  return (
    <li className="bg-white border border-slate-100 rounded-2xl p-5 space-y-1 shadow-sm">
      <p className="font-black text-slate-800 text-[14px]">{title}</p>
      <p className="text-slate-600 text-[14px] leading-relaxed">{children}</p>
    </li>
  );
}
