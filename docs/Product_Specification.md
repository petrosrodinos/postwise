# Postwise — Product Specification

> **Status:** Draft. The repository currently ships a generic auth/billing/AI boilerplate (`api/` = NestJS + Prisma + Postgres, `react-starter/` = React + Vite + Radix UI) with no Postwise-specific domain models yet (only `User`, `PasswordResetToken`, `Document`). This spec defines the target product, including the Organisations feature, so implementation can proceed against a single source of truth. Sections should be updated as decisions change.

## 1. Summary

Postwise is an AI-assisted content platform: users draft, refine, schedule, and publish both social posts (LinkedIn, Twitter/X) and long-form **blog posts**, working either under their personal account or under a separate, named **Organisation** workspace for brand-level content ownership.

## 2. Goals

- Let a user plan, generate, and publish social and blog content faster with AI assistance.
- Let a user separate personal content from a named business/brand identity (an **Organisation**) without duplicating features between the two contexts.
- Keep the underlying data model swappable between "personal" and "organisation" ownership.

## 3. Non-goals

- Multi-user collaboration within an Organisation (invites, member roles, shared access) — an Organisation is single-owner only in v1.
- Supporting nested sub-organisations — one flat, independent Organisation per workspace, no hierarchies.

## 4. Users & personas

| Persona | Description |
|---|---|
| Individual creator | Solo user managing their own posts and brand assets, on a personal (non-org) account. |
| Organisation Owner | Created the Organisation; sole user of that workspace — manages its brand assets, connected channels and content. |
| Platform Support/Admin | Internal staff (`AuthRole.SUPPORT` / `ADMIN` / `SUPER_ADMIN`) with cross-account visibility for support and moderation. |

## 5. Core concepts

### 5.1 Account & Auth
- Email/password auth already scaffolded (`api/src/modules/auth`), with password reset tokens.
- A `User` can act under their personal account and/or any Organisation workspace they created, switching between contexts in the UI.
- Platform-level roles (`AuthRole`: `USER`, `ADMIN`, `SUPER_ADMIN`, `SUPPORT`) govern access to Postwise's own admin tooling and are unrelated to the personal/Organisation context a user is currently acting in.

### 5.2 Documents / Brand assets
- Existing `Document` model (logos, banners, images, video, audio, PDFs) becomes ownable by either a `User` or an `Organisation`, so brand assets can be owned by an Organisation instead of tied to a personal account.

### 5.3 Posts (net new)
- Draft → AI-assisted generation/editing → schedule → publish → track performance.
- A Post belongs to exactly one owner context: either a personal `User` or an `Organisation`.
- Supports multiple target social channels per post (channel connections are also owned by the same context).
- A Post has a **content type** that determines its fields, editor, and valid publish targets (see §5.3.1).

#### 5.3.1 Content types

| Content type | Publish target(s) | Format |
|---|---|---|
| `TWITTER` | X / Twitter | Short-form text (character-limited), optional media, optional thread (ordered child posts). |
| `LINKEDIN` | LinkedIn | Medium-form text, optional media/document attachment. |
| `BLOG` | Postwise-hosted blog and/or external CMS (see below) | Long-form rich content: title, slug, body, cover image, SEO metadata. |

- `Post.type` — enum (`TWITTER`, `LINKEDIN`, `BLOG`); additional channels are added as new enum values, not new tables.
- Channel-specific fields (e.g. thread ordering for Twitter, blog `title`/`slug`/`seo_description`) live on a per-type extension (either JSON column on `Post` or a `PostBlogDetails` 1:1 table) rather than widening the base `Post` row with mostly-null columns.
- **AI drafting** (§7) generates copy appropriate to the selected type — e.g. a single blog draft can be "repurposed" into a Twitter thread and a LinkedIn post via one AI action, producing three linked `Post` rows (see `source_post_id` below) that stay independently editable and schedulable.
- **Blog-specific fields:**
  - `title`, `slug` (unique per owner context), `body` (rich text/HTML or Markdown — TBD), `excerpt`, `cover_document_id` (FK -> `Document`), `seo_title`, `seo_description`, `canonical_url`.
  - **Publishing destinations for blog posts:** (a) Postwise-hosted blog page under the org's/user's public slug, and/or (b) export/push to an external CMS (e.g. WordPress, Webflow, Ghost) via a connected integration — external CMS support is a fast-follow, not required for v1.
- `Post.source_post_id` (nullable, self-FK) links a repurposed post back to the original it was generated from, so a blog → Twitter/LinkedIn repurposing chain is traceable.
- Scheduling/publishing and ownership (`user_id` / `organisation_id`) rules from §5.3 and §6 apply uniformly across all content types.

## 6. Organisations

### 6.1 What an Organisation is
An Organisation is a named workspace, separate from a user's personal account, that owns its own brand assets, connected social channels and posts. It is created and used by a single user — there is no shared/multi-user access in v1.

### 6.2 Data model (proposed)

```
Organisation
  id
  name
  slug              (unique, used in URLs)
  created_by_user_id  (the sole user of this workspace)
  created_at / updated_at
```

Ownership pattern applied to existing/planned models:
- `Document.organisation_id` (nullable) alongside existing `Document.user_uuid` — a document belongs to a user OR an organisation, never both.
- `Post.organisation_id` (nullable) alongside `Post.user_id` — same pattern.

A `User` can create multiple Organisations and switch between their personal account and any Organisation they created in the UI; each session/request operates against one "active context" (personal or a specific Organisation).

### 6.3 UI implications
- An **org switcher** in the app shell lets a user move between their personal account and any Organisation they created; all list views (posts, assets, connected channels) scope to the active context.
- A **General** settings page for the Organisation's name, slug, and deletion.

### 6.4 Open questions
- Data retention policy on Organisation deletion.
- Whether multi-user collaboration (invites, roles) and Organisation billing get added in a future version — both are explicitly out of scope for v1 (see §8).

## 7. Non-organisation core features (for context)

- **AI-assisted drafting** — uses `api/src/integrations/ai` to generate/rewrite content (social copy or long-form blog body) from a prompt or brand voice profile, including repurposing one content type into another (see §5.3.1).
- **Scheduling & publishing** — queue-backed (`api/src/core/queues`) scheduled publishing to connected social channels and, for blog posts, to the Postwise-hosted blog (and optionally an external CMS).
- **Storage** — media uploads via `api/src/integrations/storage` (GCS) for post attachments and brand assets.
- **Notifications** — email (Resend/SMTP) and SMS (Twilio) for publish confirmations and failures.

## 8. Out of scope for v1

- Multi-user Organisation membership/collaboration (invites, member roles, shared access) — an Organisation has exactly one user in v1.
- Organisation-level billing/subscriptions.
- Nested/sub-organisations.
- Cross-organisation content sharing.
- External CMS push for blog posts (WordPress/Webflow/Ghost, etc.) — v1 ships Postwise-hosted blog publishing only; external CMS integrations are a fast-follow.
