# Store screenshots — generator

Two scripts:

| Script            | What it does                                                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `capture-app.cjs` | Boots a headless Chromium against the local web build of the app, seeds AsyncStorage with realistic data, navigates to Browse / Certification / Stats / Quiz / Paywall, and saves each as a PNG into `../screenshots-source/`.  |
| `render.cjs`      | Takes the PNGs from `../screenshots-source/`, overlays them on a marketing layout (headline + accent gradient + drop-shadow), and exports Play-Store-sized PNGs into `../output/`. Also generates the 1024×500 Feature Graphic. |

Both rely on `playwright` from the project's `node_modules` (added as a devDependency).

## Regenerating

```bash
# 1. Build the web bundle
cd ../..                                  # repo root
npx expo export -p web                    # outputs to dist/

# 2. Serve it (keep this terminal open in the bg)
npx serve dist -l 8765 -s --no-clipboard &

# 3. Capture raw app screens
NODE_PATH=$(pwd)/node_modules \
  node marketing/generator/capture-app.cjs

# 4. (Optional) Crop sources tighter — see README "Source crop notes" below

# 5. Render marketing slides + feature graphic
NODE_PATH=$(pwd)/node_modules \
  node marketing/generator/render.cjs

# 6. Stop the dev server
pkill -f 'serve dist'
```

Final assets land in `marketing/output/`. Upload those to Play Console.

## Source crop notes

The web export renders at viewport 1080×2400, but most app screens use only the
top portion. Pre-cropping with ImageMagick removes the dead bottom space so the
final phone-screen rendering reads at thumbnail size:

```bash
# Default crop for content-tall screens (Browse, Certification, Stats):
magick marketing/screenshots-source/<screen>.png \
  -gravity north -crop 1080x1700+0+0 +repage \
  marketing/screenshots-source/<screen>.png

# Tighter crop for screens with most content at the top (Quiz):
magick marketing/screenshots-source/quiz-answering.png \
  -gravity north -crop 1080x560+0+0 +repage \
  marketing/screenshots-source/quiz-answering.png

# Paywall: skip the empty top of the modal
magick marketing/screenshots-source/paywall.png \
  -gravity north -crop 1080x1500+0+700 +repage \
  marketing/screenshots-source/paywall.png
```

## Tweaking copy / theme

Open `render.cjs` and edit the `SLIDES` array (label, headline, accent,
bgGradient, src) and `featureGraphicHtml()` (title, tagline, pill labels).
No build step — just re-run `node render.cjs`.
