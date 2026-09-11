# Dlicom Mascot Visual System & Identity Layer

The Dlicom mascot system is standardized around a single canonical 3D collectible identity. 

Rather than a loose collection of disparate robot graphics, the system serves as a **deterministic visual identity layer** that represents users, skills, roles, and achievements across the Dlicom Web3 ecosystem.

---

## 1. The Canonical Character Foundation

Every variant in the system is rooted in the official base character ([`dlicom_base.png`](file:///public/mascots/base/dlicom_base.png)):

- **Proportions**: Compact collectible / chibi vinyl-toy proportions with rounded limbs and oversized spherical dome helmet.
- **Body**: Smooth royal blue vinyl finish with collectible toy seam detailing.
- **Helmet**: Optically clear, spherical transparent glass/bubble dome.
- **Visor**: Geometric luminous digital pixel eyes and smiling digital mouth situated inside the glass bubble.
- **Emblem**: Official white Dlicom diamond emblem centered on the chest.
- **Boots**: Chunky white vinyl collectible boots.
- **Cape**: Flowing royal blue superhero cape fluttering behind the character.
- **Pedestal**: Standing centered on a circular brushed dark-metallic display turntable with glowing LED ring and embossed "DLICOM COLLECTIBLES" plaque.
- **Handheld Props**: Authentic role-specific glowing 3D objects (code crystals, forcefield shields, builder tools, constellation wands, quantum clocks, game controllers, scales of justice).
- **Quality**: Polished 3D product render (1024×1024 minimum resolution, `.jpg`, pristine lighting, zero crude 2D canvas shapes or covered plaques).

---

## 2. 36 Variants Across 12 Families

| # | Family | Archetype | V1 Variant | V2 Variant | V3 Variant | Role Prop Theme |
|---|---|---|---|---|---|---|
| 1 | `PROTOCOL_CORE` | PROTOCOL_DEVELOPER | Core Engineer | Alchemist Synth | Bytecode Archon | Code terminals, compiler crystals, bytecode cubes |
| 2 | `AEGIS_DEFENSE` | AEGIS_SENTINEL | Barrier Sentinel | Cyber Bulwark | Vigil Guardian | Hexagonal forcefield shield, bulwark barrier & lightning |
| 3 | `SYSTEM_FOUNDRY` | SYSTEM_ARCHITECT | Forge Master | Infra Overseer | Nexus Constructor | Builder wrench, isometric node towers, fusion blocks |
| 4 | `NEXUS_SYNDICATE` | NEXUS_AMBASSADOR | Envoy Prime | Herald Voyager | Consul Steward | Constellation wand, network beacon, global sphere |
| 5 | `CHRONO_RESEARCH` | DATA_WEAVER | State Analyst | Quant Theorist | Cryptic Chronicler | Chrono prism, temporal quantum clock, research tablet |
| 6 | `CREATIVE_STUDIO` | LUMINARY_CREATOR | Prism Illustrator | Sculptor Neo | Holo Visionary | Holographic rainbow light stylus, prism cube, VR lens |
| 7 | `FRONTIER_EXPEDITION` | FRONTIER_PIONEER | Frontier Pioneer | Orbital Voyager | Astro Pathfinder | Astrolabe, orbital planetary globe, space telescope |
| 8 | `DEFI_QUANT` | PROTOCOL_RESEARCHER | Liquidity Navigator | Yield Tactician | Arbitrage Seeker | Infinity loop, AMM liquidity prism, candlestick chart |
| 9 | `ZERO_KNOWLEDGE` | DATA_WEAVER | ZK Prover | SNARK Verifier | Shadow Cryptor | Polyhedral core, mathematical proof orb, shadow key |
| 10 | `GAMEFI_ARCADE` | LUMINARY_CREATOR | Meta Duelist | Cyber Champion | Arcade Ronin | Handheld game console, arcade cabinet trophy, dual gamepads |
| 11 | `AI_SYNTHESIS` | SYSTEM_ARCHITECT | Synthetic Oracle | Neural Archon | Cyber Cogitator | Neural network lattice orb, glowing brain, quantum cube |
| 12 | `DAO_GOVERNANCE` | FRONTIER_PIONEER | Civic Archon | Treasury Steward | Constitutionalist | Scales of justice, golden treasury chest, constitution scroll |

---

## 3. Deterministic Identity Engine

The mascot generation engine guarantees 100% deterministic repeatability using 32-bit FNV-1a cryptographic hashing:

```
Username Input -> Public X Signals -> deriveArchetypeFromSignals() 
               -> deriveMascotFamily() -> pickDeterministic(hash) 
               -> 3D Collectible Asset URL -> MascotVisual UI
```

- **Zero Data Fabrication**: Profiles without public credentials fall back to transparent, user-confirmed archetypes.
- **Zero Collision Guarantee**: Tested across 500 unique inputs with 0 collisions.
- **Repeatability**: Multiple runs with the same username always produce the identical Mascot ID, Family, Variant, and Asset.

---

## 4. Automated Verification & Quality Gates

The system includes automated tests:

1. **Unit & Logic Suite**:
   ```bash
   npm run verify:mascot-generator
   ```
   Validates username sanitization, deterministic hashing, zero superhero copyright infringements, fallback transparency, and asset resolution.

2. **Final 36 Mascot Comprehensive Audit**:
   ```bash
   node scripts/run-final-36-mascot-audit.js
   ```
   Audits all 36 assets, 12 families, 500-input stress test, within-archetype diversity, initial UI clean state, and live browser DOM asset verification.

3. **Live Browser Diversity Suite**:
   ```bash
   node scripts/verify-mascot-diversity-browser.js
   ```
   Validates end-to-end synthesis in an active browser session across real profiles (`@Batman`, `@DCComics`, `@vitalikbuterin`, `@Uniswap`, `@ethereum`, etc.).
