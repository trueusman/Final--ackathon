---
name: Orval v8.20 emits zod-v4 syntax incompatible with zod-v3 catalog
description: Why format: email / format: uri in an OpenAPI spec can break typecheck after Orval codegen in this monorepo.
---

Orval v8.20's Zod code generator emits zod-v4-style top-level calls (`zod.email()`, `zod.url()`) for OpenAPI `format: email` / `format: uri` string fields. This monorepo's `zod` workspace catalog is pinned to `^3.25.x` (v3 API), which has no top-level `.email()`/`.url()` — the generated `lib/api-zod` code fails `pnpm -w run typecheck:libs` with errors about missing properties on the `zod` namespace.

**Why:** the codegen tool's target zod version and the project's pinned zod version drifted apart; this is a tooling/dependency mismatch, not a spec-content bug.

**How to apply:** when writing or editing an OpenAPI spec (`lib/api-spec/openapi.yaml`) in this project, avoid `format: email` and `format: uri` on string schema fields — use plain `type: string` instead. Re-run codegen and `pnpm -w run typecheck:libs` after any spec change touching string formats to catch this early. If the zod catalog version is ever upgraded to v4, this restriction can likely be lifted.
