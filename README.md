# NationalParkAfterDark

Mobile-first browser prototype for **Park After Dark**, a fictional parody national park dating simulator.

## Run

Open `index.html` directly in a browser. There is no build step, package manager, backend, or external dependency.

## Structure

- `index.html` contains all game logic, scene data, UI, styling, save/load/reset, gallery, and ParkTok overlay behavior.
- `assets/audio` contains licensed music loops and replacement UI sound effects.
- `assets/backgrounds` contains normalized background image names.
- `assets/charactures` contains one folder per love interest, with `neutral`, `blushing`, `grumpy`, and `laughing` portraits.
- `assets/cg` contains unlockable CG images.
- `assets/ui` contains source UI art references.

## Iteration Notes

The game is intentionally data-driven for quick LLM iteration:

- Add or edit dialogue in the `scenes` object.
- Add fake vertical-video clips in `parkTokMoments`.
- Add gallery entries in `cgLibrary`.
- Keep all gameplay JavaScript in `index.html` for the first prototype.

The app falls back to CSS backgrounds and character name cards if image assets are missing.

## Audio Credits

Music:
"Almost Bliss", "Clear Air", "Evening", "Windswept", "On My Way", "Morning", "Fireflies and Stardust", and "Crowd Hammer" by Kevin MacLeod ([Incompetech](https://incompetech.com/)), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Sound effects:
"Button Click Sound Effect (CC0/Public Domain)" by qubodup ([OpenGameArt](https://opengameart.org/content/button-click-sound-effect-cc0public-domain)), CC0.
"Creaky Door Hinge Spooky" by w.forster.1@gmail.com ([OpenGameArt](https://opengameart.org/content/creaky-door-hinge-spooky)), CC0.
"Opening and Closing a Map Sounds" by Spring Spring ([OpenGameArt](https://opengameart.org/content/opening-and-closing-a-map-sounds)), CC0.
"Chimey UI Sounds" by MouseBYTE ([OpenGameArt](https://opengameart.org/content/chimey-ui-sounds)), CC0.
