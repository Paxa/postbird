# Postbird Local AI Connector (`lib/local_ai/`)

A zero-dependency, extraction-ready AI routing and discovery library for **Postbird**. It bridges local CLI agents (`agy`, `claude`, `/usr/bin/fm`, `codex`, `gemini`, `cursor-agent`) and OpenAI-compatible HTTP servers (`Google AI Studio Free Tier`, `Ollama`, `Groq`, `Foundry Local`, `apfel --serve`, `vLLM`) with unified streaming, logging, and on-demand database schema inspection.

---

## 1. Apple Foundation Models (`fm`) in macOS 27 — Technical Reference

macOS 27 ships Apple's built-in command-line interface for Apple Intelligence at `/usr/bin/fm` (introduced at WWDC26 Session 334: *"Build AI-powered scripts with the fm CLI and Python SDK"*). It wraps `FoundationModels.framework` (`SystemLanguageModel`) directly.

### A. Model & Hardware Specifications

| Property | Specification |
| :--- | :--- |
| **Binary Path** | `/usr/bin/fm` (3.4 MB universal `arm64e` / `x86_64` Apple platform binary; requires Apple Silicon at runtime) |
| **Model Identifier** | `system` (Apple On-Device Foundation Model, ~3B parameters) |
| **Context Window (M1 / M2 Macs & macOS 26)** | **4,096 tokens** combined (`input_tokens + output_tokens`) — AFM 3 Core model. Empirically accepts up to ~3,988 prompt tokens before returning `"The session's transcript exceeded the model's context size"`. |
| **Context Window (M3 / M4+ Macs with 12 GB+ RAM on macOS 27)** | **8,192 tokens** combined — AFM 3 Core Advanced model. |
| **Chat Template Framing Overhead** | ~46 extra prompt tokens added by Apple's chat template runtime on macOS 27. |
| **Embeddings** | Not supported on-device. |
| **Real-Time / Clock Awareness** | None (100% offline). Current date/time must be injected via `-i` if needed. |

### B. Setup, Licensing & Readiness Checks

1. **Machine-Wide License Agreement (`fm license`)**:
   - First-time execution is gated by the Apple Foundation Models CLI Legal Notice & Terms.
   - If not agreed, any `fm` command (except `fm license`) exits with **code `69`** (`EX_UNAVAILABLE`).
   - Check status:
     ```bash
     fm license --status
     # Output when agreed: "Agreed to license FM1 version 1.0 on ..." (exit 0)
     ```
   - Accept license (requires `sudo` as it applies machine-wide):
     ```bash
     sudo fm license
     ```

2. **Model Asset Availability (`fm available`)**:
   - Even after accepting the license, the on-device Apple Intelligence model weights may not be downloaded or may have been removed.
   - Check model readiness:
     ```bash
     fm available
     # Ready (exit 0): "System model available"
     # Missing/Removed (exit 1): "System model unavailable: modelNotReady"
     ```
   - **Important for Discovery**: Postbird's [`discoverProviders()`](./discovery.ts) checks **both** `fm license --status` and `fm available` before marking `fm` as `ready`.

### C. Subcommands & Flags (`/usr/bin/fm`)

| Subcommand | Key Flags | Description |
| :--- | :--- | :--- |
| `fm respond` | `-i, --instructions <text>`<br>`--text <text>`<br>`--schema <file_or_json>`<br>`--image <path>` / `--label <name>`<br>`--tool <barcode\|ocr>`<br>`--resume <file>`<br>`--save-transcript <file>`<br>`--[no-]stream`<br>`-g, --greedy`<br>`--use-case <general\|content-tagging>`<br>`--guardrails <default\|permissive-content-transformations>` | Generates a single-turn or resumed-transcript response. Streams by default (`--stream`); pass `--no-stream` for buffered output. |
| `fm chat` | `-i, --instructions <text>`<br>`-r, --resume <session>`<br>`--continue`<br>`--set-default-model <model>`<br>`--tool <barcode\|ocr>` | Interactive terminal REPL. Saves sessions in `~/.fm/sessions/`. |
| `fm count-tokens` | `-i, --instructions <text>`<br>`--text <text>`<br>`--image <path>`<br>`--transcript <file>`<br>`-q, --quiet` | Returns exact token count using `SystemLanguageModel.tokenCount(for:)`. `-q` outputs a bare integer. |
| `fm schema object` | `--name <Name>` (required)<br>`--string`, `--integer`, `--double`, `--boolean`, `--object`, `--anyOf`<br>Modifiers: `--array`, `--optional`, `--description <text>` | Builds a valid JSON Schema for `--schema` guided generation. Supports dot notation (`address.street`) for nested objects. |
| `fm serve` | `--host <host>`<br>`--port <port>`<br>`--socket <unix_socket_path>` | Starts a local HTTP / Unix-socket server exposing `GET /health`, `GET /v1/models`, and `POST /v1/chat/completions`. |
| `fm available` | `-m, --model <system>` | Checks if the on-device model is ready on disk. |
| `fm license` | `--status`, `--show` | Reviews or checks machine-wide license acceptance. |

