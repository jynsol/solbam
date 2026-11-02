# Winter player v1

Original AI-generated character based on the approved Solbam winter guest concept: blue pompom beanie, cream coat, red scarf and brown boots.

Runtime PNG: 384 x 32, twelve 32 x 32 cells in one horizontal strip. Transparent background; maximum visible height 28 pixels; feet aligned to row 31. Generated poses were sliced, scaled with nearest-neighbor sampling, and indexed to a shared palette of up to 24 colors.

Zero-based frame order:
- 0–3: front idle / expression variations
- 4–7: right-facing walk cycle
- 8: attack windup
- 9: attack extension
- 10: attack recovery
- 11: celebration

The game draws the existing candy cane over the attack frames. The original player.png is retained for rollback. Animation timing and combat logic remain in game.js.
