# Vendored front-end libraries

Bundled locally (no CDN at runtime). Versions are pinned; update deliberately and re-record the checksums.

| File | Package | Version | Licence | npm integrity |
|---|---|---|---|---|
| `gsap-3.15.0.min.js` | [gsap](https://gsap.com) | 3.15.0 | GSAP Standard "no charge" licence (free, including commercial use): https://gsap.com/standard-license | `sha512-dMW4CWBTUK1AEEDeZc1g4xpPGIrSf9fJF960qbTZmN/QwZIWY5wgliS6JWl9/25fpTGJrMRtSjGtOmPnfjZB+A==` |
| `lenis-1.3.26.min.js`, `lenis-1.3.26.css` | [lenis](https://github.com/darkroomengineering/lenis) | 1.3.26 | MIT | `sha512-s/xTCZCxTFvHbAN1OzuhNaN5YPJH2ail0XAkctKW1b+RUAG4nUL5UHLXwNko1h8aEeT2jspBXegMgPJd8zcuag==` |

`lenis-1.3.26.min.js` had its trailing `sourceMappingURL` comment removed (the map is not shipped).

Usage rules in this app:
- Motion never invents data. Number tweens run only between two real values; nothing counts up from zero.
- Everything respects `prefers-reduced-motion: reduce` (animations and smooth scrolling are switched off).
- Lenis smooth scrolling is off on the Trade page (a trading terminal must scroll instantly); inner scroll areas
  carry `data-lenis-prevent`.
