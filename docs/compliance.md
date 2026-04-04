# Compliance & Data Residency — Retro-Lite

> Last updated: 04 April 2026

## Data Residency

All user-generated data (session documents, sticky-note entries, action items) is stored in **Google Firebase Firestore** scoped to the following region:

| Component | Provider | Region | Location |
|-----------|----------|--------|----------|
| Firestore database | Google Firebase | `europe-west3` | Frankfurt, Germany 🇩🇪 |
| Firebase Auth tokens | Google Firebase | `europe-west3` | Frankfurt, Germany 🇩🇪 |
| Static frontend | Hostpoint AG | Switzerland 🇨🇭 | Glattzentrum, Zurich area |

### Why `europe-west3`?
- Data remains **within the European Union**, ensuring compliance with the GDPR's data transfer requirements (Art. 44–49 DSGVO).
- Chosen for **lowest latency** to the primary user base (Swiss German-speaking Scrum teams).
- Google Cloud's `europe-west3` region operates under [Google's EU Data Boundary commitment](https://cloud.google.com/trust-center/data-boundary), which ensures that EU data does not leave the EU region for processing by Google staff.

### Transition Log
| Date | Change | Reason |
|------|--------|--------|
| 2026-04-04 | Confirmed `europe-west3` as canonical Firestore region | Documented for DSGVO compliance |
| 2026-04-04 | Added `firestore.rules` to version control | Security rules previously only in Firebase Console |
| 2026-04-04 | Added `/impressum` and `/privacy` public pages | DSGVO Art. 13 transparency requirement |

---

## Authentication

| Method | Applies to | Data collected |
|--------|-----------|----------------|
| Firebase Anonymous Auth | All participants | Temporary random UID (discarded on session leave) |
| Google OAuth 2.0 | Administrator only | Email address + Google UID |

- **No participant personal data** is ever collected. Participants join via a session code and receive a temporary Firebase anonymous UID.
- **Administrator login** collects only `email` and `uid` from Google's ID token. No profile photo, display name, or phone number is stored.
- All Firebase Auth ID tokens are short-lived (1 hour) and automatically rotated by the Firebase SDK.

---

## Firestore Security Rules

Production rules are version-controlled in `firestore.rules` (root of repo).

Key constraints enforced server-side:
- `isAdmin()` — only `stephan.asemota@gmail.com` may create or delete sessions.
- `isSessionHost()` — only the session creator may update session documents (phase, timer, action items).
- Entry `create` — `userId` must match `request.auth.uid` (prevents forging another user's sticky note).
- Entry `update` for votes — only `votes` and `voters` fields may be changed by non-owners.
- Catch-all deny rule — all Firestore paths not explicitly listed are denied.

Deploy: `firebase deploy --only firestore:rules`

---

## Legal Pages

Both pages are public (no authentication required):

| Page | URL | Purpose |
|------|-----|---------|
| Impressum | `/impressum` | Legal notice per §5 TMG / Swiss DSG |
| Datenschutzerklärung | `/privacy` | GDPR / DSGVO transparency notice (Art. 13) |

---

## GDPR Rights

Users may request:
1. **Access** — list of all data stored under their session
2. **Correction** — update of incorrect records
3. **Deletion** — full erasure of session, entries, and action items
4. **Objection** — to any processing

All requests should be sent to **info@sabiai.work** with subject: `Datenlöschung Retro-Lite`.  
Target response time: 30 days (GDPR Art. 12(3)).

---

## Applicable Law

- **DSGVO** (EU General Data Protection Regulation) — applies to Firebase data in `europe-west3`
- **DSG** (Swiss nDSG, in force since 01.09.2023) — applies to Hostpoint hosting in Switzerland
- **TMG §5** — German Telemediengesetz, for the Impressum obligation
