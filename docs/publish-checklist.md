# Publishing checklist (Android first)

> Working file. Tick items as they're done. Anything left at "todo" blocks shipping.

## Status snapshot (2026-04-28)

**Done** (sections 1, 2, 3 + partial 7):

- Privacy policy hosted on GitHub Pages
- App icon generated, wired into iOS `.icon` folder + Android adaptive (foreground/background/monochrome) + 512×512 listing icon
- 5 phone screenshots + 1 Feature Graphic generated and saved to `marketing/output/`
- Repo on `main` as default branch, `EXPO_TOKEN` GitHub secret added

**Blocking the first AAB submission** (sections 4–8):

1. Google Cloud + Play service account (section 5) — needed for `eas submit`
2. First local `eas build` (section 6) — generates the Android keystore EAS reuses forever
3. Manual AAB upload to Play Console internal testing (section 6) — kicks off Google's first-time review
4. Play Console form-filling (section 8) — store listing, content rating, data safety
5. RevenueCat (section 4) — only needed when you want the Pro paywall to be functional in TestFlight; the app ships fine without it (free tier works, paywall shows a banner)
6. Remaining GitHub secrets (section 7) — only needed once you want pushes to `main` to auto-build + auto-submit

## 1. Privacy policy hosting

- [x] Push `docs/` to `main` on GitHub
- [x] GitHub → Settings → Pages → Source: Deploy from branch → Branch `main` / folder `/docs`
- [x] Verify the URL resolves: `https://yassine-eluharani.github.io/QuizzApp/privacy/`
- [x] Replace the `<your-github-username>/<your-repo-name>` placeholder in `docs/store-listing.md` with the real URL

## 2. App icon (1024×1024 transparent PNG)

- [x] `brew install imagemagick`
- [x] OpenAI API key configured (`npx snapai config -k …`)
- [x] Generated `assets/icon-1777406673249.png` (glassy violet cloud + check)
- [x] `assets/app-icon.icon/Assets/icon.png` + `icon.json` (iOS 26 Liquid Glass folder)
- [x] `assets/android-icon.png` (66 % scaled, ImageMagick)
- [x] `assets/icon-512.png` (Play Console listing icon, no alpha, dark bg)
- [x] `app.json:ios.icon` → `./assets/app-icon.icon`
- [x] `app.json:android.adaptiveIcon.{foregroundImage,backgroundImage,monochromeImage}` → `./assets/android-icon.png`
- [ ] Visual sanity check on Android emulator (after first `eas build`)

## 3. Phone screenshots (Play Console requires ≥ 2)

Auto-generated via `marketing/generator/render.cjs`. See `marketing/generator/README.md`.

- [x] Captured 5 raw app screens via web build + Playwright (`marketing/screenshots-source/`)
- [x] Marketing layout applied — labels, headlines, accent gradients, drop shadows
- [x] 5 final phone screenshots in `marketing/output/`:
  - `01-hero-1080x1920.png` — "Pass your cloud cert."
  - `02-free-1080x1920.png` — "First quiz free. Every cert."
  - `03-real-questions-1080x1920.png` — "Real questions, real explanations."
  - `04-progress-1080x1920.png` — "Score trends. Daily streaks."
  - `05-pro-1080x1920.png` — "Unlock everything. One-time purchase."
- [x] 1 Feature Graphic in `marketing/output/feature-graphic-1024x500.png`
- [ ] Optional v2: re-capture quiz screen at native resolution (current web capture has small text)
- [ ] Upload all 6 PNGs to Play Console → Main store listing → Graphics

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

- [x] Set default branch to `main` (Pages serves from `main` → must be default)
- [ ] ~~Branch protection on `main` and `dev`~~ — skipped for now (solo dev). Revisit if collaborators join.
- [ ] Add secrets:
  - [x] `EXPO_TOKEN`
  - [ ] `GOOGLE_PLAY_SERVICE_ACCOUNT_BASE64` (`base64 -i path/to/sa.json | pbcopy`)
  - [ ] `REVENUECAT_GOOGLE_API_KEY` (`goog_…` from RC)

## 8. Play Console pre-launch

- [ ] App content → all checklist items green (data safety, content rating, target audience, etc.)
- [ ] Main store listing → name, short + full description, screenshots, feature graphic, icon
- [ ] App pricing → Free
- [ ] Internal testing track → at least one tester email + first build uploaded

When all of the above is green, push to `main` and the pipeline takes over.
