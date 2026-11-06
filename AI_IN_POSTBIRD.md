# AI in Postbird: In-App Intelligence Architecture & Use Cases

This document outlines high-impact use cases, architecture, and provider strategies for integrating AI capabilities directly into **Postbird** while preserving its core philosophy: **ultra-fast startup, low memory footprint, privacy, and simplicity**.

---

## 1. Core Principles

1. **Privacy & Zero Data Exfiltration**: Only database schema metadata (table names, column types, foreign keys, constraints, and descriptions) is sent to models by default. Row data and PII are never sent without explicit user opt-in.
2. **Speed & Lightweight Footprint**: Leverages native Bun process spawning (`Bun.spawn`) and streaming responses. No heavy client-side AI bundles.
3. **No Lock-in (Local + Corporate + Cloud)**: Works seamlessly with personal API keys, local offline models (Ollama), or corporate subscription tools (`agy`, `claude` CLI, Google ADC) without needing raw API keys.

---

## 2. High-Value Use Cases

### A. Context-Aware Text-to-SQL (`Cmd+K` in Query Tab)
* **Natural Language Queries**: Write prompts like *"Find users registered in the last 30 days who spent over \$100 but never requested a refund"*.
* **Schema-Informed Generation**: Postbird injects active table definitions, column types, foreign keys, and comments into the context window, yielding dialect-exact PostgreSQL queries (handling CTEs, window functions, and `jsonb` syntax accurately).
* **Streaming Editor Output**: Streams SQL directly into the editor with syntax highlighting.

### B. Instant Query Error Diagnosis & Auto-Fix
* **Contextual "Explain & Fix"**: When PostgreSQL returns an error (e.g. `column must appear in the GROUP BY clause`, `operator does not exist: jsonb = text`, `foreign key constraint violation`), a single click sends the query and the exact error to the model.
* **One-Click Diff / Patch**: Postbird displays the explanation and a diff view, allowing the user to accept the corrected SQL with one click.

### C. Relationship Diagrams & Schema Visualization
* **Neighborhood / Focused ERD View**: Instead of a chaotic 200-table spiderweb, Postbird renders the selected table and its immediate 1-hop or 2-hop foreign key relationships.
* **Auto-Join Query Generation**: Selecting two related tables in the diagram lets the user click **"Generate JOIN Query"** to populate the Query tab with valid join paths.
* **Exportable Specifications**: 1-click export of the schema graph as **Mermaid.js ERD** or **DBML** for project documentation and pull request descriptions.
* **AI Schema Pathfinding**: Ask *"How are `payments` and `warehouses` connected?"* to highlight the join route across intermediate bridge tables.

### D. Deep Metadata & Data Dictionary (PostgreSQL Native Comments)
* **Native DDL Integration**: PostgreSQL natively supports comments via `COMMENT ON TABLE` and `COMMENT ON COLUMN`, stored in `pg_catalog.pg_description`.
* **Solving the Enum/Varchar Ambiguity**:
  * Unannotated: `status VARCHAR(32)` $\rightarrow$ AI hallucinates `'active'` vs `'enabled'`.
  * Annotated: `COMMENT ON COLUMN orders.status IS 'Allowed: draft, pending_payment, processing, shipped, cancelled'` $\rightarrow$ AI generates 100% accurate filters.
* **In-App Comment Editor**: Add a "Comments" column to the Structure tab with inline editing that issues `COMMENT ON ...` statements.
* **"AI Auto-Document Table"**: One-click feature where AI samples distinct column values (`SELECT DISTINCT ... LIMIT 20`) and drafts schema documentation for review and commit to PostgreSQL.

### E. `EXPLAIN (ANALYZE, BUFFERS)` Visual Advisor
* **Bottleneck Identification**: Interprets dense `EXPLAIN` execution plans (JSON/text) to highlight expensive Sequential Scans, nested loops, and memory spills.
* **Actionable Indexing Advice**: Identifies missing indexes and drafts safe DDL:
  ```sql
  CREATE INDEX CONCURRENTLY idx_orders_customer_created ON orders (customer_id, created_at DESC);
  ```
* **Stale Statistics Detection**: Flags wide gaps between estimated and actual row counts and suggests `ANALYZE table_name;`.

### F. "DB Doctor" — Health Check & Performance Tuning via Standard Connection
Postbird can run lightweight introspection queries over standard client connections without requiring server-level agents:

1. **Missing Index Detection** (`pg_stat_user_tables`):
   * Identifies large tables (>10k rows) with high `seq_scan` to `idx_scan` ratios and millions of `seq_tup_read`.
2. **Unused / Zombie Indexes** (`pg_stat_user_indexes`):
   * Finds indexes with `idx_scan = 0` (excluding primary/unique keys) that waste disk space and slow down writes.
3. **Configuration Audit** (`pg_settings`):
   * Audits parameters like `random_page_cost` (flagging default `4.0` HDD values on modern SSDs/NVMe), `shared_buffers`, `work_mem`, and `checkpoint_completion_target`.
4. **Disk Spill Detection** (`pg_stat_database`):
   * Monitors `temp_files` and `temp_bytes` to detect when `work_mem` is undersized for sorting and hashing.
5. **Buffer Cache Hit Ratio** (`pg_statio_user_tables`):
   * Verifies if the hit ratio is $\ge 99\%$ or if database memory needs scaling.
6. **Table Bloat & Dead Tuples**:
   * Detects tables where `n_dead_tup` is high and autovacuum is falling behind.

### G. Synthetic Seed Data Generator
* In the Table Content tab, generate realistic mock datasets adhering to column constraints, foreign keys, unique rules, and realistic faker distributions (e.g., valid addresses, names, and JSON structures).

---

## 3. Provider Architecture: Supporting Corporate & Local Users

