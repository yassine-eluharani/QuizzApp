# Contributing & release workflow

This document describes the branching model, the CI/CD pipeline, and what
secrets need to exist on GitHub for releases to work.

## Branches

| Branch               | Purpose                                                                                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`               | Production. Every push triggers an Android EAS Build (production profile) and submits to the Google Play **internal testing** track. Protected — only merge via pull request. |
| `dev`                | Default branch for new work. CI runs typecheck + lint + format + tests on every push and every PR. No store releases.                                                         |
| `feature/*`, `fix/*` | Short-lived topic branches off `dev`. Open PR into `dev` when ready.                                                                                                          |

### Day-to-day flow

```bash
# 1. Start work
git checkout dev
git pull
git checkout -b feature/my-thing

# 2. Commit + push
git commit -m "feat: my thing"
git push -u origin feature/my-thing

# 3. Open PR into `dev` → wait for green CI → squash-merge

# 4. When dev is stable and ready to ship:
#    open a PR from `dev` into `main` → merge → release pipeline runs.
```

### Branch protection (configure on GitHub)

On both `main` and `dev`:

- Require a pull request before merging
- Require status checks to pass (`Frontend`, `Backend`)
- Require linear history (squash-merge only, no merge commits)
- Disallow direct pushes to `main`

## CI workflow (`.github/workflows/ci.yml`)

Runs on every push and PR to `main` or `dev`. Two parallel jobs:

| Job      | What it runs                                                       |
| -------- | ------------------------------------------------------------------ |
| Frontend | `yarn typecheck`, `yarn lint`, `yarn format:check`, `yarn test:ci` |
| Backend  | `cd backend && yarn typecheck && yarn lint`                        |

Both must pass before merge.

## Release workflow (`.github/workflows/release-android.yml`)

Triggers:

- **Automatic** on every push to `main` → builds with the `production` EAS profile and submits to Google Play internal track.
- **Manual** via Actions → "Release (Android)" → "Run workflow" → choose `production` or `preview`, choose whether to submit.

Steps performed:

1. Checkout, install Node + Yarn deps, install EAS CLI.
2. `eas build --platform android --profile <chosen> --non-interactive`.
3. (Optional) Decode the Google Play service-account JSON from a secret, then `eas submit --platform android --latest --non-interactive`.

The workflow blocks (`--no-wait=false`) until the EAS Build cloud job completes, so the submit step has a known artefact.

## GitHub Secrets you must configure

Open **Settings → Secrets and variables → Actions → Repository secrets** and add:

| Secret                               | Where to get it                                                                                                                                                                | Purpose                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `EXPO_TOKEN`                         | `eas login` then `eas whoami --json` → use a long-lived access token from https://expo.dev/settings/access-tokens                                                              | Lets the workflow auth with EAS to start builds and submissions.                                                  |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_BASE64` | The JSON file you downloaded from Google Cloud Console for the EAS-Submit service account, base64-encoded: `base64 -i ~/cloudprep-play-service-account.json \| pbcopy` (macOS) | Used by `eas submit` to authenticate to Google Play.                                                              |
| `REVENUECAT_GOOGLE_API_KEY`          | RevenueCat dashboard → Project settings → API Keys → Google SDK Key (`goog_…`)                                                                                                 | Injected as the `REVENUECAT_GOOGLE_API_KEY` env var during `eas build` (matches `eas.json:build.production.env`). |

If `GOOGLE_PLAY_SERVICE_ACCOUNT_BASE64` is missing, the workflow build still succeeds but the submit step fails with a clear error. To skip submit for a given run, use the manual "Run workflow" trigger and set `submit=false`.

## Local pre-commit

Husky + lint-staged are configured. After `yarn install`, the pre-commit hook automatically runs ESLint + Prettier on staged TS/TSX files. No extra config needed.

To bypass the hook in an emergency only: `git commit --no-verify` (do not make a habit of this).

## Release versioning

`eas.json` has `cli.appVersionSource: "remote"` and `build.production.autoIncrement: true`. EAS manages the build number remotely — you never need to edit `app.json:ios.buildNumber` or `android.versionCode` by hand for production builds.

To bump the user-visible **version** (e.g. 1.0.0 → 1.1.0), edit `app.json:expo.version` and commit. Push to `main` to release.

## What the release workflow assumes (one-time setup)

1. Google Play app exists and is in "Internal testing" status with at least one tester added (see `docs/store-listing.md`).
2. Service account is granted **Releases (Admin)** + **Store presence (View)** permissions in Play Console → Setup → API access.
3. EAS project is linked (`extra.eas.projectId` in `app.json` already set).
4. First Android build was done locally with `eas build --platform android --profile production` so EAS has generated and saved the keystore. Subsequent builds (including CI) reuse that keystore automatically.
