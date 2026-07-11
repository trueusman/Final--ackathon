---
name: OpenAPI date fields vs Drizzle date-mode-string columns
description: Date fields round-trip as JS Date from generated Zod schemas but Drizzle date columns often expect "YYYY-MM-DD" strings.
---

When an OpenAPI schema field is `format: date`, Orval's generated Zod schema parses it as `zod.coerce.date()`, producing a JS `Date` object in route handlers. If the corresponding Drizzle column is declared with `date(..., { mode: "string" })` (common for pure calendar dates with no time/timezone), inserting/updating with the raw `Date` object fails TypeScript checks (`Date` is not assignable to `string | null | undefined`).

**Why:** the two layers (generated request validation vs. DB column mode) independently chose different date representations; there's no automatic bridging.

**How to apply:** in route handlers that write date fields to a `date`-mode-`"string"` Drizzle column, convert `Date → date.toISOString().slice(0, 10)` (or equivalent) before passing to `.insert()`/`.update()`. See `normalizeDates()` in `artifacts/api-server/src/routes/assets.ts` in the MaintainIQ project for a reusable pattern.
