Fix and extend the existing "البصمة البصرية" section — no new tab, no new page.

## 1. Theme toggle (sun/moon) — everywhere

- New `ThemeToggle` component (`src/components/theme-toggle.tsx`) using `useBrandIdentity`. Icons: `Sun` / `Moon` from lucide, with smooth transition (`transition-colors duration-300`), tooltip showing active mode, click cycles light → dark → auto or accepts explicit mode.
- Mount it inside the admin `PageShell` header area (top of `/admin` and top of "البصمة البصرية" panel).
- Toggle writes to `localStorage` (`THEME_MODE_KEY`) via existing `writeThemeMode` — already persists across reload.
- Add "المظهر الافتراضي" segmented control (نهاري / ليلي / تلقائي) inside brand-identity panel — separate from the quick toggle.
- Ensure `applyThemeMode` fires on `matchMedia` change in auto mode (already wired in `__root.tsx` — verify).

## 2. Default palettes (light + dark)

Update `DEFAULT_BRAND` in `src/lib/brand-identity.ts` to seed the user-specified light + dark palettes as `DEFAULT_LIGHT` / `DEFAULT_DARK` constants. Expose:
- `resetLight()` / `resetDark()` — independent restore buttons.
- All 25+ color tokens (background, dashboard-bg, card, input, header, primary, primary-dark, secondary, primary-btn, primary-btn-fg, secondary-btn, secondary-btn-fg, foreground, muted-fg, heading, icon, border, link, gold, info-card, info-icon-bg, success, warning, destructive, shadow).
- Since the app already uses HSL-based tokens in `src/styles.css`, values must be converted to the existing token format on write. Approach: extend `COLOR_TOKENS` to cover the new keys and map to their `--css-var` names, allowing HEX input; runtime CSS injection uses raw values (browsers accept both hex and hsl on custom props).
- Add missing CSS variables to `src/styles.css` (`--dashboard-bg`, `--header`, `--primary-dark`, `--gold`, `--info-card`, `--info-icon-bg`, `--success`, `--warning`, `--link`, `--shadow-color`) with defaults matching user-specified values, and mirrored `.dark` overrides.
- Header keeps green in BOTH modes: use `--header: #064C32` in both light and dark — set as a fixed token, not remapped.

Per-color editor row: label + native color picker (`<input type="color">`) + HEX text input, with live preview via `applyPreview`.

## 3. Icons section — rewrite

Rewrite the "إدارة الأيقونات" sub-panel in `brand-identity-panel.tsx`.

**Registry** (new `src/lib/icon-registry.ts`): declare every icon actually used across the app with metadata:
```
{ id, name (ar), lucideName, usedIn: string[], category: IconCategory }
```
Categories (collapsible groups): navigation, header-footer, dashboard, pages, search-filter, location, time, pharmacy, forms, actions, crud, share, users, settings, alerts, theme, social, appstore, media, info. Populate ~80+ entries by scanning current imports (a one-time hand-authored list — no dynamic import scan needed).

For each icon row show: preview, ar name, usage list, day color, night color, size, stroke, bg color, bg size, bg shape (circle/square/rounded), radius, "استبدال" button, "استعادة" button.

## 4. Icon library modal (new)

New `src/components/admin/icon-library-modal.tsx`. Uses `lucide-react`'s `icons` map and a curated categorized list (~300 icons across the 19 categories). Features:
- Search box (ar + en aliases via a small alias map).
- Category chips.
- Grid preview (name below).
- Click selects; "استخدام هذه الأيقونة" confirms, "إلغاء" closes.

## 5. Icon replace flow

Replace button opens a small chooser popover with 3 options:
1. اختيار من مكتبة الأيقونات → opens modal above.
2. رفع من الجهاز → file input (SVG/PNG/WebP → dataURL). SVG monochrome detection = allow tint; else disable color pickers.
3. استعادة الأيقونة الافتراضية.

After selection, show a mini editor with size/stroke/bg/radius/day-color/night-color + "تطبيق هنا فقط" / "تطبيق على كل الأماكن" radio (scope stored per-override in `IconOverride`).

**Confirmation dialog** before replace/delete listing every place from `usedIn`.

## 6. Save / publish buttons per sub-section

Each of colors-light, colors-dark, icons, fonts, theme gets its own row:
- حفظ التغييرات → `saveDraft`
- حفظ كمسودة → same, explicit label
- حفظ ونشر → `publish` (writes `BRAND_PUBLISHED_KEY`, triggers global re-apply)
- استعادة الإعدادات الافتراضية → resets that sub-section only (light-only, dark-only, icons-only, fonts-only)

Nothing hits the live site until "حفظ ونشر".

## 7. Live preview

Keep existing `applyPreview` scoped to `[data-brand-preview-root]`. Add a device switcher (desktop/tablet/mobile) rendering an iframe-like preview of `/` inside the panel; the frame gets `data-brand-preview-root` so draft css only affects it.

## 8. File changes

- edit `src/lib/brand-identity.ts` — add default palettes, new color tokens, per-scope reset, extended `IconOverride` (bgSize, bgShape, radius, padding, scope).
- new `src/components/theme-toggle.tsx`.
- new `src/lib/icon-registry.ts`.
- new `src/components/admin/icon-library-modal.tsx`.
- new `src/components/admin/icon-replace-popover.tsx`.
- edit `src/components/admin/brand-identity-panel.tsx` — split icons sub-panel into grouped accordion, add per-section save/publish/reset rows, wire theme toggle at top, color picker rows with HEX field, device preview.
- edit `src/styles.css` — add missing CSS variables + `.dark` overrides matching the user's specified defaults.
- edit `src/components/page-shell.tsx` — mount `ThemeToggle` in the admin header slot.
- edit `src/routes/__root.tsx` — verify `applyThemeMode` fires on system-preference change (already added; keep).

No new admin tab, no new route. Existing layout and other tabs untouched.
