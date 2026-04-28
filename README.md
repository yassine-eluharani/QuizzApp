# CloudPrep Quiz

Mobile cloud-certification exam prep app — AWS, Azure, GCP and DevOps tools — built with React Native + Expo.

A free sample quiz and the first quiz of every certification are unlocked for everyone. **CloudPrep Pro** is a one-time in-app purchase (RevenueCat) that unlocks the rest of the catalogue plus timed practice exams.

## Stack

| Layer            | Technology                                            |
| ---------------- | ----------------------------------------------------- |
| Mobile framework | React Native 0.81 + Expo SDK 54                       |
| Routing          | expo-router 6 (file-based)                            |
| Language         | TypeScript 5.9 (strict)                               |
| Styling          | NativeWind 4 (Tailwind for RN) + StyleSheet           |
| State            | React Context (`AppContext`, `PurchaseContext`)       |
| Storage          | AsyncStorage + expo-secure-store                      |
| Monetization     | react-native-purchases (RevenueCat)                   |
| Crypto           | expo-crypto + @noble/hashes (HMAC)                    |
| Backend          | Express + TypeScript + Postgres + Docker (`backend/`) |
| Build            | EAS Build / EAS Submit                                |
| Package manager  | Yarn                                                  |

Node version is pinned in `.nvmrc` (Node 20 LTS).

## Quickstart

```bash
# Install dependencies
yarn install

# Start the dev server
yarn start            # then press i / a / w for iOS / Android / web

# Type check
yarn typecheck

# Lint + format
yarn lint
yarn format

# Tests
yarn test
```

For full setup — RevenueCat, EAS Build, App Store / Play Store accounts and the
backend stack — see [`SETUP.md`](./SETUP.md).

## Project layout

```
app/                 expo-router screens (file-based routing)
components/          UI, quiz, browse, paywall components
context/             AppContext (history, bookmarks, streaks) + PurchaseContext
lib/                 security (HMAC, integrity), purchases (RC), accessControl,
                     storage (AsyncStorage), questionLoader, entitlements, utils
assets/              fonts, icons, splash, quiz JSON content
constants/           Colors, Theme
hooks/               quiz/exam/timer hooks
backend/             Express API (Postgres, push notifications, RC webhook)
.github/             CI workflows + Dependabot config
```

## Backend

The backend lives in [`backend/`](./backend) and ships with its own
`Dockerfile`, `docker-compose.yml`, `.env.example`, and migrations. To run it
locally:

```bash
cd backend
cp .env.example .env       # fill in real values
docker compose up -d
```

Migrations run automatically on boot via `node-pg-migrate`. Health checks live
at `/health/live` and `/health/ready`.

## Pre-commit

Husky + lint-staged run on every commit (ESLint, Prettier). Make sure to
`yarn install` once after cloning so the hook is installed.

## License

Proprietary. All rights reserved.
