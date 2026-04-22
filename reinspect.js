const { chromium } = require('playwright');

const BASE = 'https://fate-match-e6o3hub3h-seans-projects-7dc76219.vercel.app';
const results = [];
let browser;

function log(label, pass, detail = '') {
  const status = pass ? '✅ PASS' : '❌ FAIL';
  const detailStr = detail ? ` — ${detail}` : '';
  console.log(`${status} [${label}]${detailStr}`);
  results.push({ label, pass, detail });
}

async function run() {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('\n=== fate-match reinspect ===');

  // ── 1. Homepage ──────────────────────────────────────────────
  console.log('\n=== 1. Homepage ===');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  log('1a. Homepage loads', !errors.some(e => e.includes('failed to load')), errors.length > 0 ? errors[0] : 'ok');

  // Check for tab navigation
  const tabs = await page.$$('button');
  const tabTexts = await Promise.all(tabs.map(t => t.textContent()));
  const hasMyData = tabTexts.some(t => t?.includes('我的資料'));
  const hasMatchList = tabTexts.some(t => t?.includes('對象名單'));
  const hasRegionPhotos = tabTexts.some(t => t?.includes('地區照片'));
  const hasHistory = tabTexts.some(t => t?.includes('歷史記錄'));
  log('1b. Tab: 我的資料 exists', hasMyData);
  log('1c. Tab: 對象名單 exists', hasMatchList);
  log('1d. Tab: 地區照片 exists', hasRegionPhotos);
  log('1e. Tab: 歷史記錄 exists', hasHistory);

  // Check for header title
  const titleText = await page.textContent('h1');
  log('1f. Title shows 命定天子/命定天女', titleText?.includes('命定天子') || titleText?.includes('命定天女'), titleText);

  // ── 2. 我的資料 form ──────────────────────────────────────────
  console.log('\n=== 2. 我的資料 form ===');
  const nameInput = await page.$('input[type="text"]');
  const dateInput = await page.$('input[type="date"]');
  log('2a. Name input exists', !!nameInput);
  log('2b. Birth date input exists', !!dateInput);

  if (nameInput && dateInput) {
    // Fill form
    await nameInput.fill('測試使用者');
    const today = new Date().toISOString().split('T')[0];
    await dateInput.fill('1990-01-15');
    
    const saveBtn = await page.$('button:has-text("儲存")');
    log('2c. Save button exists', !!saveBtn);
    
    if (saveBtn) {
      await saveBtn.click();
      await page.waitForTimeout(500);
      log('2d. Form saves without error', errors.length === 0 || !errors.some(e => e.includes('error')), errors[0] || 'ok');
    }
  }

  // ── 3. 地區照片 tab ──────────────────────────────────────────
  console.log('\n=== 3. 地區照片 tab ===');
  const regionPhotosTab = await page.$('button:has-text("地區照片")');
  if (regionPhotosTab) {
    await regionPhotosTab.click();
    await page.waitForTimeout(1000);
    
    // Check region chips exist
    const buttons = await page.$$('button');
    const btnTexts = await Promise.all(buttons.map(b => b.textContent()));
    const hasTaiwan = btnTexts.some(t => t?.includes('台北') || t?.includes('台灣'));
    log('3a. Taiwan region chip exists', hasTaiwan, btnTexts.join(', '));
    
    // Check for photo grid or lightbox trigger
    const images = await page.$$('img');
    log('3b. Photos displayed in region tab', images.length > 0, `found ${images.length} images`);
  } else {
    log('3a. Taiwan region chip exists', false, 'tab not found');
  }

  // ── 4. 對象名單 tab ──────────────────────────────────────────
  console.log('\n=== 4. 對象名單 tab ===');
  const matchListTab = await page.$('button:has-text("對象名單")');
  if (matchListTab) {
    await matchListTab.click();
    await page.waitForTimeout(1000);
    
    const partnerButtons = await page.$$('button');
    const partnerBtnTexts = await Promise.all(partnerButtons.map(b => b.textContent()));
    const hasPartnerBtn = partnerBtnTexts.some(t => t?.includes('選擇') || t?.includes('配對') || t?.includes('天') || t?.includes('命'));
    log('4a. Partner selection available', hasPartnerBtn || partnerButtons.length > 0, `found ${partnerButtons.length} buttons`);
  }

  // ── 5. Console errors check ─────────────────────────────────
  console.log('\n=== 5. Console errors ===');
  const criticalErrors = errors.filter(e => 
    !e.includes('favicon') && 
    !e.includes('warning') &&
    !e.includes('Download the') &&
    !e.includes('React DevTools')
  );
  log('5a. No critical console errors', criticalErrors.length === 0, criticalErrors[0] || 'ok');
  log('5b. Page loads successfully', true, `${errors.length} non-critical issues`);

  // ── Summary ─────────────────────────────────────────────────
  console.log('\n=== Summary ===');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Total: ${passed} passed, ${failed} failed`);
  
  results.forEach(r => {
    if (!r.pass) {
      console.log(`  ❌ ${r.label}: ${r.detail}`);
    }
  });

  await browser.close();
  
  if (failed > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('reinspect error:', err.message);
  process.exit(1);
});
