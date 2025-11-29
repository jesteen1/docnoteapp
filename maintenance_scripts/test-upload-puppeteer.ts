import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    try {
        // Login
        console.log('Logging in...');
        await page.goto('http://localhost:3000/login');
        await page.type('input[type="email"]', 'admin@example.com');
        await page.type('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation();

        // Go to dashboard
        console.log('Navigating to dashboard...');
        await page.goto('http://localhost:3000/dashboard');

        // Click first subject
        console.log('Selecting subject...');
        await page.waitForSelector('a[href^="/dashboard/subject/"]');
        const subjectLink = await page.$('a[href^="/dashboard/subject/"]');
        if (!subjectLink) {
            throw new Error('No subject found on dashboard');
        }
        await subjectLink.click();

        // Wait for upload form
        console.log('Waiting for upload form...');
        await page.waitForSelector('input[type="file"]');

        // Create dummy file
        const filePath = path.join(__dirname, 'test-upload.txt');
        fs.writeFileSync(filePath, 'This is a test file content for upload verification.');

        // Fill form
        console.log('Filling upload form...');
        // Find the title input (it's the text input before the file input)
        const inputs = await page.$$('input[type="text"]');
        let titleInput;
        for (const input of inputs) {
            const isVisible = await input.boundingBox();
            if (isVisible) {
                titleInput = input;
                break;
            }
        }

        if (!titleInput) throw new Error('Title input not found');
        await titleInput.type('Puppeteer Upload Test');

        const fileInput = await page.$('input[type="file"]');
        if (!fileInput) throw new Error('File input not found');
        await fileInput.uploadFile(filePath);

        // Click upload
        console.log('Clicking upload...');
        const submitButton = await page.$('button[type="submit"]');
        if (!submitButton) throw new Error('Upload button not found');
        await submitButton.click();

        // Verify
        console.log('Verifying upload...');
        await page.waitForFunction(
            (text) => document.body.innerText.includes(text),
            { timeout: 5000 },
            'Puppeteer Upload Test'
        );

        console.log('Upload verification successful!');

        // Clean up
        fs.unlinkSync(filePath);

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
