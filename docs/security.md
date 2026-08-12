# Security Audit — New Day

> Frontend security review of the Chrome MV3 extension, using the `frontend-security` skill's threat model adapted for a browser extension (no server, no cookies, no login session — see [Scope](#scope-note) below).

Audited: 2026-08-12. Covers `src/`, `wxt.config.ts`, the generated MV3 manifest output (`.output/chrome-mv3/manifest.json` after `pnpm build`), and `pnpm audit`.

---

## Scope Note

The `frontend-security` skill's default checklist (CSP headers via server middleware, HttpOnly session cookies, CSRF tokens, HSTS) targets a client talking to **your own backend**. New Day has neither — it's a static New Tab override with no login, no session, and no first-party server. Those items are marked **N/A** below rather than silently skipped. What actually applies to an extension is: manifest permissions (the real attack surface), the MV3-enforced CSP, third-party API handling, and dependency supply chain.

---

## Findings

| #   | Issue                                                                                  | Severity | Status             |
| --- | -------------------------------------------------------------------------------------- | -------- | ------------------ |
| 1   | `http://localhost:3000/*` host permission ships in the production build                | Medium   | ✅ Fixed           |
| 2   | `alarms` and `notifications` permissions declared but unused                           | Low      | ✅ Fixed           |
| 3   | `VITE_WEATHER_API_KEY` name implies a secret; it actually holds a full URL             | Low      | ✅ Fixed           |
| 4   | Build-toolchain deps (`js-yaml`, `nanoid`) have known high-severity advisories         | Medium   | ✅ Fixed           |
| 5   | No `dangerouslySetInnerHTML`, `.innerHTML`, or `eval` anywhere in `src/`               | —        | Pass               |
| 6   | Both external APIs (OurManna, Open-Meteo, Nominatim) are validated with Zod before use | —        | Pass               |
| 7   | MV3 default CSP (`script-src 'self'; object-src 'self'`) is untouched                  | —        | Pass               |

### 1. Stale dev host permission ships to production — Medium

