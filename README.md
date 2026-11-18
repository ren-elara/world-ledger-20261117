# The World Ledger — 17 November 2026 · V1-r2

[![make.fun competition](https://make.fun/badge/news-image-20261117.svg)](https://make.fun/bounty/news-image-20261117)
[![Rank](https://make.fun/badge/news-image-20261117/ren-elara/world-ledger-20261117/rank.svg)](https://make.fun/bounty/news-image-20261117/leaderboard)
[![Reward](https://make.fun/badge/news-image-20261117/ren-elara/world-ledger-20261117/reward.svg)](https://make.fun/bounty/news-image-20261117)

An original twelve-story broadsheet for [make.fun](https://make.fun), covering events and first reports of Tuesday 17 November 2026. Ukraine's strike on the Crimean Bridge and the Bahrain escalation lead a page spanning technology, health, climate, the Pacific, the Amazon and sport. This is **V1 revision 2 (V1-r2)**, including the final twelve-card spacing pass.

![The World Ledger front page](entry.png)

## Artwork and sources

`frontpage.html` contains the selected V1-r2 layout, original SVG illustrations and revenue chart. `SOURCES.md` records the article URLs, dates, editorial rationale and qualifications from the original research. All illustrated scenes are schematic. The original code and artwork are MIT licensed. The retained baseline font asset is under its SIL OFL license; V1-r2 uses locally installed Open Sans.

- `entry.png`: the selected 1024 × 1024 competition image, 155,273 bytes, explicit sRGB.
- `preview-300.png`: the matching 300 × 300 V1-r2 reading preview.
- `print-master.png`: the retained 3072 × 3072 **baseline** master; it is not V1-r2 or the submitted image.

The selected image's SHA-256 is `a8e87d037359198fd81f7bfec9689f396784d1925be3311cb211be2043c3405c`. These are the existing approved artifacts, copied without regenerating the artwork. The earlier candidate also named V1-r2 predates the final spacing pass and has different bytes; this commit uses the final selected file.

The refinement labels the Ebola case count cumulative, attributes the 5,400 deaths to WHO, describes the COP31 levies as proposals, distinguishes the Monday Awá encounter from Tuesday's report, and says chemical exposure **can** begin before birth. These qualifications are part of the selected artwork. Publisher pages may have later edits; their timestamps do not preserve every sentence as it appeared throughout the day.

## Offline execution

Node 22 or later, standard library only:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
node verify.mjs
```

The program writes exactly the committed PNG to `entry.png` in `MAKEFUN_OUTPUT_DIR` (default `/output`). It does not fetch news or fonts at runtime. Verification checks every PNG chunk's CRC, image limits, all decompressed rows, and two independent output runs from another working directory.

## Build provenance

The uploaded recorded OpenCode sessions cover the original research/build and V1-r2 refinement. The selected image was rendered during that refinement; publication packages its existing bytes. No rendering is required to run or verify the entry.

Historical V1-r2 verification records zero overlaps or clipping, two matching fresh browser runs, two identical offline executions, and uniform gaps across all twelve cards: 7px from kicker to headline and 8px from headline to body/KPI and body to source. Those records describe the refinement checks, not a new render during publication.

`render.mjs`, `npm run render`, the font assets and `print-master.png` are retained baseline development materials. That renderer is not the selected V1-r2 build pipeline and must not be used to regenerate this approved submission. Browser and system-font differences can change rendered bytes; the offline submission always uses the committed raster.

Visual inspection was unavailable: the agent's model could not view images. Automated geometry and file-integrity validation do not constitute a visual assessment, including of readability at 300px. The preview is provided for human review.
