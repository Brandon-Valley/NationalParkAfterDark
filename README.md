# NationalParkAfterDark

Mobile-first browser prototype for **Park After Dark**, a fictional parody national park dating simulator.

## Run

Open `index.html` directly in a browser. There is no build step, package manager, backend, or external dependency.

## Structure

- `index.html` contains the app shell, styling, save/load/reset controls, gallery markup, and developer panel markup.
- `game.js` contains the game logic, scene data, time-of-day loop, relationship scoring, travel events, save/load/reset, and gallery behavior.
- `assets/audio` contains licensed music loops and replacement UI sound effects.
- `assets/backgrounds/time_variants` contains normalized location folders with `daytime`, `sunset`, and `night` background variants.
- `assets/charactures` contains one folder per love interest, with `neutral`, `blushing`, `grumpy`, and `laughing` portraits.
- `assets/cg` contains unlockable CG images.
- `assets/ui` contains source UI art references.

## Iteration Notes

The game is intentionally data-driven for quick LLM iteration:

- Add or edit dialogue in the `scenes` object and `parkFlavor` data in `game.js`.
- Add gallery entries in `cgLibrary`.
- Keep gameplay systems data-driven so routes, times of day, and check-in encounters can be expanded without one-off scene routing.

The app falls back to CSS backgrounds and character name cards if image assets are missing.

## Credits

UI art:

"Old Parchment Paper" by cron ([OpenGameArt](https://opengameart.org/content/old-parchment-paper)), CC0.

Music:
"Almost Bliss", "Clear Air", "Evening", "Windswept", "On My Way", "Morning", "Fireflies and Stardust", "Crowd Hammer", "There is Romance", "Anamalie", "Slow Burn", "Sardana", "Heartwarming", "Your Call", and "Volatile Reaction" by Kevin MacLeod ([Incompetech](https://incompetech.com/)), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
"Firesong" by Kevin MacLeod ([Incompetech](https://incompetech.com/)), licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
"Native American Spirit Ritual" by Sounova Music ([Pixabay](https://pixabay.com/music/)), royalty-free under the Pixabay Content License.

Sound effects:
"Button Click Sound Effect (CC0/Public Domain)" by qubodup ([OpenGameArt](https://opengameart.org/content/button-click-sound-effect-cc0public-domain)), CC0.
"Creaky Door Hinge Spooky" by w.forster.1@gmail.com ([OpenGameArt](https://opengameart.org/content/creaky-door-hinge-spooky)), CC0.
"Opening and Closing a Map Sounds" by Spring Spring ([OpenGameArt](https://opengameart.org/content/opening-and-closing-a-map-sounds)), CC0.
"Chimey UI Sounds" by MouseBYTE ([OpenGameArt](https://opengameart.org/content/chimey-ui-sounds)), CC0.
"Rain (loopable)" by Ylmir ([OpenGameArt](https://opengameart.org/content/rain-loopable)), CC0.
"Rain On The Roof" by Roman Lipatov ([Directory.Audio](https://directory.audio/sound-effects/weather/1372-rain-on-the-roof)), CC0.
"Bird chirping sounds" by syncopika ([OpenGameArt](https://opengameart.org/content/bird-chirping-sounds)), CC0.
