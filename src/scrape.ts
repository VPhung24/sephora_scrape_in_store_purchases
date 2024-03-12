import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';

dotenv.config();

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--disable-notifications', '--disable-geolocation', '--disable-permission-prompts', '--disable-http2']
    });

    const page = await browser.newPage();
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://www.sephora.com/purchase-history', ['notifications', 'geolocation']);
    await page.goto('https://www.sephora.com/purchase-history');

    // Wait for the "Sign In" button and click it
    await page.waitForSelector('button.css-fayz2t.eanm77i0');
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button.css-fayz2t.eanm77i0'));
        const signInButton = buttons.find(button => button.textContent === 'Sign In');
        if (signInButton) {
            (signInButton as HTMLElement).click(); // Corrected type assertion
        } else {
            console.error('Sign In button not found');
            throw new Error('Sign In button not found');
        }
    });

    // Wait for the username field to ensure the login form is ready
    await page.waitForSelector('#signin_username', {visible: true});

    if (typeof process.env.USERNAME === 'undefined' || typeof process.env.PASSWORD === 'undefined') {
        console.error('USERNAME or PASSWORD environment variables are not set.');
        await browser.close();
        return;
    }

    await page.type('#signin_username', process.env.USERNAME);
    await page.type('#signin_password', process.env.PASSWORD);

    // Click the sign-in button within the modal
    await page.click('[data-at="sign_in_button"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Scrape data from the purchase history page
    const data = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('div[data-at="purchase_history_item"]'));
        return items.map(item => {
            const brandElement = item.querySelector('span[data-at="sku_item_brand"]');
            const itemNameElement = item.querySelector('span[data-at="sku_item_name"]');
            const priceElement = item.querySelector('span[data-at="sku_item_price_list"]');

            const brand = (brandElement as HTMLElement)?.innerText || '';
            const itemName = (itemNameElement as HTMLElement)?.innerText || '';
            const price = (priceElement as HTMLElement)?.innerText || '';
            return { brand, itemName, price };
        });
    });

    // Save the scraped data to a file
    await fs.writeFile('output.json', JSON.stringify(data, null, 2));

    await browser.close();
})();
