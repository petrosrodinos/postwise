---
name: new-app-from-starter
description: 'Step-by-step guide for taking this repo''s starter (api/ = NestJS + Prisma + Postgres, app/ = React + Vite + Radix) and building a brand new product from scratch. Use when starting a new project from this starter template, or onboarding a new developer/AI that needs to be walked from a client brief to a running app.'
---

# New App From Starter

This starter (`api/` = NestJS + Prisma + Postgres, `app/` = React + Vite + Radix)
already ships auth, billing, and document upload scaffolding. This skill walks
through turning it into a specific new product, one step at a time. It's written
so a new developer and an AI assistant can follow it together — each step says
what to do and what "done" looks like.

Work through the steps in order. Do not skip ahead to code before Step 1 is done.

## Step 1 — Write the detailed Product Specification

**Goal:** turn whatever raw material the client/stakeholder gave you into a
clear, detailed, unambiguous `docs/Product_Specification.md` that describes
every feature of the product. This becomes the single source of truth that
every later step (data model, API, UI) is built against — nothing gets coded
before this exists.

**How:**

1. Gather the raw client input: notes, a brief, a call transcript, an existing
   doc, screenshots, competitor references — whatever describes what they want
   built. It's fine if it's messy, incomplete, or informal.
2. Hand that raw material to an AI assistant and ask it to write a detailed,
   structured specification from it — not a copy-paste, but an *enhanced*
   version that fills in the structure the client's raw notes won't have:
   summary, goals/non-goals, user personas/roles, core concepts and data
   model, and a feature-by-feature breakdown of behavior (including edge
   cases the client didn't think to mention). Point it at
   `docs/Product_Specification.md` in this repo as an example of the expected
   depth and structure if one already exists from a prior project.
3. Review the generated spec against the original client input for gaps or
   misunderstandings. Iterate with the AI — ask it to clarify ambiguous
   sections, flesh out thin ones, and call out open questions/decisions that
   still need the client's input — until every feature and role is described
   unambiguously.
4. Save the final result as `docs/Product_Specification.md`.

**Done when:** `docs/Product_Specification.md` is complete enough that another
developer, or an AI with no other context, could implement the whole product
from reading it alone — without going back to the client for clarification.

## Step 2 — Create the mockups

**Goal:** turn `docs/Product_Specification.md` into a full set of static HTML
mockups under `app/mockups/` covering every page and feature described in the
spec, so the UI/UX is decided and reviewable before any real frontend code is
written.

**How:**

1. Feed the finished `docs/Product_Specification.md` into a UI-generation
   tool (e.g. Claude, Lovable, Google Stitch) and ask it to design and produce
   static HTML mockups for every page and feature the spec describes —
   including all states/roles called out in the spec (e.g. different user
   roles, empty states, key flows), not just the happy-path screens.
2. Structure the output as one static `.html` file per page/screen under
   `app/mockups/`, with shared assets factored out (e.g. `assets/styles.css`
   for shared styles, `assets/nav.js` for shared navigation, `assets/data.js`
   for shared mock data, `assets/app.js` for shared behavior) so pages stay
   consistent instead of each reinventing its own header/nav/styling. Add an
   `index.html` that links to every mockup page.
3. Review the mockups page-by-page against the spec: every feature and role
   from Step 1 should have a corresponding screen, and every screen's content
   should match what the spec says that page/feature does. Send anything
   missing or mismatched back to the tool to fix.
4. Get the mockups in front of the client/stakeholder for sign-off before
   moving on — this is the cheapest point to change direction, well before
   real components or API integration exist.

**Done when:** `app/mockups/` has a static HTML page for every page/feature in
the spec, all reachable from `index.html`, reviewed against the spec, and
signed off by the client.

## Step 3 — Create DESIGN.MD and PRODUCT.md

**Goal:** distill the spec and mockups into two short, AI-generated reference
docs at the project root that later steps (and later AI sessions) read
instead of re-deriving the same context from scratch every time:

- **`DESIGN.MD`** — the design system extracted from the Step 2 mockups:
  colors, typography, spacing, shared component patterns, and UI conventions
  actually used across `app/mockups/`. This is what real frontend work is
  built against, so components stay visually consistent instead of each page
  reinventing its own styling.
- **`PRODUCT.md`** — a short one-pager summary of the product: purpose,
  target users, and core features. A condensed, quick-reference version of
  `docs/Product_Specification.md` — not a replacement for it.

**How:**

1. Give an AI assistant `docs/Product_Specification.md` and the mockups in
   `app/mockups/` (including `assets/styles.css`) and ask it to write
   `DESIGN.MD` by extracting the actual design system in use — concrete
   values (colors, font sizes, spacing scale) and patterns (how nav, cards,
   forms, empty states look), not generic design advice.
2. Ask the same AI to write `PRODUCT.md` as a condensed one-pager derived
   from `docs/Product_Specification.md` — purpose, target users, core value
   proposition, and key features only, trimmed down from the full spec's
   detail.
3. Review both against the spec/mockups for accuracy — `DESIGN.MD` should
   describe what the mockups actually look like, and `PRODUCT.md` should not
   drift from or contradict `docs/Product_Specification.md`.
4. Save the results as `DESIGN.MD` and `PRODUCT.md` at the project root.

**Done when:** `DESIGN.MD` accurately documents the mockups' design system,
and `PRODUCT.md` gives an accurate one-page summary of the product — both
short enough to read in full before starting frontend/backend work.

## Step 4 — Build the complete DB schema

**Goal:** turn every entity, relationship, and field implied by
`docs/Product_Specification.md` into a complete `api/prisma/schema.prisma`,
extending the starter's existing models rather than replacing them.

**How:**

1. Give an AI assistant `docs/Product_Specification.md` and the current
   `api/prisma/schema.prisma` (starter ships `User`, `PasswordResetToken`,
   `Document`, plus `AuthRole`/`DocumentType` enums) and ask it to design and
   write every model the spec requires, matching the existing file's
   conventions:
   - `id String @id @default(uuid())` on every model
   - snake_case column/table names via `@@map("...")` (model names stay
     PascalCase, singular)
   - `created_at DateTime @default(now())` / `updated_at DateTime @updatedAt`
     on every model
   - `@@index([...])` on foreign keys and `id`
   - fixed value sets (roles, statuses, types) as Prisma `enum`s, not strings
   - explicit `@relation` with `onDelete` behavior spelled out
2. Cover every entity and relationship the spec describes — not just the
   "main" tables: junction/ownership tables (e.g. personal vs. shared/team
   ownership), self-referencing FKs, and per-type extension tables the spec
   calls for should all be present, not deferred.
3. Review the generated schema against the spec section by section: every
   noun in the spec's data model should map to a model or field, and every
   stated constraint (uniqueness, required relations) should be enforced in
   the schema, not left to application code.
4. Run the migration from `api/` against `.env.staging` (per this repo's
   local-dev convention — `.env.local` has placeholder keys, not schema
   credentials, but `.env.staging` is what's set up to migrate against):
   `npm run migrate` (or `npm run migrate:staging` if you don't need the app
   server to start afterward). Fix any migration errors before moving on.

**Done when:** `api/prisma/schema.prisma` has a model (or field/enum) for
every entity in `docs/Product_Specification.md`, the migration has been run
successfully, and `npx prisma generate` types are available for the API to
build against.

## Step 5 — Reconcile the mockups with the schema

**Goal:** the Step 2 mockups were built from the spec before
`api/prisma/schema.prisma` existed, so they can drift from the real data
model — fields that don't exist, statuses/enum values the mockups never
show, type-specific fields (e.g. one platform/type's extra fields) applied
uniformly instead of only where the schema says they apply. This step closes
that gap before real frontend work (Step 6+) gets built to visually match
mockups that lie about the data model.

**How:**

1. Read `api/prisma/schema.prisma` model by model, side by side with every
   page under `app/mockups/` and its shared mock data in
   `app/mockups/assets/data.js`.
2. For each model, check:
   - Every field the mockups reference on an entity actually exists on that
     model in the schema, and vice versa — no mock object inventing a field
     the schema doesn't have.
   - Every enum's full value set (statuses, roles, types) appears somewhere
     in the mockups (dropdowns, filters, badges/labels) — not just the
     happy-path subset (e.g. an in-progress or failed state the mockups
     never render).
   - Fields the schema documents as conditional or type-specific (e.g. only
     populated for one variant of a polymorphic model) are actually shown
     only for that variant in the UI, not applied to every record generically.
   - Ownership/multi-tenancy patterns in the schema (e.g. personal-account vs.
     organisation-owned records) are reflected consistently wherever the
     mockups show a workspace switcher or ownership-scoped list.
3. List every mismatch found before changing anything — this can range from
   small (wiring an existing schema field into an already-built panel) to
   large (a whole feature area the schema implies, like an asset/media
   library, that no mockup page covers at all). If the list is long or the
   fixes are substantial, confirm scope/priority with the client/stakeholder
   before proceeding — not every gap needs fixing before Step 7.
4. Update `app/mockups/**` (HTML pages, `assets/data.js`, `assets/styles.css`,
   shared helpers in `assets/app.js`/`assets/nav.js`) to close the gaps in
   scope. Keep the Step 2 shared-asset structure — reuse existing shared
   color/status/label conventions rather than inventing new one-off styling
   per page.
5. Open each changed mockup page in a browser and click through the affected
   flows to confirm the fix actually renders correctly (not just "the code
   was written") and the browser console is free of new errors.

**Done when:** every model, field, and enum value in
`api/prisma/schema.prisma` is represented somewhere in `app/mockups/` (or any
remaining gap has been explicitly deferred with stakeholder sign-off), and no
mockup page implies data or states the schema doesn't actually support.

## Step 6 — Implement the full API

**Goal:** build a complete NestJS module in `api/src/modules/` for every model
in `api/prisma/schema.prisma` (from Step 4), covering every operation
`docs/Product_Specification.md` describes for it — not just CRUD scaffolding.

**How:**

1. Before writing any API code, read
   `.cursor/rules/api-code-structure-and-best-practices.mdc` and follow it
   **strictly** — it's the canonical rule file for everything under `api/**`
   and defines the exact module layout and naming conventions below. Do not
   deviate from it (folder layout, naming, guards, validation approach)
   even if it seems faster to do otherwise; treat any conflict between this
   step's summary and the rule file itself as resolved in the rule file's
   favor.
2. Use Claude's `/goal` command to drive this step.
3. For each domain in the schema, create a self-contained module at
   `api/src/modules/<feature-name>/` following the required layout:
   ```
   modules/<feature-name>/
   ├── <feature-name>.module.ts
   ├── <feature-name>.controller.ts
   ├── <feature-name>.service.ts
   ├── dto/create-<feature-name>.dto.ts, update-<feature-name>.dto.ts, <feature-name>-query.schema.ts
   ├── entities/<feature-name>.entity.ts
   └── interfaces/<feature-name>.interface.ts
   ```
   - Controllers: routing only, `@UseGuards(JwtGuard)` (+ `RolesGuard` where
     roles matter) — no business logic.
   - Services: all business logic and Prisma access via `PrismaService`.
   - DTOs: `class-validator` on request bodies; Zod + `ZodValidationPipe` on
     query params.
   - Third-party SDK calls go through `integrations/`, never directly in a
     feature module.
   - Register every new module in `app.module.ts`.
4. Implement every action the spec describes for that entity — not just
   list/create/update/delete. Re-read the relevant spec section per module
   and check off each described behavior (state transitions, permission
   rules, side effects) as it's implemented.
5. Test each endpoint locally against `.env.staging`
   (`npm run start:staging` in `api/` — per this repo's local-dev convention,
   `.env.local` has placeholder integration keys, so flows like email sending
   won't work with it).

**Done when:** every model from `api/prisma/schema.prisma` has a
corresponding module, every endpoint the spec calls for exists and is guarded
correctly, and the API runs against `.env.staging` without errors.

## Step 7 — Plan the frontend implementation

**Goal:** produce a complete, dependency-ordered frontend implementation plan
before writing any real frontend code, so an AI coding agent (or a developer)
always knows exactly what to build next and why.

**How:**

1. Read `.agents/skills/ui-architect/SKILL.md` and follow it exactly using
   Claude's `/goal` command to drive execution.
2. Give it its required inputs: `docs/Product_Specification.md`,
   `api/prisma/schema.prisma`, `.cursor/rules/app-code-structure-and-best-practices.mdc`,
   the now-complete API from Step 6, and the current state of `app/` (existing
   pages, components, routes, navigation).
3. Let it produce the two deliverables it defines:
   - Feature-by-feature frontend documentation under `docs/frontend/`
     (`README.md`, `navigation.md`, one file per feature) — pages, subpages,
     tabs, menus, dialogs, forms, user flows, and which Prisma
     entities/endpoints each screen uses.
   - `docs/frontend/PROGRESS.md` — the master, dependency-ordered
     implementation roadmap with a single explicit "Next Action", split into
     MVP vs. post-MVP, that a coding agent updates as it completes each task.
4. Verify every feature in `docs/Product_Specification.md` has a
   corresponding section in `docs/frontend/`, and that `PROGRESS.md`'s task
   order respects real dependencies (e.g. auth before protected pages, list
   before detail) rather than generic placeholder phases.

**Done when:** `docs/frontend/` fully documents every screen the product
needs, `docs/frontend/PROGRESS.md` exists with phases, completion criteria,
and a concrete "Next Action", and a coding agent could open `PROGRESS.md`
alone and know exactly what to implement next.

## Step 8 — Implement the full app from the plan (final step)

**Goal:** execute `docs/frontend/PROGRESS.md` task by task using Claude's
`/goal` command until every phase — MVP and post-MVP — is complete and the
product works end-to-end against the real API from Step 6.

**How:**

1. Use Claude's `/goal` command, pointed at `docs/frontend/PROGRESS.md`, to
   drive implementation. Follow the operating rules `ui-architect` defined
   for this file:
   - Read `docs/frontend/PROGRESS.md` first, every session.
   - Find and work on the current **Next Action** — don't pick an arbitrary
     task.
   - Read the linked feature doc under `docs/frontend/` before touching code.
   - Inspect the existing implementation and check the Prisma schema before
     changing data-related code.
   - Build vertically end-to-end: UI → TanStack Query → real API endpoint →
     backend logic → database → response → UI update. A feature is not done
     because a form or a mock exists — it's done when it works against the
     real backend from Step 6.
2. After each task: verify its completion criteria for real (not just "code
   was written"), check the box in `PROGRESS.md`, update the progress
   counters and current phase, and update **Next Action** to the next
   incomplete task.
3. If a task is blocked or a requirement is ambiguous, add it to
   `PROGRESS.md`'s "Blocked / Needs Clarification" section instead of
   guessing — resolve it before continuing that task.
4. Repeat until every MVP task is checked off, then continue through
   post-MVP phases the same way until the Finished Product Checklist in
   `PROGRESS.md` is fully checked.

**Done when:** every task in `docs/frontend/PROGRESS.md` is checked off, the
Finished Product Checklist passes, and every feature works end-to-end against
the real API — the app is complete.

---

This is the final step. Once Step 8 is done, the app built from this starter
is complete and ready for review/QA.
