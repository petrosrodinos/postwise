# "Humanize" revise preset — prompt sourcing & maintenance

## Where the prompt lives

The `HUMANIZE` revise preset instruction is a single string in
`api/src/modules/posts/posts.service.ts`, inside the `REVISE_PRESET_INSTRUCTIONS`
map (keyed off `RevisePreset.HUMANIZE`, declared in
`api/src/modules/posts/dto/revise-post.dto.ts`). It's passed straight into the
AI revise call alongside the other presets (`FRIENDLIER`, `PUNCHIER`,
`FIX_GRAMMAR`, etc.) — same mechanism, same file, same map.

The matching frontend enum value lives in
`app/src/features/posts/interfaces/posts.interfaces.ts` (`RevisePresets.HUMANIZE`),
and the quick-action button is in
`app/src/pages/dashboard/pages/projects/pages/project-generate/components/post-ai-revise-panel.tsx`.

## Why the current wording is what it is

The first draft of this preset was written from general/remembered knowledge of
"AI writing tells" — not sourced, not verified. On request, it was replaced with
wording drawn from an actual maintained, cited resource: the `avoid-ai-writing`
skill (MIT licensed, `conorbronsdon/avoid-ai-writing` on GitHub). That skill's
word tiers and structural-pattern list trace back further to
`brandonwise/humanizer` (vocabulary tiers) and `blader/humanizer` (sentence
pattern P9, the "it's not X — it's Y" reveal).

Important caveat carried over from that source and worth preserving in any
future rewrite: these patterns are **writing-quality signals, not proof of AI
authorship**, and no prompt can honestly promise to "beat" or "pass" an AI
detector. Research cited by that skill:

- Liang et al., *Patterns* (2023, Stanford) — AI-detector false-positive rates
  above 60% on non-native English writers.
- Jabarian & Imas, BFI Working Paper 2025-116 (2025) — misclassification rates
  above 70% on open-source detectors.
- arXiv:2506.07001 (2025) — adversarial paraphrasing cuts detector accuracy by
  roughly 88% across every method tested.

Do not reintroduce language like "passes AI-content detectors" into the
preset instruction — it was deliberately removed for this reason.

## Sources used for the current wording

- [conorbronsdon/avoid-ai-writing — SKILL.md](https://github.com/conorbronsdon/avoid-ai-writing/blob/main/SKILL.md)
- [conorbronsdon/avoid-ai-writing — references/patterns.md](https://github.com/conorbronsdon/avoid-ai-writing/blob/main/references/patterns.md)
  (the actual word tiers: Tier 1A "always replace" AI-frequency markers, Tier 1B
  clarity-only edits, Tier 2 "flag if 2+ appear in one paragraph"; plus
  structural tells like em-dash rate, rule-of-three, uniform paragraph length)
- [jalaalrd/anti-ai-slop-writing](https://github.com/jalaalrd/anti-ai-slop-writing) — a
  comparable community skill, not pulled from directly but worth checking if
  `avoid-ai-writing` goes stale or unmaintained.
- [The Anti-AI Writing Prompt — Teruio's Substack](https://teruio.substack.com/p/the-anti-ai-writing-prompt) —
  general framing, not a primary source for the word list.

## Directions for updating this prompt later

If asked to revisit or expand the `HUMANIZE` preset:

1. **Re-fetch, don't rely on memory.** Pull the current
   `references/patterns.md` from `conorbronsdon/avoid-ai-writing` (or whatever
   has replaced it — check the repo's still-maintained and the word list
   hasn't moved) rather than reusing the list baked into this doc, since AI
   writing tells shift as models change.
   ```
   curl -sL https://raw.githubusercontent.com/conorbronsdon/avoid-ai-writing/main/SKILL.md
   curl -sL https://raw.githubusercontent.com/conorbronsdon/avoid-ai-writing/main/references/patterns.md
   ```
2. **Keep it condensed.** The source is a full multi-file audit skill (detect /
   rewrite / edit modes, style configs, iteration passes). The revise preset is
   one inline string competing with seven other one-liners in the same map —
   don't try to port the whole skill in. Pull only: a short representative
   vocabulary list, the em-dash/rule-of-three/uniform-rhythm structural rules,
   and the tone-calibration principles.
3. **Match the existing map's style** in `posts.service.ts` — a single string
   value per `RevisePreset` key, string-concatenated across lines for
   readability, single-quoted per the repo's Prettier config
   (`singleQuote: true` in `api/.prettierrc`).
4. **Never claim detector evasion.** State it as "remove AI writing tells" /
   "sound human-written," not "bypass/pass AI detectors."
5. **Update both enums together** — `RevisePreset` in
   `api/src/modules/posts/dto/revise-post.dto.ts` and `RevisePresets` in
   `app/src/features/posts/interfaces/posts.interfaces.ts` must stay in sync,
   or the frontend button and backend instruction map will drift apart.
6. After editing, type-check both packages (`npx tsc --noEmit -p .` in `api/`
   and `app/`) — there's no runtime test coverage for the preset wording
   itself.
