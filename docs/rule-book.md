# 📖 LST Retro-Lite: Standard Operating Procedure (SOP)

![Workflow](https://img.shields.io/badge/Workflow-4--Phasen--Modell-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Industry--Standard-success?style=for-the-badge)
![Role](https://img.shields.io/badge/Role-Moderator--Manual-indigo?style=for-the-badge)

Dieses Dokument dient als technisches Regelwerk und **Standard Operating Procedure (SOP)** für LST Retrospektiven. Es beschreibt den hybriden Workflow zwischen dem Moderator (Host) und dem Team (Teilnehmer) in der `retro-lite-v2` Umgebung.

---

## 📋 Table of Contents
- [Phase 1: Das Segelboot (Gather Data)](#phase-1-das-segelboot-gather-data)
- [Phase 2: Ursachenforschung (Generate Insights)](#phase-2-ursachenforschung-generate-insights)
- [Phase 3: Lösungs-Brainstorming (Decide What to Do)](#phase-3-lösungs-brainstorming-decide-what-to-do)
- [Phase 4: Verbindlichkeit (Concrete Actions)](#phase-4-verbindlichkeit-concrete-actions)
- [⚙️ Technische Features & Operational Rules](#️-technische-features--operational-rules)
- [💡 Profi-Tipps für Moderatoren](#-profi-tipps-für-moderatoren)

---

## Phase 1: Das Segelboot (Gather Data)

> [!IMPORTANT]
> **Ziel**: Ein unvoreingenommenes, ehrliches Bild des Sprints erhalten, ohne Peer-Pressure.

- **Aktion**: Jeder Teilnehmer schreibt Karten in die 4L-Kategorien (**Liked, Learned, Lacked, Longed For**).
- **Regel**: Der **Anti-Bias "Blur"** ist aktiv. Niemand liest mit, während andere schreiben. Dies verhindert das sogenannte "Groupthink"-Phänomen.
- **Abschluss**: Der Admin deaktiviert den Blur. Das Team votet die wichtigsten Karten (die "dicksten Anker").

---

## Phase 2: Ursachenforschung (Generate Insights)

> [!NOTE]
> **Trigger**: Die Karte mit den mathematisch höchsten Votes wird automatisch als "Winner" identifiziert.

- **Aktion**: Der Admin klickt auf den Winner-CTA `[Ursachenforschung 🔍]` auf der Gewinner-Karte.
- **Sidebar-Update**: Die gewählte 4L-Karte wird im **Sidebar Breadcrumb** als ⚓ **Anker** fixiert.
- **Workflow**: Die App schaltet für alle Teilnehmer in den Drill-Down-Mode. Neue Einträge werden automatisch hierarchisch unter dem Anker gespeichert.

---

## Phase 3: Lösungs-Brainstorming (Decide What to Do)

> [!TIP]
> **Fokus**: Lösungen müssen exakt zum vorher identifizierten Problem (Anker) passen.

- **Aktion**: Admin klickt auf `[Lösung finden 💡]`.
- **Sidebar-Update**: Unter dem Anker erscheint nun die 🔍 **Ursache**. Der "Rote Faden" wird für alle sichtbar.
- **Team-Workflow**: Das Team nutzt den Kontext rechts, um links präzise Lösungen zu brainstormen.

---

## Phase 4: Verbindlichkeit (Concrete Actions)

> [!CAUTION]
> **Regel**: Eine Massnahme ohne Owner ist keine Massnahme, sondern ein Wunsch.

- **Aktion**: Admin klickt auf `[Massnahme festlegen ✅]`.
- **Sidebar-Update**: Die gewählte 💡 **Lösung** vervollständigt den Context-Trail.
- **Ergebnis**: Eine finale Action-Card mit Owner (Wer) und Deadline (Wann) wird definiert.

---

## ⚙️ Technische Features & Operational Rules

| Feature | Beschreibung | Benefit |
| :--- | :--- | :--- |
| **Context-Trail** | Echtzeit-Streaming des `drillPath` via Firestore. | Reduktion der kognitiven Last. |
| **Winner-Logic** | FIFO-Algorithmus bei Voting-Gleichstand. | Verhindert Diskussionen über Priorisierung. |
| **No-Data-Loss** | Hierarchische Datenspeicherung via `parentId`. | Alle Daten bleiben im CSV-Export erhalten. |
| **Host-Control** | Sync-Mechanismus für Phasenwechsel. | Alle Teilnehmer bleiben im selben Fokus. |

---

## 💡 Profi-Tipps für Moderatoren

- **Transparenz**: Nutze die Sidebar, um Nachzügler sofort "abzuholen".
- **Fokus-Check**: Wenn das Team abschweift, zeige auf den Anker in der Sidebar: *"Lösen wir gerade wirklich dieses Problem?"*
- **Check-out**: Bestätige am Ende: *"Der Rote Faden steht. Haben wir hiermit genug Hebel für den nächsten Sprint?"*

> [!NOTE]
> Dieses Rule-Book wird kontinuierlich an die Weiterentwicklung von `retro-lite-v2` angepasst.