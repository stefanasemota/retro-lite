# Cognitive Load Blueprint: Retro-Lite Workflow (v2)

Dieses Dokument dient als technischer und psychologischer Blueprint des UI-Flows zur Optimierung durch Google Stitch.

---

## Phase 1: Die 4L-Sammelphase
*„Was ist passiert?“*

- **Visueller Status**: 
    - **Header**: Session-Name, Live-Status, 4L-Übersicht (wenn History vorhanden).
    - **Grid**: 4-Spalten Layout (Liked, Learned, Lacked, Longed).
    - **Sidebar Links**: Eingabe-Karte (Kategorie-Wahl), Admin Control Tower.
    - **Primary Action Button**: `[Send]` (Teilnehmer) / `[Drill Down]` (Scrum Master auf Kategorie-Gewinnern).
- **Mentaler Kontext**: Breiter Fokus auf das gesamte Zeitintervall (Sprint/Projekt). Keine Vorfilterung erforderlich.
- **Daten-Transformation**: 
    - `currentPhase: 1`
    - `drillPath: []`
    - `focusId: null`
    - Einträge werden mit `category` (z.B. 'liked') gespeichert.
- **Friction Points**: 
    - Hohe visuelle Dichte bei vielen Karten.
    - **Szenario**: Wenn der Scrum Master "Drill Down" drückt, verschwindet für alle anderen Teilnehmer das gewohnte 4-Spalten Grid.
- **Kognitive Belastung**: 3/10 (Intuitiv, bekanntes Muster).

---

## ➔ ÜBERGANG 1 ➔ 2: Der Kontext-Sprung
- **Trigger**: SM klickt auf `[Ursachenforschung]` bei einer gewinnenden Karte.
- **Store-Mutation**: 
    - `currentPhase` wird 2.
    - `focusId` wird auf die ID der Anker-Karte gesetzt.
    - `drillPath` erhält den ersten Eintrag: `{parentId, parentText, phase: 1}`.
    - `navigationHistory` wird in Firestore aktualisiert, um den Pfad persistent zu halten.

---

## Phase 2: Ursachenforschung
*„Warum ist das passiert?“*

- **Visueller Status**: 
    - **Header**: Dominantes Breadcrumb-Icon ⚓ gefolgt vom Anker-Text aus Phase 1.
    - **Center**: Vertikale Liste von Ursachen-Karten (als Antwort auf den Anker).
    - **Sidebar Links**: Eingabe-Karte (Kategorie-Wahl entfällt, da Kontext starr).
    - **Primary Action Button**: `[Drill Down]` (SM auf der gewinnenden Ursache).
- **Mentaler Kontext**: Der Nutzer muss den **Anker-Text** im Kopf behalten. Der Context-Header dient hier als „External Memory Segment“.
- **Daten-Transformation**: 
    - Alle neuen Einträge erhalten automatisch `parentId: focusId`.
- **Friction Points**: 
    - „Wo sind meine anderen 4L Karten?“ (Gelöst durch Context-Header/Drilled-Indikatoren). 
    - Wenn Teilnehmer zu spät kommen, verstehen sie den Kontext der Liste nicht ohne Header-Lesen.
- **Kognitive Belastung**: 5/10 (Kontext-Tunneling beginnt).

---

## ➔ ÜBERGANG 2 ➔ 3: Die Lösungs-Navigation
- **Trigger**: SM klickt auf `[Lösung finden]` bei der Gewinner-Ursache.
- **Store-Mutation**: 
    - `currentPhase` wird 3.
    - `focusId` wechselt zur ID der Ursache.
    - `drillPath` wächst: `[Anchor, Cause]`.

---

## Phase 3: Lösungs-Entwicklung
*„Wie fixen wir es?“*

- **Visueller Status**:
    - **Header**: Doppelte Kette ⚓ [Anker] → 🔍 [Ursache]. Hohe visuelle Komplexität im Header.
    - **Center**: Liste von Lösungsvorschlägen.
    - **Primary Action Button**: `[Drill Down]` (SM auf Lösung) ➔ führt zu Phase 4 (Massnahmen).
- **Mentaler Kontext**: Dreistufige Logik-Kette. Risiko des „Working Memory Overflows“. Nutzer fragt: „Gegen welche Ursache war diese Lösung nochmal?“.
- **Daten-Transformation**: 
    - `parentId` Verknüpfung zur Ursache.
- **Friction Points**: 
    - Die Breadcrumbs werden lang. Auf kleinen Screens droht Text-Abschneiden.
- **Kognitive Belastung**: 7/10 (Hoher Bias durch vorherige Diskussionen).

---

## ➔ ÜBERGANG 3 ➔ 4: Die Strukturierung
- **Trigger**: SM klickt auf `[Massnahme festlegen]` (oder finalisiert die Retro).
- **Store-Mutation**: 
    - `view` wechselt zu 'summary'.
    - `isCompleted` wird true (Firestore-Sync für alle).

---

## Phase 4: Die Summary Matrix (Dashboard)
*„Was, Wer, Wann?“*

- **Visueller Status**:
    - **Center**: Full-Width Tabelle. Spalten: WHAT (Lösung), WHO, WHEN, CONTEXT (Root Category).
    - **Sidebar**: Deaktiviert oder reduziert.
    - **Primary Action Button**: `[Download CSV]`.
- **Mentaler Kontext**: Reflexion des gesamten Prozesses. Entlastung des Arbeitsgedächtnisses durch Tabellenform.
- **Daten-Transformation**: 
    - `findRootCategory()` wird ausgeführt, um rekursiv den Ursprung (Phase 1) jeder Zeile zu finden.
- **Friction Points**: 
    - Die Tabelle wirkt trocken im Vergleich zum spielerischen Board. 
    - Verknüpfung zwischen „Maßnahme“ und „Phase-1-Gefühl“ muss sofort ersichtlich sein.
- **Kognitive Belastung**: 2/10 (Konsumierend, strukturierend).

---

## Zusammenfassung für Design-KI (Google Stitch)

**Optimierungs-Potenzial**:
1. **Vertical Contextualization**: In Phase 2 & 3 sollte der Anker-Text nicht nur im Header, sondern dezent über dem Input-Feld wiederholt werden („Ich schreibe gerade eine Ursache für: X“).
2. **Transition Animation**: Der Wechsel vom Grid-View (P1) in den Drill-View (P2) braucht eine räumliche Metapher (Zoom-In auf die Karte), um den räumlichen Orientierungsverlust zu verhindern.
3. **Color-Coding**: Jede Phase braucht eine konsistente Akzentfarbe (P1: Indigo, P2: Violet, P3: Emerald, P4: Ruby), die sich durch Header und Buttons zieht.
