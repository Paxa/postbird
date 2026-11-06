# Postbird Contributor & Agent Guide (`AGENTS.md`)

Welcome to **Postbird**! This document is the single source of truth for both human contributors and AI coding agents (Claude, Cursor, Antigravity, Copilot, etc.). It describes the project architecture, development workflows, coding conventions, testing suites, and critical pitfalls.

---

## 1. Project Overview & Mission

Postbird is an open-source, ultra-fast, cross-platform PostgreSQL GUI client. Originally built on Electron, Postbird has migrated to **Electrobun + Bun**, achieving:
* **Ultra-low RAM:** ~45MB idle memory footprint (compared to ~250MB+ on Electron).
* **Instant Startup:** Sub-80ms cold boot via native OS WebKit (macOS) / WebView2 (Windows) / WebKitGTK (Linux).
* **Compact Downloads:** Standalone release packages (~28MB macOS DMG).
* **Zero Bloat & High Privacy:** Pure client connection without mandatory cloud accounts, telemetry bloat, or background exfiltration.

---

## 2. Tech Stack

| Component | Technology | Notes |
| :--- | :--- | :--- |
| **Runtime & Package Manager** | **Bun** (v1.2+) | Fast JS/TS runtime, package manager, and test runner. Never use `npm` or `yarn`. |
| **Desktop Shell** | **Electrobun** (v2.0.4) | Native OS webviews driven by Bun. |
| **Language** | **TypeScript** | Strict mode, ambient types in `ts_libs/`. |
| **UI Rendering & DOM** | Native DOM + `lib/dom.ts` (jQuery is **deprecated**) | Fast DOM manipulation with modern standard APIs. jQuery (`$u` / `$`) is legacy and being phased out. |
| **Templating** | **Pug / Jade** | Source in `views/*.jade`, compiled to high-speed cached JS runtime in `views/cache.js`. |
| **Styling** | **SASS** (`assets/styles/`) | Compiled to `public/style.css` via Dart SASS. |
| **Database Driver** | `pg` (Node-Postgres) | Pooled and executed directly in the Bun host process (`electrobun/host/db_pool.ts`). |
| **Bundling** | `bun build` (`electrobun/bundle.ts`) | Single IIFE bundle at `public/postbird-bundle.js`. |
| **AI Integration** | `lib/local_ai/` | Headless CLI connectors (`agy`, `claude`, `fm`) and OpenAI-compatible endpoints. |

---

## 3. Architecture & Separation of Concerns

Postbird follows a strict two-tier architecture:

```
┌────────────────────────────────────────────────────────┐
│             Host Process (Native Bun)                  │
│  - electrobun/main.ts                                  │
│  - Window & lifecycle management (BrowserWindow)       │
│  - Native Application Menus (electrobun/host/menu.ts)  │
│  - PostgreSQL Connection Pool (host/db_pool.ts)        │
│  - SSH Tunnel Management (host/ssh_tunnel.ts)          │
│  - Native Process Spawning (host/process_runner.ts)    │
│  - AI Provider Discovery (lib/local_ai/discovery.ts)   │
└───────────────────────────▲────────────────────────────┘
                            │
              Electrobun Typed RPC Bridge
        (window.__postbirdRpc <-> postbirdRPC)
                            │
┌───────────────────────────▼────────────────────────────┐
│          Webview Process (WebKit / WebView2)           │
│  - index.html -> electrobun/view.ts & client.ts        │
│  - Native DOM (lib/dom.ts) + CodeMirror                │
│  - pug-runtime cached views (views/cache.js)           │
│  - Electron shims layer (electrobun/shims/*)           │
│  - App controllers, models, dialogs, and tabs          │
└────────────────────────────────────────────────────────┘
```

### A. Host Process (`electrobun/main.ts`)
* Runs directly on Bun (full OS access, network sockets, child processes).
* Manages database connection pools (`electrobun/host/db_pool.ts`) using the native `pg` driver.
* Manages SSH tunneling (`electrobun/host/ssh_tunnel.ts`) via `node-ssh-forward`.
* Executes system commands and bundled binaries (`pg_dump`, `pg_restore`) via `electrobun/host/process_runner.ts`.
* Exposes typed RPC methods to the webview via `BrowserView.defineRPC<PostbirdRPC>`.

### B. Webview / Renderer Process (`electrobun/view.ts`, `electrobun/client.ts`)
* Runs in the sandboxed OS webview. Loads `index.html`.
* Does **not** have direct Node.js or file-system access.
* Interacts with the host process exclusively via `window.__postbirdRpc`.
* Uses `electrobun/shims/` to intercept legacy Electron calls (`@electron/remote`, `electron`, `child_process`, `fs`, `pg`) and redirect them through RPC.

---

## 4. Codebase Navigation

