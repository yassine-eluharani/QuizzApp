# CloudPrep Quiz - Production Setup Guide

This document outlines all the steps needed to deploy CloudPrep Quiz to production on iOS and Android.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Apple Developer Account Setup](#apple-developer-account-setup)
3. [Google Play Developer Account Setup](#google-play-developer-account-setup)
4. [RevenueCat Setup](#revenuecat-setup)
5. [EAS Build Configuration](#eas-build-configuration)
6. [Optional: Supabase Backend Setup](#optional-supabase-backend-setup)
7. [Pre-Launch Checklist](#pre-launch-checklist)
8. [Security Notes](#security-notes)

---

## Prerequisites

- Node.js 18+ installed
- Yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Apple Developer Account ($99/year)
- Google Play Developer Account ($25 one-time)
- RevenueCat account (free tier available)

---

## Apple Developer Account Setup

### 1. Create Apple Developer Account

1. Go to [developer.apple.com](https://developer.apple.com)
2. Sign in with your Apple ID or create one
3. Enroll in the Apple Developer Program ($99/year)
4. Wait for approval (usually 24-48 hours)

### 2. Create App ID

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. Click the "+" button to add a new identifier
3. Select "App IDs" and click Continue
4. Select "App" and click Continue
5. Fill in:
   - **Description**: CloudPrep Quiz
   - **Bundle ID**: `com.levisine.CloudPrep` (Explicit)
6. Enable capabilities:
   - **In-App Purchase** (required for RevenueCat)
7. Click Continue and Register

### 3. Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platforms**: iOS
   - **Name**: CloudPrep Quiz
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: Select `com.levisine.CloudPrep`
   - **SKU**: `cloudprep-quiz-001`
   - **User Access**: Full Access
4. Click Create

### 4. Configure In-App Purchases

1. In App Store Connect, go to your app
2. Click "Features" → "In-App Purchases"
3. Click "+" to create a new IAP
4. Select **"Auto-Renewable Subscription"** (recommended) or **"Non-Consumable"**
5. Fill in:
   - **Reference Name**: CloudPrep Pro
   - **Product ID**: `cloudprep_pro` (remember this for RevenueCat)
6. Add pricing and localization
7. Submit for review

### 5. Create Subscription Group (if using subscriptions)

1. Go to "Features" → "Subscriptions"
2. Create a new Subscription Group: "CloudPrep Pro"
3. Add your subscription products

### 6. Get App Store Connect API Key (for EAS Submit)

1. Go to [Users and Access](https://appstoreconnect.apple.com/access/api)
2. Click "Keys" tab
3. Click "+" to generate a new key
4. Name: "EAS CLI"
5. Access: "Admin" or "App Manager"
6. Download the .p8 file (you can only download once!)
7. Note the Key ID and Issuer ID

---

## Google Play Developer Account Setup

### 1. Create Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Pay the $25 registration fee
4. Complete identity verification (may take a few days)

### 2. Create App in Play Console

1. Click "Create app"
2. Fill in:
   - **App name**: CloudPrep Quiz
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free (with in-app purchases)
3. Accept declarations and click Create

### 3. Configure In-App Products

1. Go to your app → "Monetize" → "Products" → "In-app products"
2. Click "Create product"
3. Fill in:
   - **Product ID**: `cloudprep_pro` (same as iOS for simplicity)
   - **Name**: CloudPrep Pro
   - **Description**: Unlock all quizzes and features
   - **Price**: Set your price
4. Click Save and Activate

### 4. Create Service Account for EAS

1. Go to "Setup" → "API access"
2. Click "Create new service account"
3. Follow the link to Google Cloud Console
4. Create a new service account:
   - Name: `eas-submit`
   - Role: "Service Account User"
5. Create a JSON key and download it
6. Back in Play Console, grant the service account these permissions:
   - "Release apps to production track"
   - "Manage store listings"

### 5. Enable Google Play Billing API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to "APIs & Services" → "Enable APIs"
4. Search for "Google Play Android Developer API"
5. Enable it

---

## RevenueCat Setup

### 1. Create RevenueCat Account

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Sign up for a free account
3. Create a new project: "CloudPrep Quiz"

### 2. Configure iOS App

1. In RevenueCat, go to your project → "Apps"
2. Click "New" → Select "App Store"
3. Fill in:
   - **App name**: CloudPrep Quiz iOS
   - **Bundle ID**: `com.levisine.CloudPrep`
4. Get your **Apple App-Specific Shared Secret**:
   - In App Store Connect → Your App → "General" → "App Information"
   - Scroll to "App-Specific Shared Secret"
   - Click "Manage" → "Generate"
   - Copy the secret and paste in RevenueCat
5. Note your **RevenueCat Apple API Key** (starts with `appl_`)

### 3. Configure Android App

1. In RevenueCat, go to your project → "Apps"
2. Click "New" → Select "Play Store"
3. Fill in:
   - **App name**: CloudPrep Quiz Android
   - **Package Name**: `com.levisine.CloudPrep`
4. Upload your Google Play service account JSON credentials
5. Note your **RevenueCat Google API Key** (starts with `goog_`)

### 4. Create Entitlement

1. Go to "Entitlements" in your RevenueCat project
2. Click "New"
3. Create an entitlement:
   - **Identifier**: `pro` (this matches the code)
   - **Description**: Pro access to all features

### 5. Create Offering

1. Go to "Offerings" in your RevenueCat project
2. Create a new offering or edit "default"
3. Add your products:
   - Attach iOS product: `cloudprep_pro`
   - Attach Android product: `cloudprep_pro`
4. Associate the `pro` entitlement with these products

### 6. Update App Configuration

Add your API keys to `app.json`:

```json
{
  "expo": {
    "extra": {
      "revenueCatAppleApiKey": "appl_YOUR_KEY_HERE",
      "revenueCatGoogleApiKey": "goog_YOUR_KEY_HERE"
    }
  }
}
```

**IMPORTANT**: For production, use EAS secrets instead:

```bash
eas secret:create --name REVENUECAT_APPLE_API_KEY --value "appl_YOUR_KEY"
eas secret:create --name REVENUECAT_GOOGLE_API_KEY --value "goog_YOUR_KEY"
```

Then reference them in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "REVENUECAT_APPLE_API_KEY": "@REVENUECAT_APPLE_API_KEY",
        "REVENUECAT_GOOGLE_API_KEY": "@REVENUECAT_GOOGLE_API_KEY"
      }
    }
  }
}
```

---

## EAS Build Configuration

### 1. Login to EAS

```bash
eas login
```

### 2. Configure Project

```bash
eas build:configure
```

### 3. Update eas.json

The `eas.json` file should already be configured. Update the submit section with your credentials:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "123456789",
        "appleTeamId": "ABCD1234"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "internal"
      }
    }
  }
}
```

### 4. Build for iOS

```bash
# Preview build (for TestFlight internal testing)
eas build --platform ios --profile preview

# Production build (for App Store)
eas build --platform ios --profile production
```

### 5. Build for Android

```bash
# Preview build (APK for internal testing)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

### 6. Submit to Stores

```bash
# Submit iOS build to App Store Connect
eas submit --platform ios

# Submit Android build to Play Store
eas submit --platform android
```

---

## Optional: Supabase Backend Setup

For enhanced security and features, consider adding a Supabase backend.

### Why Add a Backend?

- **Server-side purchase validation** - Verify receipts on your server
- **Cross-device sync** - Sync progress across devices
- **Question serving** - Don't bundle questions in the app
- **Analytics** - Track user behavior
- **Harder to crack** - API requires authentication

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Database Schema

Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table (extends Supabase auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMP WITH TIME ZONE,
  device_ids TEXT[] DEFAULT '{}'
);

-- Quiz attempts
CREATE TABLE public.attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  quiz_id TEXT NOT NULL,
  certification_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL NOT NULL,
  time_taken INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  question_id TEXT NOT NULL,
  certification_id TEXT,
  quiz_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own attempts" ON public.attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks
  FOR ALL USING (auth.uid() = user_id);
```

### 3. Edge Function for Purchase Validation

Create a Supabase Edge Function to validate RevenueCat purchases:

```typescript
// supabase/functions/validate-purchase/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const REVENUECAT_API_KEY = Deno.env.get('REVENUECAT_API_KEY');

serve(async (req) => {
  const { user_id, app_user_id } = await req.json();

  // Verify with RevenueCat
  const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${app_user_id}`, {
    headers: {
      Authorization: `Bearer ${REVENUECAT_API_KEY}`,
    },
  });

  const data = await response.json();
  const isPro = data.subscriber?.entitlements?.pro?.is_active === true;

  // Update database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  await supabase.from('profiles').update({ is_pro: isPro }).eq('id', user_id);

  return new Response(JSON.stringify({ isPro }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### 4. RevenueCat Webhook

1. In RevenueCat, go to your project → "Integrations" → "Webhooks"
2. Add a new webhook pointing to your Supabase Edge Function
3. This will automatically update user status on purchases/cancellations

---

## Pre-Launch Checklist

### App Store (iOS)

- [ ] App icon (1024x1024)
- [ ] Screenshots for all required device sizes
- [ ] App description (up to 4000 characters)
- [ ] Keywords (up to 100 characters)
- [ ] Support URL
- [ ] Privacy Policy URL
- [ ] Marketing URL (optional)
- [ ] Age rating questionnaire completed
- [ ] App Review Information (demo account if needed)
- [ ] In-App Purchases submitted for review

### Play Store (Android)

- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (minimum 2)
- [ ] Short description (80 characters)
- [ ] Full description (4000 characters)
- [ ] Privacy Policy URL
- [ ] App category selected
- [ ] Content rating questionnaire completed
- [ ] Target audience declaration
- [ ] Data safety form completed
- [ ] In-App Products published

### Legal Requirements

- [ ] Privacy Policy created and hosted
- [ ] Terms of Service created and hosted
- [ ] GDPR compliance (if targeting EU)
- [ ] CCPA compliance (if targeting California)

### Testing

- [ ] Test purchases work on iOS (Sandbox)
- [ ] Test purchases work on Android (License testing)
- [ ] Test restore purchases
- [ ] Test on real devices (not just simulators)
- [ ] Test offline behavior
- [ ] Test all quiz flows

---

## Security Notes

### Current Security Measures

The app implements several layers of security:

1. **Obfuscated strings** - Sensitive identifiers are built at runtime
2. **Multi-layer validation** - Access checks run through multiple functions
3. **Integrity checks** - Bundle ID, debug mode, and tampering detection
4. **Secure storage** - Entitlement cache uses signed data with integrity verification
5. **ProGuard/R8** - Android builds use code shrinking and obfuscation
6. **Terser minification** - JS bundle is minified with mangled names

### What This Protects Against

- Casual piracy (changing a single boolean)
- Simple APK/IPA modifications
- Memory editors (partially)
- Basic reverse engineering

### What This Doesn't Protect Against

- Determined attackers with time and skills
- Complete decompilation and analysis
- Runtime hooking frameworks (Frida, etc.)
- Jailbroken/rooted devices (partially mitigated)

### Recommended Additional Measures

For higher security (if needed):

1. **Add a backend** (see Supabase section)
   - Serve questions from API instead of bundling
   - Server-side entitlement verification

2. **Native integrity checking**
   - Use `jail-monkey` or similar native modules
   - More thorough root/jailbreak detection

3. **Certificate pinning**
   - Pin RevenueCat certificates
   - Prevents MITM attacks

4. **Code obfuscation services**
   - Consider services like [PreEmptive](https://www.preemptive.com/) for enterprise-level obfuscation

5. **Monitoring**
   - Track suspicious patterns (too many failed checks)
   - Rate limiting on sensitive operations

---

## Environment Variables Reference

| Variable                    | Where to Set           | Description                |
| --------------------------- | ---------------------- | -------------------------- |
| `REVENUECAT_APPLE_API_KEY`  | EAS Secrets / app.json | RevenueCat iOS API key     |
| `REVENUECAT_GOOGLE_API_KEY` | EAS Secrets / app.json | RevenueCat Android API key |
| `SUPABASE_URL`              | app.json (if using)    | Supabase project URL       |
| `SUPABASE_ANON_KEY`         | app.json (if using)    | Supabase anonymous key     |

---

## Support

For issues with:

- **EAS Build**: [Expo Forums](https://forums.expo.dev)
- **RevenueCat**: [RevenueCat Support](https://www.revenuecat.com/support)
- **App Store**: [Apple Developer Forums](https://developer.apple.com/forums/)
- **Play Store**: [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