[wxt.config.ts:12](../wxt.config.ts#L12) declares:

```ts
host_permissions: ['http://localhost:3000/*'],
```

This is baked into the shipped manifest ([.output/chrome-mv3/manifest.json](../.output/chrome-mv3/manifest.json)), not just the dev build. No code in `src/` fetches from `localhost:3000` — every real network call goes to the OurManna, Open-Meteo, or Nominatim APIs. An installed copy of the extension is requesting access to any local server a user happens to run on port 3000, which is unnecessary attack surface and against MV3 least-privilege review guidelines.

**Fix:** remove it from the shared `manifest` block and, if it's needed for local dev, gate it behind `process.env.NODE_ENV !== 'production'` in `wxt.config.ts`, or drop it entirely — WXT's dev server doesn't require `host_permissions` to work.

### 2. Unused `alarms` / `notifications` permissions — Low

[wxt.config.ts:11](../wxt.config.ts#L11) declares `permissions: ['storage', 'alarms', 'notifications']`, but:

```bash
$ grep -rn "chrome.alarms\|chrome.notifications" src/
# no matches
```

[src/entrypoints/background.ts](../src/entrypoints/background.ts) is a no-op service worker that only logs a startup message. Unused permissions widen the install-time permission prompt for no functional benefit and are a common Chrome Web Store review flag.

**Fix:** remove `alarms` and `notifications` until a module actually schedules a notification, then add them back scoped to that feature.

### 3. Misleading env var name — Low

[.env.example:6](../.env.example#L6) and [src/modules/weather/api/weather-api.ts:4](../src/modules/weather/api/weather-api.ts#L4):

```
VITE_WEATHER_API_KEY=your_open_meteo_api_url_here
```

The variable is named like a secret but holds Open-Meteo's base URL (Open-Meteo is keyless, so today there's nothing sensitive in it). The risk is future, not current: `VITE_*` vars are inlined into the built JS at compile time and are trivially recoverable from the shipped extension (unzip the `.crx`, read the bundle). If anyone ever repurposes this variable to hold an actual API key, it will leak to every user who installs the extension.

**Fix:** rename to `VITE_WEATHER_API_BASE_URL` for clarity. Document in this file (see [Accepted Risk](#accepted-risk-client-side-secrets) below) that no genuinely secret credential should ever go in a `VITE_*` var — there's no server to proxy through in this architecture, so any such key needs a rate-limited/free-tier API (as both current APIs are) or a proxy service added later.

### 4. Build-toolchain dependency advisories — Medium

```
$ pnpm audit --audit-level=high
5 vulnerabilities found (2 moderate, 3 high)
- js-yaml <4.3.1  (via @modyfi/vite-plugin-yaml)  — quadratic CPU / prototype pollution advisories
- nanoid <3.3.17   (via vite > postcss)             — infinite loop on size=0
```

Both are transitive **build-time** dependencies (Vite/PostCSS/YAML plugin), not shipped in the extension bundle — so end users aren't directly exposed. They do matter for the dev/CI machine (supply-chain surface, reproducible builds).

**Fix:** `pnpm update` to pull patched transitive versions, or add pnpm `overrides` for `js-yaml@^4.3.1` and `nanoid@^3.3.17` if the parent packages haven't bumped yet. Re-run `pnpm audit` in CI per [Step 8 of the skill](../.claude/skills/frontend-security/SKILL.md) rather than one-off.

---

## What's already solid

- **No XSS-prone rendering paths.** Every place verse/weather/quote text reaches the DOM, it's a JSX text child (e.g. [VerseCard.tsx:20](../src/modules/bible/components/VerseCard.tsx#L20)), which React escapes by default. Zero uses of `dangerouslySetInnerHTML`, `innerHTML`, or `eval` in `src/`.
- **External API responses are schema-validated**, not trusted blindly — `OurMannaSchema`, `OpenMeteoSchema`, and `NominatimSchema` (Zod) parse every response in [verse-api.ts](../src/modules/bible/api/verse-api.ts) and [weather-api.ts](../src/modules/weather/api/weather-api.ts) before the data is used. This blocks malformed/unexpected payloads from a compromised or misbehaving API from propagating into app state.
- **MV3's default CSP is untouched.** Nothing in the manifest weakens `script-src 'self'; object-src 'self'`, and MV3 forbids remotely-hosted code outright — there's no code path where a compromised CDN could inject a script into the New Tab page. This makes most of the skill's CSP/SRI checklist structurally satisfied by the platform rather than needing manual config.
- **No `externally_connectable`, no `onMessageExternal`, no `postMessage` usage** — the extension exposes no message-passing surface to other extensions or web pages.

## Accepted Risk: Client-Side Secrets

Any `VITE_*` env var is compiled into the shipped JS bundle and is recoverable by anyone who unpacks the extension — this is inherent to how browser extensions work (no server to hide a key behind) and isn't fixable by config. Today this is a non-issue: OurManna and Open-Meteo are both keyless/free-tier APIs, so nothing secret is actually at risk. **If a future module needs a real paid/rate-limited API key, it must go through a thin proxy (e.g., a serverless function) rather than a `VITE_*` var** — flag this at design time for any new module that talks to a metered API.

## Actions Taken (2026-08-12)

1. ✅ Removed `http://localhost:3000/*` `host_permissions` from [wxt.config.ts](../wxt.config.ts). The rebuilt production manifest now declares no host permissions.
2. ✅ Removed `alarms` and `notifications` from `permissions` — [wxt.config.ts](../wxt.config.ts) now declares only `['storage']`.
3. ✅ Renamed `VITE_WEATHER_API_KEY` → `VITE_WEATHER_API_BASE_URL` across `.env`, `.env.example`, and [weather-api.ts](../src/modules/weather/api/weather-api.ts).
4. ✅ Added `pnpm.overrides` in [package.json](../package.json) pinning `js-yaml` → `^4.3.1` (now 4.3.1) and `nanoid` → `^3.3.17` (now 3.3.18). `pnpm audit --audit-level=high` reports **no known vulnerabilities**. Overrides stay within the same major version to avoid breaking the build toolchain.

Verified after changes: `pnpm typecheck` ✅, `pnpm build` ✅, `pnpm audit --audit-level=high` clean.

## Still Recommended

- Add `pnpm audit --audit-level=high` to CI so new advisories surface on PRs rather than being caught by hand.
- Keep this doc's "Accepted Risk" note in mind before adding any module that needs a real paid API key.
