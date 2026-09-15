# Postwise — Product Specification

> **Status:** Draft. The repository currently ships a generic auth/billing/AI boilerplate (`api/` = NestJS + Prisma + Postgres, `react-starter/` = React + Vite + Radix UI) with no Postwise-specific domain models yet (only `User`, `PasswordResetToken`, `Document`). This spec defines the target product, including the Organisations feature, so implementation can proceed against a single source of truth. Sections should be updated as decisions change.

## 1. Summary

Postwise is an AI-assisted content platform: users draft, refine, schedule, and publish both social posts (LinkedIn, Twitter/X) and long-form **blog posts**, working either under their personal account or under a separate, named **Organisation** workspace for brand-level content ownership.

## 2. Goals

- Let a user plan, generate, and publish social and blog content faster with AI assistance.
- Let a user separate personal content from a named business/brand identity (an **Organisation**) without duplicating features between the two contexts.
- Keep the underlying data model swappable between "personal" and "organisation" ownership.

## 3. Non-goals

- Invite-based onboarding for Organisation members (email invite/accept flow, pending-invite state) — a member account is created directly with email, name and password by an Owner/Admin (see §6.3).
- Granular/custom permission management — access within an Organisation is one of exactly 3 fixed roles (§6.3), not a per-permission matrix.
- Supporting nested sub-organisations — one flat, independent Organisation per workspace, no hierarchies.

## 4. Users & personas

| Persona | Description |
|---|---|
| Individual creator | Solo user managing their own posts and brand assets, on a personal (non-org) account. |
| Organisation Owner | Created the Organisation; manages billing/deletion, brand assets, connected channels, content, and members. |
| Organisation Admin | Added by an Owner/Admin; manages brand assets, connected channels, content, and members, but cannot delete the Organisation. |
| Organisation Member | Added by an Owner/Admin; creates and manages content only — no member management. |
| Platform Support/Admin | Internal staff (`AuthRole.SUPPORT` / `ADMIN` / `SUPER_ADMIN`) with cross-account visibility for support and moderation. |

## 5. Core concepts

### 5.1 Account & Auth
- Email/password auth already scaffolded (`api/src/modules/auth`), with password reset tokens.
- A `User` can act under their personal account and/or any Organisation workspace they belong to, switching between contexts in the UI.
- Platform-level roles (`AuthRole`: `USER`, `ADMIN`, `SUPER_ADMIN`, `SUPPORT`) govern access to Postwise's own admin tooling and are unrelated to the personal/Organisation context a user is currently acting in.
- **Profile self-service:** a signed-in user has a Profile page to update their own name/email and to change their own password. Changing the password requires the current password but sends **no confirmation email** — it takes effect immediately (this is separate from the existing forgot-password reset-token flow, which remains for signed-out recovery).

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
An Organisation is a named workspace, separate from a user's personal account, that owns its own brand assets, connected social channels and posts. It is created by one user (the Owner), who can add other existing or new users as members with one of 3 fixed roles (§6.3) — there is no cross-organisation sharing and no custom/granular permissions.

### 6.2 Data model (proposed)

```
Organisation
  id
  name
  slug              (unique, used in URLs)
  created_by_user_id  (the Owner who created this workspace)
  created_at / updated_at

OrganisationMember
  id
  organisation_id     (FK -> Organisation)
  user_id             (FK -> User)
  role                (enum OrganisationRole: OWNER, ADMIN, MEMBER)
  created_at / updated_at
```

Ownership pattern applied to existing/planned models:
- `Document.organisation_id` (nullable) alongside existing `Document.user_uuid` — a document belongs to a user OR an organisation, never both.
- `Post.organisation_id` (nullable) alongside `Post.user_id` — same pattern.

A `User` can create/belong to multiple Organisations (via `OrganisationMember`) and switch between their personal account and any Organisation they're a member of in the UI; each session/request operates against one "active context" (personal or a specific Organisation).

### 6.3 Members & roles
- An Owner or Admin adds a member **directly** from the Organisation's Members settings page — there is no invite-link/accept-email step. The form takes **name, email, and a password** for the new account and creates it immediately in the chosen role; the new member can sign in right away with those credentials.
- If the email already matches an existing `User`, adding them creates an `OrganisationMember` row linking that existing account to the Organisation instead of a new `User` (no duplicate accounts) — behavior for this case (e.g. requiring the existing user to already know/reset their password) is an open question (§6.5).
- Exactly **3 roles**, fixed (no custom/per-permission roles):
  | Role | Can do |
  |---|---|
  | `OWNER` | Everything Admin can, plus billing (future) and deleting the Organisation. Set on the creating user; ownership can be transferred. |
  | `ADMIN` | Manage members (add/remove, change role), brand assets, connected channels, and all content. |
  | `MEMBER` | Create, edit, schedule and publish their own content. Cannot manage members or Organisation settings. |
- Removing a member deletes their `OrganisationMember` row (revokes access to that Organisation) without deleting their `User` account or personal-account content.

### 6.4 UI implications
- An **org switcher** in the app shell lets a user move between their personal account and any Organisation they belong to; all list views (posts, assets, connected channels) scope to the active context.
- A **General** settings page for the Organisation's name, slug, and deletion.
- A **Members** settings page listing current members (name, email, role, joined date) with an **Add member** action (name/email/password + role, per §6.3) and per-row role change / remove actions.

### 6.5 Open questions
- Data retention policy on Organisation deletion.
- Whether Organisation billing is added in a future version — out of scope for v1 (see §8).
- Exact flow when the email entered in "Add member" already belongs to an existing `User` (e.g. does the Owner/Admin-supplied password apply, or is the existing account's password left untouched and the user just gains access on next login).
- Whether a `MEMBER` can view/edit content created by other members of the same Organisation, or only their own.

## 7. Non-organisation core features (for context)

- **AI-assisted drafting** — uses `api/src/integrations/ai` to generate/rewrite content (social copy or long-form blog body) from a prompt or brand voice profile, including repurposing one content type into another (see §5.3.1).
- **Scheduling & publishing** — queue-backed (`api/src/core/queues`) scheduled publishing to connected social channels and, for blog posts, to the Postwise-hosted blog (and optionally an external CMS).
- **Storage** — media uploads via `api/src/integrations/storage` (GCS) for post attachments and brand assets.
- **Notifications** — email (Resend/SMTP) and SMS (Twilio) for publish confirmations and failures.

## 8. Out of scope for v1

- Invite-link/accept-email onboarding for Organisation members — members are created directly with email/name/password (§6.3).
- Granular/custom permission roles beyond the 3 fixed roles (`OWNER`/`ADMIN`/`MEMBER`).
- Organisation-level billing/subscriptions.
- Nested/sub-organisations.
- Cross-organisation content sharing.
- External CMS push for blog posts (WordPress/Webflow/Ghost, etc.) — v1 ships Postwise-hosted blog publishing only; external CMS integrations are a fast-follow.
