const { chromium } = require('playwright');

const BASE = 'http://localhost:8765';

const seed = `
  localStorage.setItem('@onboarding_complete', 'true');
  localStorage.setItem('@schema_version', '1');
  const today = new Date().toISOString().split('T')[0];
  const yest = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twodaysago = new Date(Date.now() - 172800000).toISOString().split('T')[0];
  localStorage.setItem('@streaks', JSON.stringify({
    currentStreak: 7, longestStreak: 12,
    lastStudyDate: today,
    studyDates: [twodaysago, yest, today],
  }));
  localStorage.setItem('@history', JSON.stringify([
    { id: 'a1', quizId: 'aws-saa-quiz-1', certificationId: 'aws-saa', mode: 'quiz',
      score: 54, totalQuestions: 65, percentage: 83, timeTaken: 1820,
      date: new Date().toISOString(), answers: [] },
    { id: 'a2', quizId: 'aws-saa-quiz-2', certificationId: 'aws-saa', mode: 'quiz',
      score: 49, totalQuestions: 65, percentage: 75, timeTaken: 1995,
      date: new Date(Date.now() - 86400000).toISOString(), answers: [] },
    { id: 'a3', quizId: 'azure-az900-quiz-1', certificationId: 'azure-az900', mode: 'quiz',
      score: 42, totalQuestions: 50, percentage: 84, timeTaken: 1410,
      date: new Date(Date.now() - 172800000).toISOString(), answers: [] },
  ]));
`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1080, height: 2400 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  await ctx.addInitScript(seed);

  // Simple captures.
  for (const r of [
    { path: '/',                       file: 'browse.png',        wait: 3000 },
    { path: '/certification/aws-saa',  file: 'certification.png', wait: 3000 },
    { path: '/(tabs)/stats',           file: 'stats.png',         wait: 3500 },
    { path: '/quiz/aws-saa-quiz-1',    file: 'quiz.png',          wait: 4500 },
  ]) {
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error('[pageerror]', r.path, e.message));
    try {
      await page.goto(`${BASE}${r.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      console.error('[goto]', r.path, e.message);
    }
    await page.waitForTimeout(r.wait);
    await page.screenshot({ path: `marketing/screenshots-source/${r.file}` });
    console.log('captured', r.file);
    await page.close();
  }

  // Paywall: open certification page, then click the "Unlock →" upsell strip.
  {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/certification/aws-saa`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    // The upsell text contains "more quizzes + practice exam with Pro" — click it.
    const trigger = page.getByText(/more quizzes \+ practice exam with Pro/i).first();
    await trigger.click({ force: true });
    await page.waitForTimeout(2000); // wait for modal animation
    // Strip the "Purchases temporarily unavailable" banner — it shows because
    // RC keys are intentionally empty in this build, but in marketing material
    // we want the paywall to look like its production state.
    await page.evaluate(() => {
      document.querySelectorAll('[role="alert"]').forEach((el) => {
        if (/temporarily unavailable/i.test(el.textContent || '')) el.remove();
      });
      document.querySelectorAll('button[disabled]').forEach((b) => {
        b.removeAttribute('disabled');
        b.style.opacity = '1';
        b.style.background = '#6C63FF';
      });
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'marketing/screenshots-source/paywall.png' });
    console.log('captured paywall.png');
    await page.close();
  }

  // Quiz mid-flow: load quiz, click first answer choice so we get the
  // selection-state rendering (not just the blank question).
  {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/quiz/aws-saa-quiz-1`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
    // Choice buttons have accessibilityLabel "Option A: ...". On web that
    // becomes aria-label.
    const optionA = page.locator('[aria-label^="Option A"]').first();
    if (await optionA.count()) {
      await optionA.click({ force: true });
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: 'marketing/screenshots-source/quiz-answering.png' });
    console.log('captured quiz-answering.png');
    await page.close();
  }

  await browser.close();
})().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
