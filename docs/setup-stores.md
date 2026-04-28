# Setting up Google Play Console + RevenueCat

This walks you through both, in the order they actually depend on each other.
Skip ahead at your own risk — RevenueCat asks for things only Play Console can
provide, and Play Console asks for an AAB built by `eas build`, which needs
the keystore EAS only generates on first run.

---

## TL;DR — order of operations

1. **Play Console — create the app shell** (Phase A)
2. **Google Cloud — service account JSON** (Phase B)
3. **First local `eas build`** (Phase C) — generates the Android keystore EAS will reuse forever
4. **Play Console — upload that first AAB** (Phase D) — kicks off Google's mandatory first-time review (~hours to days)
5. **Play Console — create the `pro_lifetime` in-app product** (Phase E)
6. **RevenueCat — set up project, link Play, create offering** (Phase F)
7. **Wire the new keys into the codebase** (Phase G)
8. **Re-build + submit a second AAB with RC enabled** (Phase H)

You can do **Phase A right now** without anything else. After that it's mostly
linear.

---

## Phase A — Play Console: create the app shell (~15 min)

You need this to exist before anything else can reference your package name.

1. Open https://play.google.com/console — sign in with the developer account you verified.
2. **All apps → Create app** (top right).
3. Fill in:
   - **App name:** `CloudPrep Quiz`
   - **Default language:** English (United States) — or your preferred locale
   - **App or game:** App
   - **Free or paid:** Free
   - **Declarations:** tick both ("I have read and agree…", "I confirm the app meets developer policies")
4. **Create app**. You land on the app dashboard.
5. Note the **package name** Play Console will associate with this app — by default it's pulled from your first AAB upload. Make sure it matches `com.levisine.Quiz` (the one in `app.json`). If Play Console asks now, type that exactly.

You now have an empty app entry. Don't fill out the store listing yet — come back to it after Phase D when you also have screenshots/icon to upload.

---

## Phase B — Google Cloud: service account JSON (~20 min)

This single JSON file is used by both **EAS Submit** (to push AABs) and **RevenueCat** (to verify purchases). Download once, use twice.

### B.1 Create the Cloud project

1. Open https://console.cloud.google.com.
2. Top-left dropdown → **New Project** → name it `cloudprep-quiz-play` (or any name; this is internal). Wait a few seconds for it to provision, then make sure it's selected in the top dropdown.

### B.2 Enable the Play Developer API

1. Hamburger menu (☰, top-left) → **APIs & Services → Library**.
2. Search for `Google Play Android Developer API`. Click it.
3. **Enable**. (Wait a few seconds.)

### B.3 Create the service account

1. Hamburger → **IAM & Admin → Service Accounts**.
2. **+ Create service account** at the top.
3. **Service account name:** `eas-play-submit` → **Create and continue**.
4. The next step ("Grant this service account access to project") — **Skip / Continue** with no role. We grant permissions in Play Console, not Cloud.
5. Final step ("Grant users access to this service account") — **Done**.

### B.4 Generate the JSON key

1. You're back on the service-accounts list. Click on the row you just created (`eas-play-submit@…iam.gserviceaccount.com`).
2. **Keys** tab → **Add Key → Create new key → JSON → Create**.
3. The browser downloads a file like `cloudprep-quiz-play-XXXXXX.json`.
4. **Move it somewhere safe and OUTSIDE the repo.** Recommended: `~/cloudprep-play-service-account.json`. Treat it like a password — anyone with this file can publish AABs as you.

Record the absolute path here for later reference: ************\_\_\_************

### B.5 Grant the service account access in Play Console

This step has to happen AFTER Phase A (the app needs to exist for you to grant access to it).

1. Back to https://play.google.com/console.
2. Left sidebar → **Setup → API access**.
3. Play Console asks to link your Cloud project — accept. Pick `cloudprep-quiz-play`.
4. Scroll to the **Service accounts** section. Find your `eas-play-submit@…` row.
5. Click **Manage Play Console permissions** (or "Grant access").
6. **App permissions** tab → **Add app** → tick **CloudPrep Quiz** → **Apply**.
7. **Account permissions** tab → tick:
   - **Releases → Releases (Admin)**
   - **Store presence → View store listing, pricing & distribution**
     Leave everything else off. (Principle of least privilege.)
8. **Invite user → Send invitation**.

**You're done with Cloud + Play API access.** The same JSON file is now used by EAS Submit and (next phase) RevenueCat.

---

## Phase C — First local `eas build` (~25 min)

