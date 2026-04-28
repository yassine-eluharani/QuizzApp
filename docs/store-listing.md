# Google Play store-listing copy

> Working file — paste these values into Play Console → Main store listing.
> Not for end users; do not link this from `index.md`.

---

## App name (max 30 chars)

```
CloudPrep Quiz
```

(14 chars — fits cleanly. Alternatives: `CloudPrep — Cert Practice` (25 chars), `CloudPrep: AWS Azure GCP` (25 chars).)

## Short description (max 80 chars)

Pick one and use it as a tagline everywhere (Play, App Store, marketing site):

```
Practice quizzes for AWS, Azure, GCP and DevOps cloud certifications.
```

(70 chars). Alternatives:

- `Cloud certification exam practice — AWS, Azure, GCP, DevOps & more.` (68)
- `Real exam-style quizzes for AWS, Azure, GCP and DevOps certs. Offline.` (72)
- `Cloud certs in your pocket — AWS, Azure, GCP, Kubernetes and beyond.` (69)

## Full description (max 4000 chars)

Paste this whole block into Play Console. Markdown is **not** rendered there — newlines and bullets show as plain text, which is what we want.

```text
CloudPrep Quiz is the focused way to prepare for cloud certification exams. Real exam-style multiple-choice questions, detailed explanations, and a clean dark-mode interface designed to be used in the gaps of your day — on the train, in the queue, on a break.

★ COVER THE FOUR MAJOR CLOUD STACKS

  • AWS — Solutions Architect Associate (SAA), Developer Associate (DVA), SysOps Administrator (SOA), DevOps Engineer Professional (DOP)
  • Microsoft Azure — AZ-900 Fundamentals, AZ-104 Administrator, AZ-305 Solutions Architect Expert
  • Google Cloud — Associate Cloud Engineer (ACE), Professional Cloud Architect (PCA), Professional Data Engineer (PDE)
  • DevOps tools — Terraform Associate, Certified Kubernetes Administrator (CKA), Docker Certified Associate (DCA)

★ HOW IT WORKS

  Practice mode — answer one question at a time, get immediate feedback, read a detailed explanation of why each answer is correct or incorrect.

  Exam mode (Pro) — full-length timed practice exams that mirror the real test format. No feedback during the exam, just your final score and a question-by-question review at the end.

  Bookmark — save tricky questions and review them later in the Study tab.

  Stats — see your best score per quiz, attempts per certification, and your daily study streak.

★ FREE FOREVER

  • A free sample quiz for every certification — try the format risk-free.
  • The first quiz of every certification, unlocked for everyone.
  • Up to 25 bookmarked questions on the free tier.

★ CLOUDPREP PRO — ONE-TIME PURCHASE

  • Unlock every quiz across every certification.
  • Unlock practice Exam mode with timers and post-exam review.
  • Unlimited bookmarks.
  • Lifetime access — pay once, no subscription.

★ DESIGNED FOR FOCUS

  • Dark mode by default, easy on the eyes during long study sessions.
  • Works fully offline once installed — no account required, no email signup.
  • No ads. No third-party trackers. No analytics SDKs.
  • Your history, bookmarks and streaks live only on your device.

★ PRIVACY

  CloudPrep Quiz does not collect personal information. Quiz history and bookmarks are stored locally on your device. Purchases are processed through Google Play; we do not receive your payment details. Read the full policy at https://<your-github-username>.github.io/<your-repo-name>/privacy/

★ FEEDBACK

  Found a question that needs improvement? Want a certification we don't yet cover? Email us at eluharaniyassine@gmail.com — we read every message.

Good luck on your exam.
```

(2,820 chars including spaces — well under the 4000 limit.)

⚠️ **Replace** the `https://<your-github-username>.github.io/<your-repo-name>/privacy/` URL with your actual GitHub Pages URL once you've enabled Pages.

## Category

```
Application category: Education
```

(Optional secondary tag in Play Console: "Educational".)

## Tags (Play Console may auto-populate; refine if needed)

```
cloud computing, certification, AWS, Azure, GCP, DevOps, exam prep, study, quiz, kubernetes
```

## Contact details

```
Email:        eluharaniyassine@gmail.com
Website:      (optional — your GitHub Pages URL is fine, or skip)
Phone:        (optional, leave blank)
Privacy URL:  https://<your-github-username>.github.io/<your-repo-name>/privacy/
```

## Content rating questionnaire — answer key

For an educational quiz app with no objectionable content, the IARC questionnaire answers are:

| Question                 | Answer                         |
| ------------------------ | ------------------------------ |
| Violence                 | None                           |
| Sexuality                | None                           |
| Language                 | None                           |
| Controlled substances    | None                           |
| Gambling                 | None                           |
| User-generated content   | None                           |
| Shares user location     | No                             |
| Allows users to interact | No                             |
| Digital purchases        | **Yes** (one-time IAP for Pro) |

Expected rating: **3+ / Everyone** in all jurisdictions.

## Data safety form — answer key

Open Play Console → App content → Data safety. Use these answers:

**Does your app collect or share any of the required user data types?** **Yes**
**Is all of the user data collected by your app encrypted in transit?** **Yes**
**Do you provide a way for users to request that their data be deleted?** **Yes** (via the support email)

Then declare these data types:

| Category            | Type                    | Collected | Shared | Optional? | Purposes                            |
| ------------------- | ----------------------- | --------- | ------ | --------- | ----------------------------------- |
| Financial info      | **Purchase history**    | Yes       | No     | No        | App functionality, Fraud prevention |
| App activity        | **App interactions**    | No        | —      | —         | —                                   |
| Device or other IDs | **Device or other IDs** | Yes       | No     | No        | App functionality, Fraud prevention |

Mark Purchase history and Device IDs as **Required** (not optional) and **not used for advertising**.

Everything else: **Not collected**.

## Target audience

```
Target age group: 18+ (or 13+ if you want to broaden reach)
Appeals to children: No
```

## Pricing

```
Free with in-app purchases
In-app product: CloudPrep Pro (one-time, non-consumable)
```

Set the Pro price in Play Console → Monetize → Products → In-app products. Recommended starting price: $9.99 USD (Play Console will auto-fill regional equivalents).

## Promotional graphics checklist

| Asset                             | Spec                          | Status                                                                 |
| --------------------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| App icon                          | 512×512, 32-bit PNG, no alpha | TODO — generate via app-icon skill                                     |
| Feature graphic                   | 1024×500 PNG/JPG              | TODO — generate via app-store-screenshots skill                        |
| Phone screenshots (min 2, max 8)  | 1080×1920 portrait PNG/JPG    | TODO — capture from emulator → run through app-store-screenshots skill |
| Promo video (optional)            | YouTube URL                   | Skip for first launch                                                  |
| 7" tablet screenshots (optional)  | 1200×1920                     | Skip for first launch                                                  |
| 10" tablet screenshots (optional) | 1600×2560                     | Skip for first launch                                                  |
