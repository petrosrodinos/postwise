# Postwise — Product Specification

> **Status:** Draft. The repository currently ships a generic auth/billing/AI boilerplate (`api/` = NestJS + Prisma + Postgres, `react-starter/` = React + Vite + Radix UI) with no Postwise-specific domain models yet (only `User`, `PasswordResetToken`, `Document`). This spec defines the target product, including the Organisations feature, so implementation can proceed against a single source of truth. Sections should be updated as decisions change.

## 1. Summary

Postwise is an AI-assisted content platform: users draft, refine, schedule, and publish both social posts (LinkedIn, Twitter/X) and long-form **blog posts**, working either individually or as part of a shared **Organisation** (team workspace) with role-based collaboration, shared brand assets, and centralized billing.

## 2. Goals

- Let a single user or a team plan, generate, and publish social content faster with AI assistance.
- Support multi-tenant collaboration: multiple people working under one Organisation, with shared assets, shared billing, and permission boundaries.
- Keep the underlying data model swappable between "personal" and "organisation" ownership without duplicating features.

## 3. Non-goals

- Building a full social listening / analytics suite (basic post performance metrics only, not sentiment analysis or competitor tracking).
- Supporting unlimited nested sub-organisations (one flat Organisation → Members structure, no org hierarchies).

## 4. Users & personas

| Persona | Description |
|---|---|
| Individual creator | Solo user managing their own posts and brand assets, on a personal (non-org) account. |
| Organisation Owner | Created the Organisation; owns billing, can add/remove members, delete the org. |
| Organisation Admin | Manages members, brand assets, and connected social accounts; cannot change billing or delete the org. |
| Organisation Member | Drafts, schedules, and publishes posts within the org's shared assets and connected accounts. |
| Platform Support/Admin | Internal staff (`AuthRole.SUPPORT` / `ADMIN` / `SUPER_ADMIN`) with cross-account visibility for support and moderation. |

## 5. Core concepts

### 5.1 Account & Auth
- Email/password auth already scaffolded (`api/src/modules/auth`), with password reset tokens.
- A `User` can exist standalone (personal account) or belong to one or more Organisations.
- Platform-level roles (`AuthRole`: `USER`, `ADMIN`, `SUPER_ADMIN`, `SUPPORT`) are distinct from **Organisation roles** (see §6.3) — platform roles govern access to Postwise's own admin tooling, org roles govern access within a specific Organisation.

### 5.2 Documents / Brand assets
- Existing `Document` model (logos, banners, images, video, audio, PDFs) becomes ownable by either a `User` or an `Organisation`, so brand assets can be shared across an org's members instead of tied to one person.

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
- Scheduling/publishing, ownership (`user_id` / `organisation_id`), and channel-connection rules from §5.3 and §6 apply uniformly across all content types — Organisations collaborate on blog posts the same way they do on social posts.

### 5.4 Billing
- Stripe integration already scaffolded (`api/src/integrations/stripe`, `api/src/modules/stripe`).
- Subscriptions attach to the **owner context** (personal account or Organisation), not to individual users, so an Organisation has one shared plan/seat count covering all its members.

## 6. Organisations

### 6.1 What an Organisation is
An Organisation is a shared workspace that groups Users, brand assets, connected social accounts, posts, and a single billing subscription, so a team can collaborate under one identity instead of each person working in isolation.

### 6.2 Data model (proposed)

```
Organisation
  id
  name
  slug              (unique, used in URLs)
  logo_document_id  (nullable, FK -> Document)
  created_by_user_id
  created_at / updated_at

OrganisationMember
  id
  organisation_id   FK -> Organisation
  user_id           FK -> User
  role              OrgRole enum (OWNER | ADMIN | MEMBER)
  invited_by_user_id (nullable)
  status            enum (INVITED | ACTIVE | REMOVED)
  joined_at
  created_at / updated_at
  @@unique([organisation_id, user_id])

OrganisationInvite
  id
  organisation_id   FK -> Organisation
  email
  role              OrgRole
  invited_by_user_id
  token_hash        (unique)
  expires_at
  accepted_at       (nullable)
  created_at
```

