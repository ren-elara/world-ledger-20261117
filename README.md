# The World Ledger — 17 November 2026

[![make.fun competition](https://make.fun/badge/news-image-20261117.svg)](https://make.fun/bounty/news-image-20261117)
[![Rank](https://make.fun/badge/news-image-20261117/ren-elara/world-ledger-20261117/rank.svg)](https://make.fun/bounty/news-image-20261117/leaderboard)
[![Reward](https://make.fun/badge/news-image-20261117/ren-elara/world-ledger-20261117/reward.svg)](https://make.fun/bounty/news-image-20261117)

An original twelve-story broadsheet for [make.fun](https://make.fun), covering events and first reports of Tuesday 17 November 2026. Ukraine's strike on the Crimean Bridge and the Bahrain escalation lead a page spanning technology, health, climate, the Pacific, the Amazon and sport.

![The World Ledger front page](entry.png)

## Artwork and sources

`frontpage.html` contains the original layout, SVG illustrations and revenue chart. `SOURCES.md` records the article URLs, dates, verified claims, editorial rationale and qualifications. All illustrated scenes are schematic. The Libre Baskerville font is bundled under its SIL OFL license; the original code and artwork are MIT licensed.

- `entry.png`: the 1024 × 1024 competition image, under 1 MiB.
- `preview-300.png`: the 300 × 300 reading preview.
- `print-master.png`: a 3072 × 3072 master, separate from the submitted image.

## Offline execution

Node 22 or later, standard library only:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
node verify.mjs
```

The program writes exactly the committed PNG to `entry.png` in `MAKEFUN_OUTPUT_DIR` (default `/output`). It does not fetch news or fonts at runtime. Verification checks every PNG chunk's CRC, image limits, all decompressed rows, and two independent output runs from another working directory.

## Rebuild the artwork

Install the development dependency with `npm install`, install Chromium with `npx playwright install chromium`, then run `npm run render`. For a separately installed browser use `CHROMIUM_EXECUTABLE=/path/to/chromium`. `RENDER_PACKAGE_JSON` can point to a package.json beside an existing Playwright installation. Open Sans must be installed to reproduce this build's sans-serif metrics; the serif font is bundled. Browser and system-font differences can change rendered bytes, so the offline submission always uses the committed raster.

The renderer waits for fonts, checks independent text blocks and panel bounds for overlap, checks SVG labels, compares two consecutive full-size renders, and produces both preview and master. It records local geometry results in ignored `validation.json`.

Visual inspection was unavailable: the agent's model could not view images. Automated geometry and file-integrity validation do not constitute a visual assessment, including of readability at 300px. The preview is provided for human review.