Many corporate developers have access to AI via office subscriptions (Gemini Advanced, Claude Desktop, GitHub Copilot) without personal API keys. Postbird supports multiple provider backends:

### A. The `agy` CLI Integration (Antigravity CLI)
`agy` is pre-authenticated on machines using Google/Gemini subscriptions and provides access to Gemini, Claude, and GPT models headlessly.

* **Non-Interactive Execution**:
  ```bash
  agy -p "Write SQL query to find..." --disable-slash-commands --output-format text
  ```
* **Strict JSON Output**:
  Pass `--json-schema` to enforce typed responses without markdown wrappers:
  ```bash
  agy -p "..." --json-schema '{"type":"object","properties":{"sql":{"type":"string"}}}'
  ```
* **Model Switching**: Support fast models (`gemini-3.8-flash-medium`) for autocomplete and deep reasoning models (`claude-sonnet-5-5-medium`, `gemini-4-argon-high`) for database tuning.
* **Zero Configuration**: If `agy` is in the user's `$PATH`, AI works out of the box with zero key setup.

### B. Generic CLI Runner (`Bun.spawn`)
Allows users to route prompts through local terminal tools that use existing SSO/browser logins:
* `claude -p "{prompt}"` (Claude Code CLI)
* `gh copilot suggest "{prompt}"` (GitHub Copilot CLI)
* `ollama run qwen2.5-coder "{prompt}"` (Offline local models)
* Custom internal corporate scripts (`corp-ai "{prompt}"`)

### C. Direct Cloud APIs & Free-Tier Cloud Endpoints (BYOK)
Standard API key support for individual developers:
* **Google AI Studio (Gemini Free Tier)**:
  * Built-in preset using Google's official OpenAI-compatible endpoint (`https://generativelanguage.googleapis.com/v1beta/openai`).
  * Free API keys from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (no billing required) provide access to `gemini-3.8-flash`, `gemini-3.8-flash-lite`, `gemini-3.8-pro`, and `gemini-3-flash`.
  * **Zero-Config Env Detection**: If `GEMINI_API_KEY` or `GOOGLE_API_KEY` is exported in the user's environment, Postbird auto-detects and activates `Google AI Studio (Gemini Free Tier)` automatically.
* **Groq Cloud (Fast LPU Inference)**: Built-in preset (`https://api.groq.com/openai/v1`) for sub-second responses.
* **Custom OpenAI-Compatible Endpoints**: OpenAI, Anthropic (via proxy), OpenRouter, Mistral, or corporate gateways.

### D. Local HTTP / OpenAI-Compatible Endpoint
Enables connecting to local servers or corporate gateways (LiteLLM, Ollama HTTP, vLLM, LocalAI, `apfel --serve`, `fm serve`) via `http://localhost:11434/v1`.

### E. Apple Foundation Models (`fm` CLI in macOS 27 & `apfel`)
macOS 27 includes `/usr/bin/fm` for Apple's on-device ~3B model (`system`). See [`lib/local_ai/README.md`](./lib/local_ai/README.md) for the full technical specification:
* **Context Window**: **4,096 tokens** on M1/M2 Macs (and macOS 26), **8,192 tokens** on M3+ Macs with 12 GB+ RAM on macOS 27 (`AFM 3 Core Advanced`).
* **Availability & Licensing**: Requires one-time `sudo fm license` acceptance (exits with code `69` otherwise) and model readiness verified via `fm available` (exits with code `1` / `modelNotReady` if Apple Intelligence weights are missing).
* **Guardrails**: Uses `--guardrails permissive-content-transformations` to prevent false-positive refusals on financial/medical database column names.
* **Tool Calling & MCP**: Native `/usr/bin/fm` only supports `--tool barcode` and `--tool ocr` (no MCP). Projects like [`Arthur-Ficial/apfel`](https://github.com/Arthur-Ficial/apfel) bridge `FoundationModels` to MCP by converting tool schemas into `DynamicGenerationSchema` / system-prompt instructions, parsing JSON tool calls post-hoc (`detectToolCall()`), and feeding tool outputs back as `role: "user"` turns.

---

## 4. On-Demand Schema & Data Inspection Protocol

For databases with many tables or remote connections, fetching the entire schema upfront wastes thousands of input tokens and overflows small on-device context windows (`fm`'s 4k/8k limit). Postbird uses a **two-stage on-demand protocol** that works across every CLI and HTTP provider without requiring MCP:

1. **Lightweight Initial Context**: Sends only the database name, active schema name, the **list of table names** in the current schema, and the **column structure of the currently selected table** (`this.handler.currentTable`).
2. **On-Demand Structure Fetching (`sql:inspect_schema`)**: When the AI needs column types or foreign keys for other tables from the table list, it emits a ` ```sql:inspect_schema ` block with the table names. Postbird automatically queries `information_schema.columns` for those specific tables and feeds their structure back in the next turn.
3. **On-Demand Read-Only SQL (`sql:execute`)**: Allows the AI to run read-only `SELECT` / `EXPLAIN` queries to inspect data distributions or verify hypotheses during complex analysis.

---

## 5. UI / UX Integration Points in Postbird

1. **Query Tab**:
   * Floating `Cmd+K` prompt bar.
   * "Explain with AI" button on execution error banners.
2. **Table Structure Tab**:
   * "Comments" column with inline editing (`COMMENT ON COLUMN`).
   * "AI Generate Documentation" action button.
   * "Relations" sub-tab showing focused neighborhood diagrams.
3. **Table Content Tab**:
   * "Generate Mock Data" button.
4. **Database Menu / Diagnostics Tab**:
   * "DB Doctor / Health Check" generating actionable tuning and indexing recommendations with copy-paste SQL fixes.
