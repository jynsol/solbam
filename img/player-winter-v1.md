# Winter characters

Original generated winter character art approved for Solbam; not copied from the referenced commercial asset pack.

`player-winter-v1.png`, `sol-winter-v1.png`, `bambi-winter-v1.png` each contain twelve 96×96 transparent frames in a horizontal 1152×96 strip. Runtime display size is 32×32 logical units; the scene canvas renders at 3× resolution to retain facial detail. Feet share the bottom baseline. Nearest-neighbor scaling, hard alpha and a 48-color palette avoid blurred outlines.

Slots 0–3 idle/blink, 4–7 walk, 8–10 player attack, 11 cheer. NPC idle/walk poses repeat intentionally; NPCs have no combat animation. Santa has no visible mouth. Rudolph's nose glow follows the frame and mirrors when walking left. Original assets remain for reference; monster assets are unchanged.

Forest restoration: stage 1 lights and gold garlands, stage 2 baubles, stage 3 presents. Ambient darkness drops from .90 to .62, .34 and .12. The 2.2-second restoration reveal precedes the invitation-piece modal.

Validation: JavaScript syntax; native Canvas rendering of twelve-frame atlases, six player animation states, NPCs, invitation portrait, and four restoration stages. Browser/device interaction was not run in this environment.
