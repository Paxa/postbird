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

### C. Direct Cloud APIs (BYOK)
Standard API key support for individual developers:
* Anthropic, OpenAI, Google Gemini, Groq (for sub-second responses), Mistral.

### D. Local HTTP / OpenAI-Compatible Endpoint
Enables connecting to local servers or corporate gateways (LiteLLM, Ollama HTTP, vLLM, LocalAI) via `http://localhost:11434/v1`.

---

## 4. UI / UX Integration Points in Postbird

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
