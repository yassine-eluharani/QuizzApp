# App icon prompts (SnapAI / OpenAI)

Three starting prompts tuned for CloudPrep Quiz's dark-violet aesthetic.
Pick one, run, view the result, iterate. Each call costs ~$0.04.

## Setup (once)

```bash
brew install imagemagick
npx snapai config -k sk-proj-YOUR-OPENAI-KEY
npx snapai config --show     # confirm it took
```

> **Always pass `-m gpt-1`.** SnapAI's default model is `gpt-1.5` which maps to
> `gpt-image-1.5` — that model is gated and most accounts can't access it
> (returns 401 "Incorrect API key", which is misleading). `gpt-1` maps to
> `gpt-image-1`, which works on any verified OpenAI org.

## Generate

Run from the repo root. Output lands in `assets/icon-<timestamp>.png`.

### Option A — Minimalism (recommended; reads cleanest at thumbnail size)

```bash
npx snapai icon \
  -m gpt-1 \
  --prompt "App icon for a cloud certification exam prep app called CloudPrep. A clean, abstract stylized cloud shape composed of three soft overlapping rounded forms in deep violet (#6C63FF), with a small subtle check mark integrated into the lower-right of the cloud. Solid dark navy background (#0F0F14). Centered, generous padding, no text, no letters, no logo wordmark. Premium, calm, study-app aesthetic." \
  --background transparent --output-format png --quality high --style minimalism
```

### Option B — Geometric (bolder)

```bash
npx snapai icon \
  -m gpt-1 \
  --prompt "App icon for CloudPrep, a cloud certification quiz app. Abstract geometric composition: three layered hexagons in shades of violet (#6C63FF, #8B7FFF, #B5AEFF) suggesting three cloud platforms stacked, with the topmost hexagon containing a single white check mark. No text. Centered. Solid #0F0F14 dark background." \
  --background transparent --output-format png --quality high --style geometric
```

### Option C — Glassy (premium / iOS-26 feel)

```bash
npx snapai icon \
  -m gpt-1 \
  --prompt "Premium glass-morphism app icon for a cloud certification exam prep app. A semi-transparent frosted-glass cloud with subtle violet inner glow (#6C63FF), sitting on a dark navy gradient background (#0F0F14 to #1a1a2e). A small crisp white check mark centered inside the cloud. No text, no letters." \
  --background transparent --output-format png --quality high --style glassy
```

## After it lands

Tell me the output filename (e.g. `assets/icon-1714340000000.png`) and I'll:

1. Build the iOS 26 `.icon` folder at `assets/app-icon.icon/`
2. Generate the 66 %-scaled `assets/android-icon.png` for Android adaptive-icon safe area (uses ImageMagick)
3. Update `app.json` to point both `ios.icon` and `android.adaptiveIcon.*` at the new files
4. Run `npx tsc --noEmit` to confirm nothing breaks

If you don't love the result, just regenerate with a tweaked prompt — `--prompt "…"` is the only thing that needs to change. Each iteration is ~$0.04.
