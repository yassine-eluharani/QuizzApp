# Publishing checklist (Android first)

> Working file. Tick items as they're done. Anything left at "todo" blocks shipping.

## 1. Privacy policy hosting

- [ ] Push `docs/` to `main` on GitHub
- [ ] GitHub → Settings → Pages → Source: Deploy from branch → Branch `main` / folder `/docs`
- [ ] Verify the URL resolves: `https://yassine-eluharani.github.io/QuizzApp/privacy/`
- [ ] Replace the `<your-github-username>/<your-repo-name>` placeholder in `docs/store-listing.md` with the real URL

## 2. App icon (1024×1024 transparent PNG)

Prereqs:

- [ ] `brew install imagemagick` (for the Android-safe-area scaler)
- [ ] OpenAI API key for SnapAI: https://platform.openai.com/api-keys (~$0.04 per icon)
- [ ] `npx snapai config --api-key sk-…`

Generate (pick one of the prompts in `docs/store-listing.md` notes, or iterate with a custom one):

```bash
npx snapai icon \
  --prompt "<see options A/B/C>" \
  --background transparent --output-format png --quality high --style minimalism
```

Output goes to `assets/icon-<timestamp>.png`. Then I'll wire:

- [ ] `assets/app-icon.icon/Assets/icon.png` + `assets/app-icon.icon/icon.json` (iOS 26 Liquid Glass folder)
- [ ] `assets/android-icon.png` (66 % scaled, ImageMagick)
- [ ] `app.json:ios.icon` → `./assets/app-icon.icon`
- [ ] `app.json:android.adaptiveIcon.foregroundImage / backgroundImage / monochromeImage` → `./assets/android-icon.png`
- [ ] Visual sanity check on iOS and Android simulators (no text legibility issues at the 48 dp launcher size)

The Play Console listing icon (the 512×512) is exported from the same source — I'll handle that step.

## 3. Phone screenshots (Play Console requires ≥ 2)

Capture in this order from a clean Android emulator at 1080×1920 (or higher):

- [ ] Browse tab (home)
- [ ] A quiz mid-question with one answer selected
- [ ] The explanation sheet open
- [ ] Stats tab with at least 3 completed attempts
- [ ] Paywall

Save the PNGs into `marketing/screenshots-source/` (gitignored). Then run the `app-store-screenshots` skill to overlay them on phone mockups, add headlines, and export at all required Play sizes:

```bash
# I'll scaffold the Next.js generator project at:
mkdir -p marketing/screenshot-generator
# (then walk through the skill workflow)
```

Output: 5 finished phone screenshots + 1 Feature Graphic (1024×500) ready to upload.

## 4. RevenueCat (Android only for now)

- [ ] Create RevenueCat account, project, Android app (`com.levisine.Quiz`)
- [ ] Upload Play service-account JSON in RC
- [ ] Create entitlement `pro`, product `pro_lifetime` (non-consumable) in RC
- [ ] Mirror the product in Play Console → Monetize → In-app products with the **same product ID**
- [ ] Create RC offering `default` containing the `pro_lifetime` package, mark as Current
- [ ] Copy the Google SDK API key (`goog_…`) and the webhook authorization header value
- [ ] Update locally:
  - `app.json:extra.revenueCatGoogleApiKey` = `goog_…`
  - `eas.json:build.production.env.REVENUECAT_GOOGLE_API_KEY` = `goog_…`
  - `backend/.env:REVENUECAT_SECRET_KEY` = `sk_…` (server-side secret from RC)
  - `backend/.env:REVENUECAT_WEBHOOK_AUTH` = the value you set in RC dashboard webhook config

## 5. Google Cloud / Play service account (for EAS Submit)

- [ ] Google Cloud Console → new project (or reuse) → enable "Google Play Android Developer API"
- [ ] Create service account `eas-play-submit`, no roles needed
- [ ] Service account → Keys → Add Key → JSON → download
- [ ] Play Console → Setup → API access → link Cloud project → grant the service account **Releases (Admin)** + **Store presence (View)**
- [ ] Save the JSON outside the repo; record the absolute path here: `__________________________`

## 6. Local first-time build (mandatory before CI can release)

EAS auto-generates the Android keystore on first build. CI re-uses it. Run this **once** locally:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile production
# Follow prompts; say YES to "generate new keystore". Save the recovery info EAS prints.
```

When the build URL appears, download the AAB, upload it manually to Play Console → Internal testing → Create new release. This:

- Uploads the very first build for Google's mandatory app review (~few hours to ~3 days)
- Creates the keystore in EAS's project store

After that one-time setup, every push to `main` will auto-build + auto-submit via CI.

## 7. GitHub repo configuration

- [ ] Set default branch to `main` (Settings → Branches)
- [ ] Branch protection on `main` and `dev` (see `CONTRIBUTING.md`)
- [ ] Add secrets:
  - [ ] `EXPO_TOKEN` (from https://expo.dev/settings/access-tokens)
  - [ ] `GOOGLE_PLAY_SERVICE_ACCOUNT_BASE64` (`base64 -i path/to/sa.json | pbcopy`)
  - [ ] `REVENUECAT_GOOGLE_API_KEY` (`goog_…` from RC)

## 8. Play Console pre-launch

- [ ] App content → all checklist items green (data safety, content rating, target audience, etc.)
- [ ] Main store listing → name, short + full description, screenshots, feature graphic, icon
- [ ] App pricing → Free
- [ ] Internal testing track → at least one tester email + first build uploaded

When all of the above is green, push to `main` and the pipeline takes over.
