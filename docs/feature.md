# 🚀 Feature-Dokumentation: LST Retro-Lite

![Build Info](https://img.shields.io/badge/Stack-React--Vite--Firebase-orange?style=for-the-badge)
![UI Design](https://img.shields.io/badge/Design-Boutique--UX-navy?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Optimized-success?style=for-the-badge)

Die **Retro-Lite-v2** App wurde speziell für den Einsatz in agilen Teams entwickelt, um Reibungsverluste bei Retrospektiven zu minimieren und kognitive Last zu reduzieren.

---

## 📋 Table of Contents
- [1. Das "4 Ls" Framework](#1-das-4-ls-framework)
- [2. Dual-Access System (Admin vs. Participant)](#2-dual-access-system-admin-vs-participant)
- [3. Anti-Bias "Blur" Feature](#3-anti-bias-blur-feature)
- [4. Demokratisches Voting & Winner-Logic](#4-demokratisches-voting--winner-logic)
- [5. Echtzeit-Synchronisation](#5-echtzeit-synchronisation)
- [6. Data Portability (CSV Export)](#6-data-portability-csv-export)
- [7. Boutique UI/UX Principles](#7-boutique-uiux-principles)

---

## 1. Das "4 Ls" Framework

Anstelle von simplen "Gut/Schlecht"-Listen nutzt die App das psychologisch fundierte **4 Ls Framework**, um eine tiefere Perspektive auf den Sprint zu ermöglichen:

- **Liked**: Was lief besonders gut und hat uns Freude bereitet?
- **Learned**: Welche neuen Erkenntnisse (Tech/Prozess) haben wir gewonnen?
- **Lacked**: Was hat uns während der Arbeit gefehlt oder blockiert?
- **Longed For**: Was wünschen wir uns für die Zukunft (Wünsche/Visionen)?

> [!TIP]
> Die App ermöglicht einen schnellen Kategoriewechsel über eine mobile-optimierte Tab-Bar, um Gedankenflüsse nicht zu unterbrechen.

---

## 2. Dual-Access System (Admin vs. Participant)

| Rolle | Zugang | Privilegien |
| :--- | :--- | :--- |
| **Admin (Host)** | Sicherer Google Auth | Erstellt Sessions, steuert den Workflow (Blur/Phasen), generiert Exports. |
| **Teilnehmer** | 6-stelliger Code | Anonyme Teilnahme via Firebase Anonymous Auth. Maximale Ehrlichkeit ohne Login-Hürden. |

---

## 3. Anti-Bias "Blur" Feature

> [!IMPORTANT]
> **Das Problem**: "Group Think" – Teammitglieder orientieren sich unbewusst an bereits existierenden Karten.

**Die Lösung**: Ein Klick des Admins schaltet das Board "unscharf" (Blur). Jeder sieht nur seine eigenen Entwürfe klar. Erst wenn die Diskussion eröffnet wird, deaktiviert der Admin den Blur für alle Teilnehmer synchron.

---

## 4. Demokratisches Voting & Winner-Logic

Die App nutzt einen Echtzeit-Voting-Mechanismus, um die Priorisierung zu objektivieren:
- **Mathematische Präzision**: Die Trophäe 🏆 erscheint automatisch auf der Karte mit den höchsten Stimmen.
- **Tie-Breaker**: Bei Punktegleichstand greift die **FIFO-Logik** (First In, First Out) basierend auf dem Zeitstempel der Karte.

---

## 5. Echtzeit-Synchronisation

Dank **Firebase Firestore** (Real-time Listeners) agiert die App verzögerungsfrei:
- Keine manuellen Page-Refreshes nötig.
- Live-Counters für Teilnehmer und Votings.
- Instant-Updates für den moderator-gesteuerten Drill-Down-Pfad ("Der Rote Faden").

---

## 6. Data Portability (CSV Export)

Die Ergebnisse einer Retro müssen operativ nutzbar sein. Mit einem Klick generiert der Admin eine CSV-Datei:
- **Inhalt**: Kategorie, Karten-Text, Voting-Score und (falls vorhanden) die hierarchische Verknüpfung zur Ursache.
- **Nutzen**: Perfekt für Sprint-Review-Protokolle, Jira-Integrationen oder Excel-Follow-ups.

---

## 7. Boutique UI/UX Principles

Die App folgt einem **Boutique-Ansatz**: Weniger ist mehr, aber das, was da ist, muss sich premium anfühlen.
- **Mobile-First**: Optimiert für die Nutzung am Smartphone während man im Teamraum steht.
- **Modern Stack**: Tailwind CSS mit Custom-Animationen, Lucide Icons und abgerundeten "Pill"-Designs (`rounded-[2rem]`) für ein freundliches, modernes Interface.

---

> [!NOTE]
> Diese Dokumentation dient als Referenz für alle Stakeholder und wird bei jedem Feature-Update (z.B. neue Analyse-Tools) ergänzt.
