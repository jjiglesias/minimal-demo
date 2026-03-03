const { test, expect } = require('@playwright/test');

test.describe('Activity Signup', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.activity-card', { timeout: 5000 });
  });

  test('should successfully sign up a new student for an activity', async ({ page }) => {
    const testEmail = `test-${Date.now()}@mergington.edu`;
    const activityName = 'Chess Club';

    // Fill in the email
    await page.fill('#email', testEmail);

    // Select an activity
    await page.selectOption('#activity', activityName);

    // Submit the form and wait for response
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/signup') && response.request().method() === 'POST'
      ),
      page.click('button[type="submit"]')
    ]);

    // Wait for success message
    const messageDiv = page.locator('#message');
    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });
    await expect(messageDiv).toContainText(`Signed up ${testEmail} for ${activityName}`);
  });

  test('should prevent duplicate signup for the same activity', async ({ page }) => {
    const testEmail = `duplicate-${Date.now()}@mergington.edu`;
    const activityName = 'Programming Class';

    // First signup
    await page.fill('#email', testEmail);
    await page.selectOption('#activity', activityName);
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/signup') && response.request().method() === 'POST' && response.status() === 200
      ),
      page.click('button[type="submit"]')
    ]);

    // Wait for first success
    const messageDiv = page.locator('#message');
    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });

    // Wait for form to be ready again
    await page.waitForTimeout(1000);

    // Try to sign up again with same email and activity
    await page.fill('#email', testEmail);
    await page.selectOption('#activity', activityName);
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/signup') && response.request().method() === 'POST' && response.status() === 400
      ),
      page.click('button[type="submit"]')
    ]);

    // Should show error
    await expect(messageDiv).toHaveClass('error', { timeout: 10000 });
    await expect(messageDiv).toContainText('Student already signed up for this activity');
  });

  test('should validate email field is required', async ({ page }) => {
    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should validate activity selection is required', async ({ page }) => {
    const activitySelect = page.locator('#activity');
    await expect(activitySelect).toHaveAttribute('required');
  });

  test('should clear form after successful signup', async ({ page }) => {
    const testEmail = `clear-test-${Date.now()}@mergington.edu`;

    // Fill and submit form
    await page.fill('#email', testEmail);
    await page.selectOption('#activity', 'Gym Class');
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/signup') && response.request().method() === 'POST'
      ),
      page.click('button[type="submit"]')
    ]);

    // Wait for success
    const messageDiv = page.locator('#message');
    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });

    // Check form is cleared
    const emailValue = await page.inputValue('#email');
    expect(emailValue).toBe('');

    const activityValue = await page.inputValue('#activity');
    expect(activityValue).toBe('');
  });

  test('should allow same email for different activities', async ({ page }) => {
    const testEmail = `multi-${Date.now()}@mergington.edu`;

    // Sign up for first activity
    await page.fill('#email', testEmail);
    await page.selectOption('#activity', 'Soccer Team');
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/signup') && response.request().method() === 'POST'
      ),
      page.click('button[type="submit"]')
    ]);

    const messageDiv = page.locator('#message');
    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });

    // Wait for form to be ready
    await page.waitForTimeout(1000);

    // Sign up for second activity with same email
    await page.fill('#email', testEmail);
    await page.selectOption('#activity', 'Basketball Club');
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/signup') && response.request().method() === 'POST'
      ),
      page.click('button[type="submit"]')
    ]);

    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });
    await expect(messageDiv).toContainText(`Signed up ${testEmail} for Basketball Club`);
  });

  test('should handle button state during submission', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    const testEmail = `disable-test-${Date.now()}@mergington.edu`;

    await page.fill('#email', testEmail);
    await page.selectOption('#activity', 'Drama Club');

    // Start submission and wait for response
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/signup') && response.request().method() === 'POST'
      ),
      page.click('button[type="submit"]')
    ]);

    // Wait for completion
    const messageDiv = page.locator('#message');
    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });

    // Button should be re-enabled
    await expect(submitButton).not.toBeDisabled();
  });

  test('should hide message after 5 seconds', async ({ page }) => {
    test.setTimeout(15000); // Increase timeout for this test

    await page.fill('#email', `hide-test-${Date.now()}@mergington.edu`);
    await page.selectOption('#activity', 'Art Workshop');
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/signup') && response.request().method() === 'POST'
      ),
      page.click('button[type="submit"]')
    ]);

    const messageDiv = page.locator('#message');
    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });

    // Wait for message to hide
    await page.waitForTimeout(5500);
    await expect(messageDiv).toHaveClass('hidden');
  });

  test('should refresh activities list after signup', async ({ page }) => {
    const testEmail = `refresh-test-${Date.now()}@mergington.edu`;
    const activityName = 'Debate Team';

    // Get initial participant count text
    const activityCard = page.locator('.activity-card', {
      has: page.locator('h4', { hasText: activityName })
    });

    // Sign up
    await page.fill('#email', testEmail);
    await page.selectOption('#activity', activityName);
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/signup') && response.request().method() === 'POST'
      ),
      page.click('button[type="submit"]')
    ]);

    // Wait for success
    const messageDiv = page.locator('#message');
    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });

    // Wait for the page to refresh activities
    await page.waitForTimeout(1000);

    // Check that the activity card contains the new participant
    await expect(activityCard).toContainText(testEmail);
  });

});