Ownership pattern applied to existing/planned models:
- `Document.organisation_id` (nullable) alongside existing `Document.user_uuid` — a document belongs to a user OR an organisation, never both.
- `Post.organisation_id` (nullable) alongside `Post.user_id` — same pattern.
- `Subscription.organisation_id` (nullable) alongside `Subscription.user_id` — same pattern.

A `User` can belong to multiple Organisations (via `OrganisationMember`) and switch between them in the UI; each session/request operates against one "active context" (personal or a specific Organisation).

### 6.3 Roles & permissions

| Capability | Owner | Admin | Member |
|---|---|---|---|
| View/create/edit/schedule/publish posts | ✅ | ✅ | ✅ |
| Manage brand assets (upload/delete) | ✅ | ✅ | ✅ (upload only, no delete) |
| Connect/disconnect social channels | ✅ | ✅ | ❌ |
| Invite/remove members | ✅ | ✅ | ❌ |
| Change member roles | ✅ | ❌ | ❌ |
| Manage billing/subscription | ✅ | ❌ | ❌ |
| Rename/delete Organisation | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ |

- Every Organisation has exactly one `OWNER` at a time; ownership transfer is an explicit action (current owner picks a new owner, who must already be an `ADMIN`).
- Deleting an Organisation requires the Owner and a confirmation step; it soft-deletes (or hard-deletes per data-retention policy, TBD) all org-scoped posts/assets not also referenced elsewhere.

### 6.4 Membership lifecycle
1. **Invite** — an Owner/Admin invites by email with a chosen role; an `OrganisationInvite` row is created and an email is sent (via existing `api/src/integrations/notifications`).
2. **Accept** — invitee clicks the link:
   - If they already have a Postwise account, they're added directly as an `OrganisationMember` with `status = ACTIVE`.
   - If not, they're routed through signup first, then added.
3. **Remove** — Owner/Admin sets `status = REMOVED` (soft removal, preserves audit trail); removed members lose access immediately but their authored posts remain attributed to them within the org.
4. **Leave** — a Member/Admin can leave voluntarily; an Owner must transfer ownership before leaving.

### 6.5 Billing model
- One subscription per Organisation, covering all active members (seat-based or flat-tier pricing — pricing model TBD, but the data model supports either via a `seats` field on the subscription).
- Only the Owner can view invoices, change plan, or update payment method.
- If a plan enforces a member limit, inviting beyond the limit is blocked with an upgrade prompt.

### 6.6 UI implications
- An **org switcher** in the app shell lets a user move between their personal account and any Organisation they belong to; all list views (posts, assets, connected channels) scope to the active context.
- A **Members** settings page (Owner/Admin only) for inviting, changing roles, and removing members.
- A **General** settings page for org name, slug, and logo.

### 6.7 Open questions
- Pricing model for org seats (flat per-org tier vs. per-seat) — not yet decided.
- Whether removed members' historical posts should be reassigned or remain attributed to the removed user.
- Data retention policy on Organisation deletion.

## 7. Non-organisation core features (for context)

- **AI-assisted drafting** — uses `api/src/integrations/ai` to generate/rewrite content (social copy or long-form blog body) from a prompt or brand voice profile, including repurposing one content type into another (see §5.3.1).
- **Scheduling & publishing** — queue-backed (`api/src/core/queues`) scheduled publishing to connected social channels and, for blog posts, to the Postwise-hosted blog (and optionally an external CMS).
- **Storage** — media uploads via `api/src/integrations/storage` (GCS) for post attachments and brand assets.
- **Notifications** — email (Resend/SMTP) and SMS (Twilio) for invites, publish confirmations, and failures.

## 8. Out of scope for v1

- Nested/sub-organisations.
- Cross-organisation content sharing.
- Granular per-post permission overrides beyond the role table in §6.3.
- External CMS push for blog posts (WordPress/Webflow/Ghost, etc.) — v1 ships Postwise-hosted blog publishing only; external CMS integrations are a fast-follow.
