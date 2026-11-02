# Christmas monsters v1

Built-in ImageGen created three original pixel-art sprites: gingerbread cookie (진저 쿠키), snowball (눈송이), Christmas tree imp (꼬마 트리). No external commercial asset pack was used.

Assets: en_fuzz-christmas-v1.png, en_slime-christmas-v1.png, en_mush-christmas-v1.png. Each is a 72×84 transparent PNG rendered at 24×28 logical units. Trimmed alpha bounds, nearest-neighbor scaling, common bottom baseline, binary alpha, 48-color palette. The high-resolution source is used for scene rendering, portraits and hit-flash silhouettes; logical canvases support existing defeat particles.

Art direction: one isolated front-facing full-body chibi winter RPG monster, stepped dark brown pixel outlines, warm limited palette, simple square pixel clusters, transparent background, no lettering or ground. Cookie: cinnamon body, cream icing cuffs/buttons, red holly bow. Snowball: pale blue snow shadows, red beanie and cream pompom, striped scarf, carrot nose and mittens. Tree imp: green fir layers, gold star, burgundy bow, red/gold ornaments, cream face and brown boots.

Opening and ending use exactly the three monsters, player, Sol and Bambi. Animal guest atlas is no longer loaded. Ambient bunnies are hidden during party scenes; adventure bunnies remain. The same six appear in the invitation illustration.

Validation: native Canvas render of opening and ending groups, all three encounters and hit flashes, dialog portraits, invitation, existing player animations and four restoration stages. Assertions check three monster guests, visible main cast, viewport bounds and party reset. JavaScript syntax passes. Physical-device/browser interaction was not tested in this environment.
