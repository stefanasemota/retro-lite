Feature-Dokumentation: LST Retro-Lite

Die App wurde speziell für den Einsatz in agilen Teams (wie bei LST) entwickelt, um Reibungsverluste bei Retrospektiven zu minimieren.

1. Das "4 Ls" Framework

Anstelle von simplen "Gut/Schlecht"-Listen nutzt die App das psychologisch fundierte 4 Ls Framework:

Liked: Was lief gut?

Learned: Was haben wir gelernt (Tech/Prozess)?

Lacked: Was hat uns gefehlt?

Longed For: Was wünschen wir uns für die Zukunft?

Implementierung: Schneller Kategoriewechsel über eine mobile Tab-Bar.

2. Dual-Access System (Admin vs. Participant)

Admin (Du): Loggt sich sicher via Google ein. Nur du kannst neue Sessions erstellen, den "Blur"-Modus steuern und Daten exportieren.

Teilnehmer (Das Team): Maximale Hürdenfreiheit. Sie geben einfach den 6-stelligen Code ein und sind anonym dabei (Firebase Anonymous Auth). Das fördert die Ehrlichkeit.

3. Anti-Bias "Blur" Feature (Geeky Option)

Problem: "Group Think" – Leute schreiben das, was andere schon geschrieben haben.

Lösung: Du kannst als Admin das Board "unscharf" (blur) schalten. Jeder sieht nur seine eigenen Karten klar, die anderen sind verpixelt, bis du die Diskussion eröffnest.

4. Demokratisches Voting & Trophy-System

Voting: Jeder Teilnehmer kann Karten upvoten. Die Karten sortieren sich in Echtzeit um – die wichtigsten Themen wandern nach oben.

The Trophy: Die Karte mit den meisten Stimmen in jeder Kategorie bekommt automatisch ein Trophäen-Icon. Das macht die Priorisierung für Michael (PO) visuell sofort erfassbar.

5. Echtzeit-Synchronisation

Dank Firebase Firestore (Real-time Listeners) sieht jeder Teilnehmer sofort, wenn eine neue Karte erscheint oder ein Vote abgegeben wird. Es gibt kein "Seite neu laden".

6. Data Portability (CSV Export)

Mit einem Klick generiert die App eine CSV-Datei. Diese enthält:

Kategorie, Text der Karte und Anzahl der Votes.

Nutzen: Perfekt für das Sprint-Review-Protokoll oder zum Import in andere Tools (EasyRetro/Excel).

7. Boutique UI/UX

Mobile First: Das Design ist für Smartphones optimiert, da Teams in Retros oft nicht am Laptop sitzen wollen.

Design-Tokens: Abgerundete Formen (rounded-[2rem]), Indigo-Farbschema und Tailwind-Animationen für ein modernes "App-Gefühl".