### D. Native `fm` Limitations & Guardrails

1. **No Native MCP or Custom Tool Calling in `fm`**:
   - `fm respond` and `fm chat` only accept `--tool barcode` and `--tool ocr`.
   - `fm serve` (`POST /v1/chat/completions`) accepts a `tools` array without error, **but does not execute or structure tool calls** — instead, it leaks raw model template tokens (e.g. `<start_of_turn>model\n{...}`) into `content` with `finish_reason: "stop"`.
   - `fm serve` also streams SSE (`text/event-stream`) by default when `stream` is omitted, and ignores `max_tokens`.
2. **Safety Guardrail False Positives**:
   - Default guardrails frequently block benign prompts mentioning financial terms (e.g., `"stock price"`), medical terms, or certain database column names.
   - **Fix**: Postbird's [`FmAdapter`](./adapters/fm.ts) passes `--guardrails permissive-content-transformations`, which maps to Apple's `.permissiveContentTransformations` guardrail mode and significantly reduces false positives.

---

## 2. How `apfel` (`Arthur-Ficial/apfel`) Connects `FoundationModels` to MCP

The open-source project [**apfel**](https://github.com/Arthur-Ficial/apfel) wraps the exact same `FoundationModels.framework` (`SystemLanguageModel`) in Swift, but adds a full **MCP Client + Out-of-Band Tool Execution Loop** (`apfel --mcp ./server.py` or `apfel --serve --mcp ...`):

```
MCP Server (stdio / HTTP)
       │  tools/list (JSON Schema)
       ▼
apfel SchemaConverter.convert()
  ├──► Native Path: FoundationModels DynamicGenerationSchema + Transcript.ToolDefinition
  └──► Fallback Path: Injects tool definitions into System Prompt as text instructions
       │
       ▼
FoundationModels LanguageModelSession / Transcript API
       │  Model outputs JSON (often inside ```json ... ``` fences)
       ▼
ToolCallHandler.detectToolCall()
  1. Direct JSON.parse()
  2. Strip ```json ... ``` markdown fences
  3. Extract {"tool_calls": [...]} substring
       │
       ▼
apfel invokes MCP `tools/call` ──► Appends result + user turn to Transcript ──► Next Model Turn
```

### Key Empirical Findings from `apfel` on Apple's 3B Model:
1. **System-Prompt Tool Simulation Works 100%**:
   In CLI mode without native tool registration, instructing the 3B model via the system prompt to emit a structured block (e.g., JSON or fenced code block) when it needs external information succeeds reliably across runs.
2. **Keep Tool Schemas Simple**:
   The ~3B model handles **one tool call at a time** with simple string parameters (e.g. table names or a single SQL query) at 100% reliability, whereas complex nested schemas or parallel tool calls cause parameter hallucinations (~20–50% of calls add extra fields).
3. **Transcript Role Rule**:
   Apple's `FoundationModels` runtime requires the last message in a multi-turn conversation to have `role: "user"` (ending with `role: "tool"` or `role: "assistant"` throws an error).

---

## 3. Postbird's On-Demand Schema & Query Execution Architecture

Dumping an entire database's DDL (`information_schema.columns` for all tables) into every prompt has major drawbacks:
- **Context Overflow**: A database with 50–200 tables easily consumes 5,000–20,000 tokens, immediately crashing `fm` (4,096 / 8,192 token ceiling) and wasting cloud input tokens.
- **Latency on Remote Databases**: Fetching thousands of column definitions and constraints over an SSH tunnel before sending a simple prompt adds unnecessary delay.

### How Postbird Solves This (Two-Stage On-Demand Protocol)

#### Stage 1: Lightweight Initial Context (~100–250 tokens)
Every prompt sent from Postbird includes a compact initial context generated by `Query.getDatabaseContext()`:
1. **Database & Active Schema Name** (e.g. `Database: "production", Schema: "public"`).
2. **Table Names List Only**: A comma-separated list of table names in the current schema (`Tables in "public": users, orders, order_items, products, invoices, ...`).
3. **Currently Selected Table's Full Columns**: If the user has a table selected in the sidebar (`this.handler.currentTable`), its column names and types are included upfront because users frequently refer to the active table (`"filter active rows"`, `"group by status"`).

#### Stage 2: On-Demand Structure & Data Fetching (Universal Across All CLIs)
Because this protocol uses fenced markdown blocks in the model's response, it works identically with **`fm`**, **`claude`**, **`agy`**, **`groq`**, and **`ollama`** without requiring MCP or a local HTTP server:

1. **On-Demand Table Structure (`sql:inspect_schema`)**:
   - If the user's prompt references tables whose columns are not yet in context, the model outputs:
     ````markdown
     ```sql:inspect_schema
     orders, order_items
     ```
     ````
   - Postbird intercepts this block, queries `information_schema.columns` (and foreign keys) **only** for `orders` and `order_items`, displays a compact `🔍 Inspected schema: orders, order_items` badge in the chat UI, appends the schema as a `role: "user"` follow-up message, and automatically triggers the next generation turn.

2. **On-Demand Read-Only SQL Execution (`sql:execute`)**:
   - When the model needs to inspect live data distributions, distinct enum values, or row counts to answer a question or perform analysis, it outputs:
     ````markdown
     ```sql:execute
     SELECT status, COUNT(*) FROM orders GROUP BY status;
     ```
     ````
   - Postbird validates that the query is strictly read-only (`SELECT`, `EXPLAIN`, `SHOW`, `WITH`), executes it against PostgreSQL (automatically if *"Auto-run read-only SELECTs"* is checked, or via a 1-click button), and feeds the result rows back to the model for the next turn.

3. **Staged Remediation Queries (`sql:stage`)**:
   - Any mutating query (`DELETE`, `UPDATE`, `ALTER`, `CREATE INDEX`) is never auto-executed; it is rendered in a staged box with a **"Stage in SQL Editor"** button for human review.

---

## 4. Google AI Studio (Gemini Free Tier) Support

Google AI Studio offers a generous **Free Tier** (no credit card required) with an official **OpenAI-compatible REST & SSE streaming endpoint** that works directly with [`OpenAICompatibleAdapter`](./adapters/openai_compatible.ts):

| Property | Value |
| :--- | :--- |
| **Base URL** | `https://generativelanguage.googleapis.com/v1beta/openai` |
| **Get Free API Key** | [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **Env Auto-Discovery** | `GEMINI_API_KEY` or `GOOGLE_API_KEY` (automatically marks `google-ai-studio` as `ready` in "Detected on This System") |
| **Built-In UI Preset** | **Google AI Studio (Gemini Free Tier)** in *AI Connection Settings -> Cloud & Custom Endpoints* |
| **Recommended Free Models** | `gemini-3.8-flash` (default — 1M context, fast reasoning)<br>`gemini-3.8-flash-lite` (highest free-tier RPM / RPD)<br>`gemini-3.8-pro` (deep SQL & query plan reasoning)<br>`gemini-3-flash` |
| **Why On-Demand Schema Matters** | Free tier enforces RPM (5–15 RPM) and TPM (250k TPM) limits. Postbird's lightweight initial context (~150 tokens) + `sql:inspect_schema` keeps token consumption minimal so users never hit TPM throttling on large schemas. |

---

## 5. Logging & Evaluation

- **Log File**: All prompts, CLI arguments, stream timings, and errors are logged to `.postbird-ai.log` in the project root (with automatic 2 MB rotation).
- **Dev Stdout**: When `NODE_ENV !== 'production'`, all AI events are mirrored to `stdout` / `stderr` with `[AI INFO]` / `[AI ERROR]` prefixes.
- **Evaluation Runner**:
  ```bash
  bun scripts/evaluate_ai.ts
  bun scripts/evaluate_ai.ts --provider=agy
  bun scripts/evaluate_ai.ts --provider=fm
  ```
