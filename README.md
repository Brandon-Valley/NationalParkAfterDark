# NationalParkAfterDark

Mobile-first browser prototype for **Park After Dark**, a fictional parody national park dating simulator.

## Run

Open `index.html` directly in a browser. There is no build step, package manager, backend, or external dependency.

## Structure

- `index.html` contains all game logic, scene data, UI, styling, save/load/reset, gallery, and ParkTok overlay behavior.
- `assets/backgrounds` contains normalized background image names.
- `assets/characters` contains normalized character sprite names.
- `assets/cg` contains unlockable CG images.
- `assets/ui` contains source UI art references.

## Iteration Notes

The game is intentionally data-driven for quick LLM iteration:

- Add or edit dialogue in the `scenes` object.
- Add fake vertical-video clips in `parkTokMoments`.
- Add gallery entries in `cgLibrary`.
- Keep all gameplay JavaScript in `index.html` for the first prototype.

The app falls back to CSS backgrounds and character name cards if image assets are missing.
