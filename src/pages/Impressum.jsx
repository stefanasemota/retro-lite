import React from 'react';
import { Scale } from 'lucide-react';

export default function Impressum({ onNavigate }) {
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
          <Scale className="w-4 h-4" />
          Impressum
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">

        {/* ── Page Title ── */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-black uppercase tracking-[0.2em]">
            <Scale className="w-3 h-3" /> Rechtliche Angaben
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
            Impressum
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Angaben gemäß § 5 TMG / Pflichtangaben für Online-Dienste
          </p>
        </div>

        {/* ── Operator ── */}
        <Section title="Betreiber">
          <Field label="Name" value="Stefan Asemota" />
          <Field label="Adresse" value="Zunzgen, Schweiz" />
          <Field label="E-Mail" value="info@sabiai.work" link="mailto:info@sabiai.work" />
          <Field label="Website" value="sabiai.work" link="https://sabiai.work" />
        </Section>

        {/* ── Service ── */}
        <Section title="Dienst">
          <Field label="Produktname" value="Retro-Lite" />
          <Field label="Beschreibung" value="Retro-Lite ist ein schlankes, datenschutzfreundliches Tool für agile Retrospektiven. Der Dienst richtet sich ausschließlich an interne Teams und autorisierte Nutzer." />
          <Field label="Nutzungsumfang" value="Nicht öffentlich zugänglich. Der Zugang zur Session-Erstellung ist auf einen autorisierten Administrator beschränkt. Teilnehmer treten anonym bei." />
        </Section>

        {/* ── Disclaimer ── */}
        <Section title="Haftungsausschluss">
          <p className="text-slate-600 text-[15px] leading-relaxed">
            Die Inhalte dieses Dienstes wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann keine Gewähr übernommen werden. Als Dienstanbieter sind wir für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich. Eine Verpflichtung zur Überwachung übermittelter oder gespeicherter fremder Informationen besteht jedoch nicht.
          </p>
        </Section>

        {/* ── Copyright ── */}
        <Section title="Urheberrecht">
          <p className="text-slate-600 text-[15px] leading-relaxed">
            Die durch den Betreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem schweizerischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </Section>

        {/* ── Contact ── */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500">Kontakt</p>
          <p className="text-slate-700 text-[15px] leading-relaxed">
            Bei Fragen oder Anmerkungen zu diesem Impressum oder dem Dienst Retro-Lite wenden Sie sich bitte an{' '}
            <a href="mailto:info@sabiai.work" className="text-indigo-600 font-semibold hover:underline">
              info@sabiai.work
            </a>
            .
          </p>
        </div>

        {/* ── Footer nav ── */}
        <div className="pt-4 flex gap-6 text-sm text-slate-400">
          <button onClick={() => onNavigate('/privacy')} className="hover:text-indigo-600 transition-colors font-medium">
            Datenschutzerklärung
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

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 border-b border-slate-100 pb-3">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value, link }) {
  return (
    <div className="flex gap-4">
      <span className="text-[13px] font-black text-slate-400 w-32 shrink-0 pt-0.5">{label}</span>
      {link ? (
        <a href={link} className="text-[15px] text-indigo-600 font-medium hover:underline">
          {value}
        </a>
      ) : (
        <span className="text-[15px] text-slate-700 leading-relaxed">{value}</span>
      )}
    </div>
  );
}