```
postbird/
├── app/                     # Core application business logic
│   ├── components/          # Shared UI components (render_view, etc.)
│   ├── controllers/         # Feature controllers (export, import, updates)
│   ├── models/              # Database schema entities:
│   │   ├── server.ts        # Server, database, and connection management
│   │   ├── table.ts         # Table introspection, rows, alter table
│   │   ├── column.ts        # Columns and data types
│   │   ├── index.ts         # Index management and statistics
│   │   ├── monitor.ts       # Performance monitoring & health queries
│   │   ├── procedure.ts     # Stored procedures and functions
│   │   ├── trigger.ts       # Database triggers
│   │   └── user.ts          # Roles and user management
│   ├── views/               # UI controllers & pane handlers:
│   │   ├── db_screen_view.ts# Main database interface (sidebar + tabs)
│   │   ├── login_screen.ts  # Connection setup screen
│   │   ├── dialogs/         # Modal dialog handlers (new table, AI settings, etc.)
│   │   └── panes/           # Main tabs:
│   │       ├── content.ts   # Table rows viewer & inline editing
│   │       ├── structure.ts # Table structure, columns, indexes, constraints
│   │       ├── query.ts     # SQL editor with CodeMirror & execution plan
│   │       ├── monitoring.ts# Real-time server metrics, buffers, locks, queries
│   │       ├── info.ts      # Table size, row counts, physical file info
│   │       ├── procedures.ts# Function definitions & source editing
│   │       └── users.ts     # User & role administration
├── electrobun/              # Electrobun shell integration
│   ├── main.ts              # Host process entrypoint & RPC handlers
│   ├── view.ts              # Webview entrypoint script
│   ├── client.ts            # Client bootstrap polyfills & event wiring
│   ├── bundle.ts            # View compilation + SASS + Bun build script
│   ├── host/                # Host-side modules (db_pool, menu, storage, ssh)
│   ├── shims/               # Electron compatibility shims (fs, pg, child_process)
│   └── tests/               # Automated end-to-end UI test suites
├── lib/                     # Reusable utilities
│   ├── local_ai/            # In-app AI router, discovery, and CLI adapters
│   ├── sql_client.ts        # Webview SQL client interfacing with host pool
│   ├── csv_util.ts          # RFC 4180 CSV serializer / exporter
│   ├── context_menu.ts      # Context menu popup handler
│   └── alertify.ts          # In-app notifications
├── views/                   # Jade/Pug template definitions
│   ├── cache.js             # Precompiled template functions (committed to repo)
│   └── *.jade               # Template source files
├── assets/styles/           # SASS styling source
│   ├── style.scss           # Main style entrypoint
│   └── elements/            # Component and screen partials
├── tests/                   # Bun unit test suite (239+ tests)
└── bin/                     # Bundled pg_dump / pg_restore standalone binaries
```

---

## 5. Development Workflows & Essential Commands

