# Project Name — "Crucible"

**Date:** 2026-06-20
**Status:** Decided & applied

## Decision

The platform is named **Crucible**.

Wordmark: `Crucible` (rendered uppercase — **CRUCIBLE** — by the existing
cyberpunk heading styles). Tagline kept from the existing footer:
*"Train. Exploit. Secure."*

## Why

The previous "3Q CyberSecurity" name was removed for **compliance / trademark**
reasons (see the same-day brand scrub). The replacement needed to be:

- **Trademark-clean** in the security space — deliberately avoiding the crowded
  security-myth words (Aegis, Sentinel, Cerberus, Oracle, Prometheus, Heimdall,
  Loki), all of which already back well-known security/tech products.
- **Mythic / evocative** — a real, resonant word repurposed as a brand.
- **Descriptive of the product** — Crucible (a vessel that forges metal under
  extreme heat; figuratively, a severe trial that transforms you) mirrors the
  platform's structure: four escalating levels (theory **modules** → MCQ
  **tests** → hands-on **labs** → **CTF** finale) that forge a hacker.

Runner-up shortlist (for the record): Gauntlet, Daedalus, Argus, Umbra, Erebus,
Sphinx.

## Where it's applied

Full scope — user-facing **and** internal identifiers:

| Area | Change |
|---|---|
| `index.html` | `<title>` → Crucible |
| `src/components/banner/HeroBanner.jsx` | hero `<h1>` → Crucible |
| `src/pages/Home.jsx` | footer title + © line → Crucible |
| `README.md`, `CLAUDE.md` | headings/description → Crucible |
| Legacy `old-index.html` + `public/data/**/index.html` | `<title>` brand + `company-name` headings → Crucible (descriptive page names like "Cybersecurity Basics" left intact) |
| `package.json` | `name` `temp-react` → `crucible` |
| `src/components/AccessDeniedModal.jsx` | localStorage key → `crucible_test_lock_` |
| `render.yaml` | service `cyber-ctf` → `crucible-ctf` |

**Left untouched (subject-matter content, not branding):** the word
"cybersecurity" inside module chapters (`chapter*.json`), quiz options
(`questions/m*.json`), and legacy nav/quote scripts (`script.js`,
"Cybersecurity Fundamentals", "Cybersecurity is a mindset.").

## Caveats

- **Render service rename:** if the Blueprint is already deployed, renaming the
  service (`cyber-ctf` → `crucible-ctf`) makes Render provision a **new** service
  on the next sync → a new `*.onrender.com` URL. Rename in the dashboard instead
  if preserving the existing URL matters.
- **Lock key change:** any in-progress test lockouts under the old key reset
  (harmless).
