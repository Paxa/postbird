# Postbird — Claude Code Guide

See @AGENTS.md for the full architecture, codebase map, design decisions, and contributor guide.

## Quick Reference

- **Runtime & Tooling:** Use **Bun exclusively** (`bun install`, `bun check`, `bun test tests/`, `bun run bundle`, `bun start`). Never use `npm`, `npx`, `yarn`, or `node`.
- **Two-Tier Architecture:**
  - **Host (`electrobun/main.ts`, `electrobun/host/*`):** Runs on Bun with OS/network access. Manages DB pools via Bun's native `SQL` (`lib/sql_client.ts` + `electrobun/host/db_pool.ts`), SSH tunnels, `pg_dump`/`pg_restore`, and storage.
  - **Webview (`app/*`, `electrobun/client.ts`):** Runs in OS WebKit/WebView2 with no Node/FS/socket access. Talks to host strictly via `window.__postbirdRpc` (`PostbirdRPC` in `electrobun/host/types.ts`). Do not add new `electrobun/shims/*` workarounds—add typed RPC methods instead.
- **Templates & Styles:** Editing `views/**/*.jade` requires `bun run compile:views` (or `bun run bundle`) to update `views/cache.js`. Editing `assets/styles/**/*.scss` requires `bun run bundle` (or `bun run sass`).
- **DOM & UI:** jQuery (`$u`) is deprecated—use native DOM APIs and `lib/dom.ts` (`$`, `$$`, `dom`, `formValues`, `stopEvent`). Templates use `exec="method(args)"` for click dispatch and attributes (not CSS classes) for JS hooks/state.
- **SQL Safety:** Always escape identifiers (`escapeIdentifier` in `lib/sql_client.ts` or `pg-escape`), parameterize values, and respect PostgreSQL 10–18.2+ version compatibility.
- **Verification:** Always run `bun check` and `bun test tests/` before finishing.
