const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://127.0.0.1:5001');
  await page.waitForTimeout(1000);

  const canvas = await page.$('#pinball');
  const box = await canvas.boundingBox();
  const plungerX = box.x + box.width - 20;
  const plungerY = box.y + box.height - 100;

  // Launch 5 balls
  for (let i = 0; i < 5; i++) {
    console.log(`Launching ball ${i + 1}...`);

    // Click launch button to get ball ready
    await page.click('#btnLaunch');
    await page.waitForTimeout(300);

    // Hold plunger to charge
    await page.mouse.move(plungerX, plungerY);
    await page.mouse.down();
    await page.waitForTimeout(600 + Math.random() * 400); // Random charge time
    await page.mouse.up();

    // Wait for ball to land
    await page.waitForTimeout(3000);
  }

  // Take final screenshot
  await page.screenshot({ path: 'pinball-test-final.png' });
  console.log('Final screenshot saved!');

  // Check results
  const results = await page.evaluate(() => {
    const groups = [];
    for (let i = 0; i < 6; i++) {
      const box = document.querySelector(`.group-box:nth-child(${i + 1})`);
      if (box) {
        const members = box.querySelectorAll('.group-member');
        groups.push(members.length);
      }
    }
    return groups;
  });
  console.log('Group counts:', results);
  console.log('Total landed:', results.reduce((a, b) => a + b, 0));

  await browser.close();
})();
