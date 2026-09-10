# Dlicom Nexus — System Architecture Specification

## 1. System Overview

**Dlicom Nexus** is an orchestration and Web3 intelligence platform uniting deterministic identity, decentralized community graphs, and visual node-based workflow automation.

The platform is structured into four decoupled, synergistic subsystems within a Unified Shell:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Dlicom Nexus Unified Shell                      │
├───────────────┬────────────────────┬──────────────────┬────────────────┤
│ Mascot Studio │ Circle Constell.   │ Pipeline Studio  │ Execution Ctr. │
│ (12 Families) │ (Personal Circles) │ (@xyflow/react)  │ & Detail Trace │
└───────┬───────┴─────────┬──────────┴────────┬─────────┴────────┬───────┘
        │                 │                   │                  │
        ▼                 ▼                   ▼                  ▼
┌───────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Deterministic │ │ Graph Resolver │ │ DAG Resolution │ │ Execution Store│
│ FNV-1a Engine │ │ & Isolation    │ │ & Safe Parser  │ │ & LocalStorage │
└───────────────┘ └────────────────┘ └────────────────┘ └────────────────┘
```

---

## 2. Core Subsystems

### 2.1 Mascot Identity Engine (`/` and `/mascots`)
- **Deterministic Synthesis**: Uses a 32-bit FNV-1a hashing algorithm to deterministically map public X signals (or user-confirmed fallback focus) into reproducible identity attributes:
  - 12 authentic Web3/protocol families
  - 36 unique visual variants
  - Traits, equipment, temperament, and color palettes
- **Zero Fabrication**: Profiles without public verifiable signals gracefully fall back to transparently marked `USER_CONFIRMED_FALLBACK` derivations.
- **Anti-Infringement**: Hardened against Marvel/superhero trademarks; all assets and archetypes are original Web3 and cyberpunk creations.

### 2.2 Circle Constellation (`/circle` and `/circle/:handle`)
- **Radial Constellation Layout**: Edge-to-edge canvas displaying personal friend circles orbiting a central user.
- **Personal Friend Isolation Invariant**: Enforces that only observed public interactions appear within a personal circle.
- **Mascot Identity Card**: When inspecting a peer profile (`/circle/:handle`), a deterministic Mascot Identity Card is rendered displaying traits, collectible character art, and an action to emit signals into the pipeline engine.

### 2.3 Pipeline Studio & Canvas (`/pipelines` and `/pipeline/:id`)
- **Graph Framework**: Built on `@xyflow/react` with a custom cosmic dark theme, high-contrast connection handles, and custom nodes.
- **Connector Registry**: Built-in triggers (Smart Contract Listener, DEX Liquidity Sweep, Social Signal Trigger, Webhook) and actions (Discord Dispatch, Slack Dispatch, State Sync, HTTP Request).
- **DAG Resolver & Cycle Detection**:
  - Validates directed acyclic graph topology before execution.
  - Detects direct (`A -> B -> A`) and indirect (`A -> B -> C -> B`) cycles.
  - Groups nodes into sequential and parallel execution tiers using topological sorting.

### 2.4 Execution Engine & Runtime Telemetry (`/executions` and `/execution/:id`)
- **Safe Sandboxed Expression Evaluator**:
  - Custom recursive-descent AST parser and tokenizer.
  - Evaluates arithmetic (`+`, `-`, `*`, `/`), logical (`&&`, `||`, `!`), equality, comparisons, and ternaries.
  - **Zero `eval()` or `new Function()`** to protect client security.
- **Parameterized HTTP URL Templates**: Supports mustache-style variable substitutions (e.g. `https://api.example.com/alerts/{{payload.event}}`).
- **Telemetry Event Bus**: Emits real-time lifecycle events (`execution:start`, `execution:step_start`, `execution:log`, `execution:finish`, `execution:error`).
- **Guaranteed Runner Reset**: Implemented with robust `try/finally` blocks ensuring the test runner bar never remains locked in a running state.

---

## 3. Storage & State Architecture

```
State Layer (Client-Side & Simulation)
├── pipelineStore  -> LocalStorage (dlicom_pipelines_v1)
├── executionStore -> LocalStorage (dlicom_execution_runs)
└── navigationContext -> History API + localStorage
```

1. **Local-First Manifests**: Pipeline graphs and execution records persist across page reloads in `localStorage`.
2. **Canonical Templates Protection**: Three canonical starter templates (`Smart Contract Event → Discord Alert`, `DEX Liquidity Sweep → Slack Notification`, `Cross-Chain State Sync`) are guaranteed immutable blueprints.
3. **Simulation Boundary**: External side effects, RPC queries, and webhook dispatches run in simulated mode with realistic latency and diagnostics, requiring zero live third-party write credentials.
