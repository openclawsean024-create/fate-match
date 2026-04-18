import { chromium } from 'playwright'

const BASE = 'https://fate-match.vercel.app'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  page.setDefaultTimeout(15000)

  const results = []

  try {
    // F-01: Save my data
    await page.goto(BASE)
    await page.waitForSelector('input[type="text"]')
    await page.fill('input[type="text"]', '小明')
    const dateInputs = await page.locator('input[type="date"]').all()
    await dateInputs[0].fill('1995-03-15')
    await page.click('button:has-text("儲存我的資料")')
    await page.waitForTimeout(800)
    const savedName = await page.locator('text=小明').count()
    results.push('F-01: ' + (savedName > 0 ? 'PASS' : 'FAIL'))

    // F-02: Add partner
    await page.click('button:has-text("對象名單")')
    await page.waitForTimeout(400)
    await page.click('button:has-text("新增")')
    await page.waitForTimeout(200)
    const addFormInputs = await page.locator('.space-y-3 input').all()
    await addFormInputs[0].fill('小美')
    await addFormInputs[1].fill('1997-07-22')
    await page.click('button:has-text("確認新增")')
    await page.waitForTimeout(600)
    const partnerAdded = await page.locator('text=小美').count()
    results.push('F-02: ' + (partnerAdded > 0 ? 'PASS' : 'FAIL'))

    // F-03: Select partner and run match (wait for result card)
    await page.click('text=小美')
    await page.waitForTimeout(400)
    await page.click('button:has-text("開始分析配對")')
    // Wait for result: loading is 2.5s, then score appears
    await page.waitForTimeout(3500)
    // Now wait for score element to appear
    let scoreFound = false
    for (let i = 0; i < 10; i++) {
      const scoreEls = await page.locator('.text-6xl').all()
      if (scoreEls.length > 0) {
        const score = await scoreEls[0].textContent()
        const n = parseInt(score || '-1')
        results.push('F-03: ' + (n >= 0 && n <= 100 ? 'PASS (' + score + ')' : 'FAIL (' + score + ')'))
        scoreFound = true
        break
      }
      await page.waitForTimeout(500)
    }
    if (!scoreFound) results.push('F-03: FAIL (no score after 5s)')

    // F-04a: Conclusion exists (wait a bit for DOM to settle)
    await page.waitForTimeout(1000)
    const allText = await page.locator('body').textContent()
    const hasConclusion = /金玉良緣|吉緣天成|中性緣分|挑戰緣分/.test(allText || '')
    results.push('F-04a: ' + (hasConclusion ? 'PASS' : 'FAIL'))

    // F-04b: Explanations
    const explanationEls = await page.locator('.leading-relaxed').all()
    results.push('F-04b: ' + (explanationEls.length >= 3 ? 'PASS (' + explanationEls.length + '句)' : 'FAIL (' + explanationEls.length + '句)'))

    // F-05: Share button
    const shareBtn = await page.locator('button:has-text("分享")').count()
    results.push('F-05: ' + (shareBtn > 0 ? 'PASS' : 'FAIL'))

    // F-06: Delete partner - go back to matchList tab, look for delete button
    await page.click('button:has-text("對象名單")')
    await page.waitForTimeout(500)
    const deleteButtons = await page.locator('[title="刪除"]').all()
    results.push('F-06 debug (delete buttons): ' + deleteButtons.length)
    if (deleteButtons.length > 0) {
      await deleteButtons[0].click()
      await page.waitForTimeout(800)
      // After delete, should not see "小美" in the list (but may see in history)
      // Only check partner list area (before the result card)
      // The result card shows "小美" but we need to check the list itself
      const listItems = await page.locator('.space-y-2 >> text=小美').count()
      results.push('F-06: ' + (listItems === 0 ? 'PASS' : 'FAIL'))
    } else {
      results.push('F-06: FAIL (no delete button)')
    }

    // F-07: History - clear result card state first by going to history
    await page.click('button:has-text("歷史記錄")')
    await page.waitForTimeout(500)
    const historyItems = await page.locator('text=小明').count()
    results.push('F-07: ' + (historyItems > 0 ? 'PASS' : 'FAIL'))

    // F-08a: Name validation - empty name
    await page.click('button:has-text("我的資料")')
    await page.waitForTimeout(300)
    await page.fill('input[type="text"]', '')
    const dateInputs2 = await page.locator('input[type="date"]').all()
    await dateInputs2[0].fill('')
    await page.click('button:has-text("儲存我的資料")')
    await page.waitForTimeout(300)
    const nameErr = await page.locator('text=請輸入姓名').count()
    const minLenErr = await page.locator('text=姓名至少').count()
    results.push('F-08a: ' + ((nameErr + minLenErr) > 0 ? 'PASS' : 'FAIL'))

    // F-08b: Future date validation
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const futureStr = futureDate.toISOString().split('T')[0]
    await page.fill('input[type="text"]', 'test')
    const dateInputs3 = await page.locator('input[type="date"]').all()
    await dateInputs3[0].fill(futureStr)
    await page.click('button:has-text("儲存我的資料")')
    await page.waitForTimeout(300)
    const futureError = await page.locator('text=不得為未來').count()
    results.push('F-08b: ' + (futureError > 0 ? 'PASS' : 'FAIL'))

  } catch (e) {
    results.push('ERROR: ' + e.message)
  }

  await browser.close()

  console.log('\n=== 驗收結果 ===')
  results.forEach(r => console.log(r))
  console.log('================')
}

run().catch(console.error)