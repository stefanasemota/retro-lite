LST Retro-Lite: Das 4-Schritte Rule-Book (SOP)

Dieses Dokument dient als Standard Operating Procedure (SOP) für LST Retrospektiven. Es beschreibt den hybriden Workflow zwischen Scrum Master (Admin) und Team (Teilnehmer).

Phase 1: Das Segelboot (Gather Data)

Ziel: Ein unvoreingenommenes Bild des Sprints erhalten.

Aktion: Jeder Teilnehmer schreibt Karten in die 4L-Kategorien (Liked, Learned, Lacked, Longed For).

Regel: Der Anti-Bias "Blur" ist aktiv. Niemand liest mit, während geschrieben wird.

Abschluss: Admin deaktiviert den Blur. Das Team votet die wichtigsten Karten (die "dicksten Anker").

Sidebar: Die Sidebar zeigt nur den Session-Namen und die Teilnehmerzahl.

Phase 2: Ursachenforschung (Generate Insights)

Trigger: Die Karte mit den mathematisch höchsten Votes wird automatisch identifiziert.

Aktion: Admin klickt auf den Winner-CTA [Ursachenforschung 🔍] auf der Gewinner-Karte.

Sidebar-Update: Die gewählte 4L-Karte wird rechts als ⚓ Anker fixiert.

Workflow: Die App zeigt nun für alle Teilnehmer nur noch die Ursachen-Ebene an. Neue Einträge erhalten automatisch die ID des Ankers als parentId.

Phase 3: Lösungs-Brainstorming (Decide What to Do)

Trigger: Die wichtigste Ursache aus Phase 2 wird gewählt (Winner-Logic).

Aktion: Admin klickt auf [Lösung finden 💡].

Sidebar-Update: Unter dem Anker erscheint nun die 🔍 Ursache.

Workflow: Das Team sieht den "Roten Faden" rechts und sucht links nach Lösungen, die exakt zu dieser Ursache passen.

Phase 4: Verbindlichkeit (Concrete Actions)

Trigger: Die beste Lösung wird identifiziert (Winner-Logic).

Aktion: Admin klickt auf [Massnahme festlegen ✅].

Sidebar-Update: Die gewählte 💡 Lösung vervollständigt den Context-Trail.

Regel: Eine Massnahme wird erst gespeichert, wenn ein Owner (Wer) und eine Deadline (Wann) definiert sind.

🛠️ Technische Features & Operational Rules

Instant Setup: Die Session wird erst in Firestore erstellt, nachdem der Admin einen Namen vergeben hat.

Context-Trail (Sidebar): Dient zur Reduktion der kognitiven Last. Der Pfad (drillPath) wird in Echtzeit aus der Datenbank an alle Teilnehmer gestreamt.

Winner-Logic: Der Admin-Button für die nächste Phase erscheint ausschließlich auf der Karte mit dem höchsten Voting-Score (FIFO bei Gleichstand).

No-Data-Loss: Durch die hierarchische parentId-Struktur bleiben alle Daten der vorherigen Phasen erhalten und können im Export (CSV) zusammengeführt werden.

Profi-Tipps für Stephan (Moderator)

Transparenz: Nutze die Sidebar, um Nachzügler sofort "abzuholen".

Fokus: Wenn das Team abschweift, zeige auf den Anker in der Sidebar: "Lösen wir gerade wirklich dieses Problem?"

Check-out: Bestätige am Ende von Phase 4: "Der Rote Faden steht. Michael (PO), haben wir hiermit genug Hebel für den nächsten Sprint?"