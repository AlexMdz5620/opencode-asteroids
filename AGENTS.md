# AGENTS.md

## Project

Single-file HTML5 Canvas game (Asteroids clone). Zero dependencies, no build system, no bundler. All game logic lives in `game.js` (~420 lines). UI text and comments are in Spanish.

## Run

- Open `index.html` in a browser, or:
  ```bash
  npx serve .
  ```

## Structure

- `index.html` — minimal shell, loads `game.js`
- `game.js` — entire game: input, physics, rendering, HUD, game loop
- `favicon.svg` — site icon

## Conventions

- `'use strict'` at top of `game.js`
- All code in a single file, no modules/imports
- Canvas is fixed 800x600
- Game states: `'playing'` | `'dead'` | `'gameover'` (set in global `state` variable)
- Asteroid sizes: 3 (large), 2 (medium), 1 (small); split on destruction
- Constants (radii, speeds, points) are index-1 arrays: `RADII[3]` = large asteroid radius

## Gotchas

- `wrap()` handles toroidal world (objects wrap edges)
- `pressed()` is a one-frame key event (auto-resets); `keys` is held state
- Ship has 3s invincibility on respawn; flickers via `Math.floor(invincible * 8) % 2`
- `dt` is clamped to 0.05s max to prevent physics explosion on tab-switch
- No test suite, no linting, no typechecking