### Prerequisites
* [Bun](https://bun.sh) v1.2+ installed (`bun --version`).
* Local PostgreSQL instance (for running unit & integration tests) on `localhost:5432`.

### Daily Commands

```bash
# 1. Install dependencies
bun install

# 2. Run in development mode (compiles views, styles, bundle, builds, and launches Electrobun)
bun start

# 3. Fast bundle step (views + styles + client JS)
bun run bundle

# 4. Compile Pug/Jade views only (required after modifying any .jade file!)
bun run compile:views

# 5. Compile SASS styles (or run watch mode)
bun run sass

# 6. Run all unit tests (sub-3s execution via Bun test runner)
bun test

# 7. Run automated UI integration tests
bun run test:ui

# 8. Typecheck code
bun check

# 9. Build standalone production distribution package
bun run dist
# Artifacts will be located in artifacts/ (DMG on macOS, AppImage/deb/rpm on Linux, zip on Windows)
```

---

## 6. Testing Guide

Postbird features two test layers:

### A. Fast Unit Tests (`tests/*_test.ts`)
Run via `bun test`:
* Fast mock environment configured via `tests/test_helper.ts` (using `happy-dom`, local storage polyfill, and mock jQuery `$u`).
* Direct PostgreSQL testing using the database `postbird_test` on `localhost:5432`.
* Before each test suite, `cleanupSchema()` drops and recreates schema `public` to ensure total isolation.
* Environment overrides:
  * `PG_USER` (defaults to current system user)
  * `PG_PASSWORD` (defaults to empty)
  * `PG_PORT` (defaults to `5432`)

### B. Automated UI Integration Tests (`electrobun/tests/`)
Run via `bun run test:ui`:
* Launches the Electrobun app with `POSTBIRD_TEST_UI=true`.
* Tests real DOM interactions, tabs, modals, menus, monitoring screens, and database query executions end-to-end.

---

## 7. UI & Templating Conventions

### A. Jade / Pug Views & Template Cache
* Views are authored in `views/*.jade`.
* Postbird does **not** compile Pug templates on the fly in production because the compiler is heavy. Instead, `scripts/compile_views.ts` precompiles templates into `views/cache.js`.
* **Critical Rule:** When editing any `.jade` file, you **must** run `bun run compile:views` or `bun run bundle` to update `views/cache.js`.

### B. Declarative Click Handlers (`exec`)
* Templates use the `exec` attribute for event dispatching:
  ```jade
  a.btn(exec="openTable(tableName)") Open Table
  ```
* Handled by `PaneBase.prototype.executeHandler`. The handler method on the active pane or view is automatically invoked with parsed arguments.

### C. Native DOM Conventions (jQuery is Deprecated)
* **jQuery is Deprecated:** jQuery (`$`, `$u`) is legacy and in the process of being phased out. Do not write new code using jQuery or add new `$u(...)` wrappers.
* **Use Native DOM & `lib/dom.ts`:**
  * Use standard browser DOM methods (`querySelector`, `querySelectorAll`, `addEventListener`, `classList`).
  * Use the lightweight utilities in `lib/dom.ts`:
    * `$<T>(selector, parent?)`: Fast single-element query (`parent.querySelector`).
    * `$$<T>(selector, parent?)`: Array of matching elements (`parent.querySelectorAll`).
    * `htmlToElement<T>(html)` & `htmlToElements(html)`: Parse HTML strings via `<template>`.
    * `formValues(form)`: Extract form inputs into key-value pairs without jQuery's `serializeArray`.
    * `stopEvent(event)`: Standardized `preventDefault()` and `stopPropagation()`.
* **Attributes vs Classes:** Prefer CSS classes for styling only; use HTML data/semantic attributes (`table-name`, `column-name`, `action`) for JavaScript selectors and state tracking.

---

## 8. Database Architecture & Safety Rules

1. **Host-Side Connection Pooling**:
   * All database queries run through `electrobun/host/db_pool.ts` in the Bun host process.
   * Never attempt to open raw TCP sockets from the webview.
2. **Safe SQL Identifiers & Literals**:
   * Always escape user-provided table names, schemas, and column names using `node-pg-escape` or double-quoted identifiers.
3. **PostgreSQL Version Support**:
   * Postbird supports PostgreSQL 10 through 18.2+.
   * Always check version flags before using modern PG features (e.g., `has_schema_support`, `server.version`).

---

## 9. AI Integration Architecture

Postbird includes two AI initiatives:

### A. In-App Intelligence (`AI_IN_POSTBIRD.md` & `lib/local_ai/`)
* **Zero-Exfiltration Privacy**: Only database schema metadata, table structures, and column comments are passed to models. Live row data is **never** sent without explicit opt-in.
* **Auto-Discovery (`lib/local_ai/discovery.ts`)**: Automatically detects local AI tools on the user's system without requiring manual API keys:
  * `agy`: Antigravity CLI (Google/Gemini headless runner)
  * `claude`: Claude Code CLI
  * `fm`: Apple Foundation Models (macOS native)
  * Local HTTP / OpenAI-compatible endpoints (`http://localhost:11434/v1` for Ollama, vLLM, etc.)

### B. Postbird as an MCP Server (`POSTBIRD_IN_AI.md`)
* Exposes Postbird connection profiles and schema introspection to external AI IDEs (Cursor, Claude Desktop, Antigravity, Zed).
* Eliminates plaintext database credentials in external config files by leveraging Postbird's encrypted saved connections and SSH tunnels.

---

## 10. Rules of the Road for Contributors & Agents

1. **Use Bun Exclusively**:
   * Do not run `npm`, `npx`, `yarn`, or `node`.
   * For package management, use `bun add` or `bun remove`.
   * For tests, use `bun test`.
   * For typechecks, use `bun check`.
2. **Always Recompile Views and Styles**:
   * Modifying `.jade` files requires running `bun run compile:views` (or `bun run bundle`).
   * Modifying `.scss` files requires `bun run sass` or `bun run bundle`.
3. **Do Not Break Electrobun RPC**:
   * New host capabilities must be added to `PostbirdRPC` in `electrobun/host/types.ts` and registered in `electrobun/main.ts`.
4. **jQuery is Deprecated (Use Native DOM)**:
   * Do not author new jQuery code or rely on `$u(...)`. Use standard native DOM APIs or `lib/dom.ts` helpers.
   * When refactoring existing components, actively replace jQuery methods with native equivalents.
5. **Preserve Low Memory Footprint**:
   * Avoid introducing heavy client-side JavaScript libraries. Rely on native DOM, existing lightweight utilities, and clean TypeScript.
6. **Keep Tests Green**:
   * Ensure `bun test tests/` passes before submitting pull requests.
