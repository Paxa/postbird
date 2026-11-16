# Postbird Agent & Contributor Guide

Single source of truth for Postbird development (`CONTRIBUTING.md` has legacy Electron/npm notes—follow this file).

## Stack & Architecture

* **Stack:** **Bun** v1.2+ (runtime, bundler, `bun check`, `bun test`), **Electrobun** (`2.0.6`), **TypeScript** (`strict: false`, `allowJs: true`, `useDefineForClassFields: false`, ambient globals in `ts_libs/`), **Native DOM** (`lib/dom.ts`), **Pug/Jade** (`views/*.jade` -> `views/cache.js`), **SASS** (`assets/styles/` -> `public/style.css`), **Bun `SQL`** (`lib/sql_client.ts`).
* **Two-Tier Process Model:**
  * **Host (Bun):** `electrobun/main.ts` + `electrobun/host/` (`types.ts`, `db_pool.ts`, `menu.ts`, `process_runner.ts`, `ssh_tunnel.ts`, `storage.ts`, `ai_logger.ts`, `updater.ts`).
  * **Webview (WebKit / WebView2 / WebKitGTK):** `electrobun/view.ts`, `electrobun/client.ts`, `app/`, `electrobun/shims/`.
  * **RPC Bridge:** `window.__postbirdRpc` <-> `PostbirdRPC` (`electrobun/host/types.ts`). `electrobun/bundle.ts` (`shimPlugin`) redirects legacy `pg`, `fs`, `child_process`, `electron`, `@electron/remote`, `node-ssh-forward`, and `lib/sql_client` imports to `electrobun/shims/*.js`.

## Key Paths

* `app/` — Core logic (`connection.ts`, `db_screen.ts`, `top_menu.ts`, `view_helpers.ts`, `view_cell_helpers.ts`, `controllers/`, `models/`, `views/panes/`, `views/dialogs/`)
* `electrobun/` — Shell integration (`main.ts`, `view.ts`, `client.ts`, `bundle.ts`, `ui_tests.ts`, `host/`, `shims/`, `tests/`)
* `lib/` — Shared utilities (`dom.ts`, `sql_client.ts`, `local_ai/`, `csv_util.ts`, `format_util.ts`, `context_menu.ts`, `dialogs.ts`, `alertify.ts`)
* `views/` — `.jade` templates + committed `views/cache.js` | `assets/styles/` — SASS -> `public/style.css`
* `tests/` — Bun unit & DB integration tests (`tests/test_helper.ts`) | `ts_libs/` — Ambient `.d.ts` | `bin/` — Bundled `pg_dump`/`pg_restore`

## Commands & Setup

Requires local PostgreSQL on `localhost:5432` with `createdb postbird_test` (optional env: `PG_USER`, `PG_PASSWORD`, `PG_PORT`).

```sh
bun install              # Install dependencies
bun start                # Bundle, build, and launch Electrobun (Cmd+Shift+R reloads webview)
bun run bundle           # Compile views + SASS + client TS -> public/postbird-bundle.js
bun run compile:views    # Recompile views/**/*.jade -> views/cache.js
bun run sass             # Watch & compile SASS -> public/style.css
bun check                # Typecheck all TS files
bun test tests/          # Run unit & DB integration tests
bun run test:ui          # Run E2E UI tests (POSTBIRD_TEST_UI=true POSTBIRD_TEST_DB=postbird_test)
bun run dist             # Build production distribution
```

**Release lane:** `.github/workflows/release-postbird-direct.yml` runs on pushes to `release/postbird-direct` (or manually). `prepare` creates one draft release `v<version>` (it fails if that tag is already published), then signed and notarized macOS (arm64 on `macos-15`, x64 on `macos-15-intel`; the Hutch and Electrobun pins in `hutch.config.ts` must be releases that publish a macos-x64 build), Windows (SSL.com eSigner) and Linux (x64, arm64) jobs upload both platform installers and Electrobun auto-updater artifacts (`*update.json`, `*.tar.zst`, `*.patch`, served via `release.baseUrl: "https://github.com/Paxa/postbird/releases/latest/download"`) into it. A person installs the artifacts on clean machines and publishes the draft by hand. Secrets: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_API_KEY`, `APPLE_API_ISSUER`, `APPLE_API_KEY_STRING`, `ES_USERNAME`, `ES_PASSWORD`, `ES_CREDENTIAL_ID`, `ES_TOTP_SECRET`. When bumping a release version, keep `package.json` (which `electrobun.config.ts` and `electrobun/shims/remote.js` read) and `snap/snapcraft.yaml` in sync, update the fallback in `views/help.jade`, then run `bun run bundle` so `views/cache.js` and `public/postbird-bundle.js` reflect the new version. `build.yml` is CI only and never publishes. Signing is driven by `ELECTROBUN_DEVELOPER_ID` / `ELECTROBUN_APPLEAPIKEY`, so local `bun run dist` stays unsigned.

**Homebrew:** after a notarized release is published, run `scripts/homebrew_cask_sha.sh <version>` and paste the `sha256` line into `packaging/homebrew/postbird.rb`, then open the Homebrew/homebrew-cask PR from that file. The PR is needed only the first time; after that BrewTestBot autobumps through livecheck.

## Conventions & Quirks

* **Adding Host Capabilities:** Define types in `PostbirdRPC` (`electrobun/host/types.ts`), implement handler in `electrobun/main.ts` (logic in `electrobun/host/`), call `window.__postbirdRpc.<method>()` from webview, and test in `tests/electrobun_rpc_test.ts`. Do **not** add new Node/Electron shims.
* **Views & Styles:** `scripts/compile_views.ts` precompiles `.jade` into `views/cache.js` (`triggerSaveCache` in `app/components/render_view.ts` is an intentional runtime no-op). `RenderView.renderView` auto-injects `ViewHelpers` and `ViewCellHelpers`.
* **DOM, Panes & Dialogs:** Use `lib/dom.ts` (`$`, `$$`, `dom`, `formValues`, `stopEvent`). Bind clicks via `exec="method(args)"` (`PaneBase.executeHandler` in `app/views/panes/base.ts`). Use CSS classes for styling only; use semantic/data attributes for JS selectors. Register panes in `app/views/panes/all.ts` and dialogs in `app/views/dialogs/all.ts`.
* **Database Queries:** Extend `ModelBase` (`app/models/base.ts`; `connection()` resolves `this.connectionObj || ModelBase.defaultConnection || App.currentTab.instance.connection`). Escape identifiers with `escapeIdentifier` (`lib/sql_client.ts`) or `pg-escape`, parameterize values (`$1`, ...), and account for PostgreSQL 10–18.2+ differences. `read_only` pools enforce `default_transaction_read_only`.
* **AI & MCP:** `lib/local_ai/` sends schema metadata only (never row data without explicit opt-in). See `AI_IN_POSTBIRD.md` and `POSTBIRD_IN_AI.md` for details.

## Non-Negotiable Rules

1. **Bun only:** Never use `npm`, `npx`, `yarn`, or `node`.
2. **Host/webview boundary:** Never open sockets, spawn processes, or access the filesystem from `app/` or webview code—route through `PostbirdRPC`.
3. **Recompile assets:** Always run `bun run compile:views` / `bun run bundle` after editing `.jade` or `.scss` files.
4. **No new jQuery:** Never write new `$u(...)` code; avoid heavy client-side dependencies.
5. **Verify before finishing:** Run `bun check` and `bun test tests/` after your final edit.
