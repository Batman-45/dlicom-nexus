# Dlicom Nexus — System Architecture Specification

## 1. System Overview

**Dlicom Nexus** is a Dlicom identity and mascot experience where a user's X identity and public signals deterministically generate an Official Dlicom Hero.

The dApp provides an authentic, deterministic Web3 identity layer anchored by the canonical Dlicom 3D collectible mascot:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Dlicom Nexus Superhero System                     │
├───────────────────────────────────┬────────────────────────────────────┤
│           Mascot Studio           │           Mascot Gallery           │
│    (/ and /mascot/:username)      │              (/mascots)            │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌───────────────────────────────────┐ ┌──────────────────────────────────┐
│ Deterministic Identity Engine     │ │ Official Dlicom Hero Catalog     │
│ 32-bit FNV-1a Hashing & Salting   │ │ 12 Families × 36 Hero Variants   │
└─────────────────┬─────────────────┘ └────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Canonical 3D Collectible Assets                     │
│               36 Variants · 7 Legacy Aliases · Base Mascot             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architecture & Subsystems

### 2.1 Mascot Studio (`/` and `/mascot/:username`)
- **Public Signal Retrieval**: Reads public, verified X profile metadata (handle, display name, bio, follower count, joining date) without requiring private API tokens or third-party write credentials.
- **Transparent Fallback**: When public X APIs are rate-limited or unavailable, transparently activates `USER_CONFIRMED_FALLBACK` provenance, ensuring zero data fabrication.
- **Deterministic Identity Synthesis**:
  - Uses 32-bit FNV-1a hashing (`hashString`) and bitwise salt distribution (`pickDeterministic`).
  - Computes an immutable `computeDeterministicSeed(username)` for each handle.
  - Outputs a stable `DLI-MASCOT-XXXXXX` identifier.
  - Generates full visual traits (outfit, equipment, accessory, aura, expression, silhouette).
- **Official Dlicom Hero System**:
  - Maps `${familyId}:${variantId}` directly to one of 36 original Superhero Titles (e.g. *Captain DLI*, *Web DLI*, *Titan DLI*, *Tech DLI*, *Cosmic DLI*, *Flame DLI*, *Speed DLI*, *Mystic DLI*, *Shadow DLI*, *Armor DLI*, *Stealth DLI*).
  - Classifies into 5 Hero Pillars (`FOUNDATION_DEFENSE`, `ARCHITECT_NETWORK`, `KNOWLEDGE_SYNTHESIS`, `CREATIVE_EXPEDITION`, `DEFI_GOVERNANCE`).
  - Guarantees 100% original identity with absolute zero third-party IP infringement.

### 2.2 Mascot Gallery (`/mascots`)
- **Complete Visual Catalog**: Displays all 36 collectible hero variants grouped across the 12 protocol families.
- **Search & Filtering**: Real-time filtering by Superhero Title, family, archetype, role keywords, and visual attributes.
- **Direct Synthesis Navigation**: Inspecting any collectible card seamlessly loads the variant or transitions to Mascot Studio.

---

## 3. Navigation & Route Architecture

```
User-Facing Routes
├── /                       -> Mascot Studio (Home synthesis view)
├── /mascot/:username       -> Mascot Studio (Pre-loaded with specific X handle)
└── /mascots                -> Mascot Gallery (36 Hero Variants catalog)
```

- **Graceful Fallback**: Obsolete URLs (such as `/circle`, `/pipelines`, or deep links) cleanly route to the primary studio without broken pages or exceptions. If an obsolete handle route like `/circle/:handle` is visited, the navigation engine extracts the handle and opens Mascot Studio for that identity.
- **Navigation Structure**:
  - `Home`: Returns to the top-level synthesis hub (`/`).
  - `Mascot Studio`: Directs to the synthesis studio (`/`).
  - `Mascot Gallery`: Directs to the 36-variant hero catalog (`/mascots`).
