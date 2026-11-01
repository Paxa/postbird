# Postbird in AI: Exposing Postbird as an MCP Server

This document outlines the architecture, use cases, and specifications for running **Postbird as an MCP (Model Context Protocol) Server**, allowing external AI agents (Claude Desktop, Cursor, Claude Code, Zed, Antigravity) to safely interact with PostgreSQL databases through Postbird.

---

## 1. The Value Proposition: Why Postbird as an MCP Server?

While standalone PostgreSQL MCP servers exist, they suffer from significant usability and security problems:
* **Plaintext Credentials in JSON Files**: Standard MCP setups require putting raw database connection URIs with plaintext passwords in configuration files (`claude_desktop_config.json`).
* **Complex Network Topologies**: Databases in staging or production are frequently behind SSH bastion hosts, VPNs, SSL client certificates, or Docker networks. Configuring a standalone script for these is brittle and tedious.
* **The Postbird Advantage**: 
  * Postbird **already stores and manages** all connection profiles, encrypted passwords, SSH tunnels, and SSL certificates.
  * AI agents can simply leverage Postbird's active connection or select a saved connection profile by name without ever handling raw secrets.

---

## 2. High-Impact Use Cases

### A. Context-Aware Backend Development in Coding IDEs
* **The Workflow**: While working in Cursor, Claude Code, Zed, or Antigravity, a developer instructs the AI:
  > *"Create a new billing endpoint in TypeScript that charges users and records an invoice. Match the exact column names, constraints, and enums from our active database."*
* **How MCP Solves It**:
  1. The agent calls Postbird's `get_schema(table: "invoices")` and `get_foreign_keys(...)`.
  2. The agent receives live database schema definitions, foreign key constraints, and column comments.
  3. The agent generates 100% accurate ORM models (Prisma, Drizzle, TypeORM, ActiveRecord) and queries with zero hallucinated column names.

### B. Safe Schema Migrations with "Open in Postbird" (Human-in-the-Loop)
* **The Problem**: Giving an autonomous AI agent permission to execute `ALTER TABLE`, `DROP COLUMN`, or `CREATE INDEX` directly on live databases is dangerous.
* **The Postbird Solution**:
  1. The agent designs the migration SQL.
  2. Instead of executing the statement directly, the agent calls `open_query_in_gui(sql: "ALTER TABLE...")`.
  3. Postbird activates, opens a new tab in the desktop application, and populates the query editor.
  4. The developer inspects the highlighted SQL, reviews the execution plan, and executes it manually.

### C. Live Incident Triage & Interactive DBA in AI Chat
* **The Workflow**: During an application outage or performance slowdown, an engineer asks Claude or their terminal agent:
  > *"Our API responses are spiking to 15 seconds. Check Postbird to see what's happening on the database right now."*
* **How MCP Solves It**:
  1. The agent invokes `get_active_queries()` to scan `pg_stat_activity` for long-running transactions and locks.
  2. The agent identifies a lock contention:
     *"PID 20491 has been holding an ExclusiveLock on `users` for 6 minutes, blocking 15 subsequent queries."*
  3. The engineer asks to terminate it, and the agent calls `cancel_query(pid: 20491)`.

### D. Natural Language Business Analytics & Charting (Claude Desktop)
* **The Workflow**: A product manager or analyst uses Claude Desktop:
  > *"Using my Postbird staging connection, calculate our week-over-week user retention for the past 8 weeks and graph the trend."*
* **How MCP Solves It**:
  1. Claude inspects available tables via `list_tables()`.
  2. Claude executes read-only aggregation queries via `read_query(sql)`.
  3. Claude visualizes the resulting data directly in the Claude Desktop chat interface.

### E. Automated Test Data & Factory Generation
* **The Workflow**:
  > *"Inspect the `orders` and `order_items` tables via Postbird and write a FactoryBot/Faker generator for our test suite."*
* **How MCP Solves It**:
  1. The agent reads column types, `NOT NULL` constraints, foreign keys, and default values via Postbird.
  2. The agent generates comprehensive test factories that satisfy all relational constraints on the first try.

---

## 3. Proposed MCP Tool Specification

The Postbird MCP server exposes a focused set of safe, high-utility tools:

| Tool Name | Parameters | Description | Safety Level |
| :--- | :--- | :--- | :--- |
| `list_connections` | None | Lists saved Postbird connection profiles (names and hosts only, no credentials). | Read-only |
| `use_connection` | `connection_name: string` | Switches active database session to the specified profile. | Safe |
| `get_active_connection` | None | Returns information about currently active connection (database, host, PG version). | Read-only |
| `list_tables` | `schema?: string` | Lists all tables, views, and materialized views. | Read-only |
| `get_schema` | `table: string, schema?: string` | Returns column names, data types, nullability, defaults, primary keys, and comments. | Read-only |
| `get_foreign_keys` | `table?: string` | Returns incoming and outgoing foreign key relationships. | Read-only |
| `read_query` | `sql: string, limit?: number` | Executes read-only queries (`SELECT`, `EXPLAIN`). Rejects DDL and mutating DML. | Read-only (Guarded) |
| `explain_query` | `sql: string, analyze?: boolean` | Returns execution plan in JSON or text format. | Read-only |
| `get_db_health` | None | Fetches summary metrics: cache hit ratio, dead tuple percentages, missing index candidates. | Read-only |
| `open_query_in_gui` | `sql: string, title?: string` | Opens a new query tab in Postbird Desktop populated with the query for human review. | Safe (Desktop GUI) |

---

## 4. Implementation Options in Electrobun & Bun

Postbird's architecture makes MCP implementation straightforward:

### Option 1: Stdio Server Mode (`postbird --mcp`)
* A lightweight entry point in Bun that communicates over standard input/output (`stdin`/`stdout`) using the JSON-RPC Model Context Protocol specification.
* Configured in Claude Desktop or Cursor:
  ```json
  {
    "mcpServers": {
      "postbird": {
        "command": "postbird",
        "args": ["--mcp"]
      }
    }
  }
  ```

### Option 2: Local HTTP / SSE Server Mode (Running alongside Desktop App)
* When Postbird Desktop launches, it can optionally start a lightweight localhost HTTP/SSE server (e.g. `http://127.0.0.1:45832/mcp`).
* External tools connect over Server-Sent Events (SSE).
* Allows seamless communication between the running Postbird GUI window and external agents, enabling tools like `open_query_in_gui` to interact directly with the active UI session.
