# Accessibility checklist [Owner: D]

Sign-off checklist for the accessibility pass, done after the design system
and before video/submission work.

Run this pass once B and C's pages exist and use the shared `components/ui/`
primitives — most of it should already be satisfied by the shared components
if they were used consistently.

## Color contrast (WCAG AA)

- [ ] All body text is at least 4.5:1 contrast against its background.
- [ ] All large text (18pt+/bold 14pt+) is at least 3:1.
- [ ] Check `brand` / `brand-light` / `brand-dark` token pairs in
      `tailwind.config.ts` specifically — these are used for badges and tags
      across A, B, and C's pages.

## Keyboard navigation

- [ ] Every interactive element (button, link, form field) is reachable via
      Tab in a logical order.
- [ ] Focus is visible on every interactive element (see `Button.tsx` and
      `BottomNav.tsx` for the `focus-visible:outline` pattern — replicate it
      anywhere a custom clickable element was added).
- [ ] `Card` components used as clickable rows (`onClick` prop) are
      reachable and activatable with Enter/Space, not just mouse click.

## Screen reader / semantics

- [ ] All `<img>` tags (avatars, event images) have meaningful `alt` text —
      never empty `alt=""` on a person's avatar (see `AvatarGroup.tsx`).
- [ ] Form inputs have associated `<label>` elements (see `schedule/page.tsx`
      and `chat/[conversationId]/page.tsx` for the pattern).
- [ ] `BottomNav` links use `aria-current="page"` for the active tab (already
      implemented — verify it survived any redesign).

## Sign-off

- [ ] Ran an automated check (axe DevTools / Lighthouse accessibility score)
      on: home, login, matches, schedule, chat, events.
- [ ] Manually tabbed through the full app once with no mouse.