This is the one-time bootstrap. EAS generates an Android keystore for you, builds the AAB, and from now on every CI build (or any future local build) reuses that keystore. Lose the keystore = lose the ability to update your app on Play, so let EAS manage it (it's stored in your Expo account).

```bash
# install EAS CLI globally if you haven't
npm install -g eas-cli

# log in (browser opens)
eas login
eas whoami            # sanity check

# from the repo root
cd /Users/yassine/Developer/Projects/Quiz
eas build --platform android --profile production
```

When prompted:

- **"Generate a new Android Keystore?"** → **Yes**.
- EAS prints recovery info — copy it somewhere safe (1Password etc.).

The build runs in EAS cloud (~15–25 min). When it finishes you get a URL like `https://expo.dev/accounts/…/projects/quiz/builds/<id>`. Open it and download the AAB.

---

## Phase D — Play Console: upload the first AAB + add testers (~15 min)

1. Play Console → your app → left sidebar → **Testing → Internal testing**.
2. **Create new release** (top right).
3. **Upload** → drag in the AAB you downloaded.
4. **Release name:** auto-fills (e.g. `1 (1.0.0)`).
5. **Release notes:** anything — `Internal testing build 1.` is fine for the first one.
6. **Save → Review release → Start rollout to Internal testing**.

   First-time apps trigger Google's mandatory review. Status will sit at "Under review" for a few hours to a few days. You can't promote to production until it's approved, but you CAN keep iterating on internal builds.

7. **Testers** tab on the same Internal testing page → **Create email list** → add your own email + anyone else who should test → **Save**.
8. Copy the **opt-in link** at the bottom. Open it on your Android device → accept → install via Play Store.

While Google reviews, continue with phases E–H.

---

## Phase E — Play Console: create the `pro_lifetime` in-app product (~5 min)

You need this product to exist in Play before RevenueCat can attach it to an entitlement.

1. Play Console → your app → left sidebar → **Monetize → Products → In-app products**.
2. **Create product**.
3. Fill in:
   - **Product ID:** `pro_lifetime` ← MUST match exactly what RC will reference. Lowercase, no spaces, no underscores other than the one. Cannot be changed later.
   - **Name:** `CloudPrep Pro`
   - **Description:** `Lifetime access to all quizzes and practice exams across every certification.`
4. **Set price** → pick your launch price. Suggestion: **$9.99 USD** (Play auto-fills regional equivalents). Click **Apply prices**.
5. **Activate** the product (top of the page, status pill needs to be "Active").

---

## Phase F — RevenueCat: project + Android app + entitlement + offering (~20 min)

### F.1 Create the project

1. Sign up at https://app.revenuecat.com if you haven't.
2. **+ New project** → name `CloudPrep Quiz` → **Create**.

### F.2 Add the Android app

1. Inside the project → sidebar **Apps → + New app**.
2. Choose **Google Play Store**.
3. Fill in:
   - **App name:** `CloudPrep Quiz Android`
   - **Package name:** `com.levisine.Quiz` (must match `app.json` exactly)
4. **Service Account Credentials** — upload the JSON from Phase B.4 (`cloudprep-play-service-account.json`).
5. **Save**. RC takes a minute or so to verify the credentials. Wait for the green checkmark before continuing.

### F.3 Create the entitlement

1. Sidebar → **Entitlements → + New**.
2. **Identifier:** `pro` (must be exactly `pro` — the app references this string in `lib/purchases.ts`).
3. **Display name:** `Pro` → **Add**.

### F.4 Attach the product

1. Sidebar → **Products → + New**.
2. **Identifier:** `pro_lifetime` (must match the Play Console product ID from Phase E).
3. **Type:** **Non-consumable** (lifetime — never expires).
4. **Save**. RC fetches metadata from Play (price, etc.) within a minute.
5. Open the just-created product → in the **Entitlements** section, attach it to the `pro` entitlement.

### F.5 Create the offering

The "offering" is what `Purchases.getOfferings()` returns to your app — it's the bundle of products the paywall shows.

1. Sidebar → **Offerings → + New**.
2. **Identifier:** `default` → **Save**.
3. Inside the new offering → **+ Add package** → choose:
   - **Identifier:** `lifetime` (or any string)
   - **Product:** select `pro_lifetime`
     → **Save**.
4. Mark this offering as **Current** (button at the top of the offering page). Without this, `offerings.current` is `null` in the app and the paywall fails.

### F.6 Grab the keys

You need three values:

| What                                   | Where in RC                                                                                                                                                                                                                                                                         | Goes into                                                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Google SDK Key** (`goog_…`)          | sidebar **Project settings → API Keys → Public app-specific API keys → Google**                                                                                                                                                                                                     | `app.json:extra.revenueCatGoogleApiKey` and `eas.json:build.{preview,production}.env.REVENUECAT_GOOGLE_API_KEY` |
| **Secret API Key** (`sk_…`)            | sidebar **Project settings → API Keys → Secret API keys → + New** → name `cloudprep-backend` → Create. Copy the value RIGHT AWAY (RC only shows it once).                                                                                                                           | `backend/.env:REVENUECAT_SECRET_KEY`                                                                            |
| **Webhook authorization header value** | sidebar **Integrations → Webhooks → + New webhook** → URL: `https://your-api.example.com/webhooks/revenuecat` (use a placeholder for now if backend isn't deployed), **Authorization header value**: generate a random string with `openssl rand -hex 32` and paste here. **Save**. | `backend/.env:REVENUECAT_WEBHOOK_AUTH`                                                                          |

---

## Phase G — Wire the new keys into the codebase (~3 min)

Replace placeholders in three places:

**`app.json`** (lines ~75–76):

```jsonc
"extra": {
  ...
  "revenueCatAppleApiKey": "",                  // leave blank for now (Android first)
  "revenueCatGoogleApiKey": "goog_PASTE_HERE"   // ← from Phase F.6
}
```

**`eas.json`** (preview + production env blocks):

```jsonc
"preview": {
  ...
  "env": {
    "REVENUECAT_APPLE_API_KEY": "",
    "REVENUECAT_GOOGLE_API_KEY": "goog_PASTE_HERE"
  }
},
"production": {
  ...
  "env": {
    "REVENUECAT_APPLE_API_KEY": "",
    "REVENUECAT_GOOGLE_API_KEY": "goog_PASTE_HERE"
  }
}
```

**`backend/.env`** (the local one — gitignored):

```bash
REVENUECAT_SECRET_KEY=sk_PASTE_HERE
REVENUECAT_WEBHOOK_AUTH=PASTE_THE_RANDOM_HEX_FROM_F.6
```

Restart the backend so it picks up the new env vars:

```bash
cd backend
docker compose restart api
docker compose logs --tail=20 api    # should show cloudprep_api_started, no auth errors
```

---

## Phase H — Re-build and re-submit (~25 min build + a few minutes submit)

```bash
cd /Users/yassine/Developer/Projects/Quiz
eas build --platform android --profile production
```

When it finishes:

```bash
# Either upload the AAB to Play Console manually (same as Phase D), or:
eas submit --platform android --latest --profile production
```

For `eas submit` to work without prompting for credentials, you need to either:

- Pass the JSON path inline: `eas submit --platform android --latest --profile production --key ~/cloudprep-play-service-account.json`
- OR add `serviceAccountKeyPath` to `eas.json:submit.production.android` pointing at the absolute path on your machine. **Not recommended** — that path is local to you, breaks for anyone else, and shouldn't end up in git.
- OR, the right pattern for CI: store the JSON contents in a GitHub secret (`GOOGLE_PLAY_SERVICE_ACCOUNT_BASE64`) and let the release workflow decode it at runtime. Already wired up in `.github/workflows/release-android.yml`.

The new release goes onto the same Internal testing track. Once it's live (a minute or two), open the app on your tester device → tap "Unlock CloudPrep Pro" → Google Play sandbox flow appears → complete the test purchase → verify Pro unlocks (sample-only quizzes become available, exam mode unlocks, bookmark cap removed).

---

## Sanity checks at each phase

- **After Phase A:** Play Console dashboard shows the app with "Set up your app" tasklist; package name is `com.levisine.Quiz`.
- **After Phase B:** running `cat ~/cloudprep-play-service-account.json | jq .client_email` shows `eas-play-submit@cloudprep-quiz-play.iam.gserviceaccount.com` (or similar). Play Console → Setup → API access shows the service account row with green "Granted" status against your app.
- **After Phase C:** EAS dashboard shows a green build artifact; downloading the AAB gives you a ~30–80 MB file.
- **After Phase D:** Play Console → Internal testing → Releases shows the build under review or live; opt-in link installs the app on your device.
- **After Phase E:** Play Console → Monetize → Products → In-app products shows `pro_lifetime` Active.
- **After Phase F:** RC dashboard → Customers → searching your test Google account shows them with no entitlements yet, and Offerings → default has the `lifetime` package listed under "Current".
- **After Phase G:** `git diff app.json eas.json` shows the `goog_…` value in three places; `cat backend/.env | grep REVENUECAT` shows real `sk_…` and a hex auth value.
- **After Phase H:** the Pro purchase flow completes end-to-end on a real Android device using a tester account.
