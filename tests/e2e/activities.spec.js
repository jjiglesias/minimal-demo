const { test, expect } = require('@playwright/test');

test.describe('Activities List', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for activities to load
    await page.waitForSelector('.activity-card', { timeout: 5000 });
  });

  test('should load and display all activities', async ({ page }) => {
    const activityCards = page.locator('.activity-card');
    // Expect at least 9 activities based on the backend
    const count = await activityCards.count();
    expect(count).toBeGreaterThanOrEqual(9);
  });

  test('should display activity names in cards', async ({ page }) => {
    const activityNames = [
      'Chess Club',
      'Programming Class',
      'Gym Class',
      'Soccer Team',
      'Basketball Club',
      'Drama Club',
      'Art Workshop',
      'Debate Team',
      'Robotics Club'
    ];

    for (const name of activityNames) {
      const activityCard = page.locator('.activity-card', { has: page.locator('h4', { hasText: name }) });
      await expect(activityCard).toBeVisible();
    }
  });

  test('should display activity descriptions', async ({ page }) => {
    const firstActivity = page.locator('.activity-card').first();
    const description = firstActivity.locator('p').first();
    await expect(description).not.toBeEmpty();
  });

  test('should display activity schedules', async ({ page }) => {
    const firstActivity = page.locator('.activity-card').first();
    const scheduleText = firstActivity.locator('p:has-text("Schedule:")');
    await expect(scheduleText).toHaveCount(1);
    // Check that the element contains text
    const text = await scheduleText.textContent();
    expect(text).toContain('Schedule:');
  });

  test('should display availability information', async ({ page }) => {
    const firstActivity = page.locator('.activity-card').first();
    const availabilityText = firstActivity.locator('p:has-text("Availability:")');
    await expect(availabilityText).toHaveCount(1);
    // Check that the element contains text
    const text = await availabilityText.textContent();
    expect(text).toContain('spots left');
  });

  test('should display participants count for each activity', async ({ page }) => {
    const activityCards = page.locator('.activity-card');
    const count = await activityCards.count();

    for (let i = 0; i < count; i++) {
      const card = activityCards.nth(i);
      const participantsSection = card.locator('.participants-section');
      await expect(participantsSection).toBeVisible();
    }
  });

  test('should populate activity dropdown with all activities', async ({ page }) => {
    const activitySelect = page.locator('#activity');
    const options = activitySelect.locator('option');

    // First option is placeholder
    const count = await options.count();
    expect(count).toBeGreaterThan(9); // 9 activities + placeholder

    // Check that activity names are in the dropdown
    const optionTexts = await options.allTextContents();
    expect(optionTexts).toContain('Chess Club');
    expect(optionTexts).toContain('Programming Class');
    expect(optionTexts).toContain('Gym Class');
  });

  test('should show "No participants yet" for empty activities', async ({ page }) => {
    // Look for empty activities
    const emptyActivity = page.locator('.activity-card .participants-section.empty');
    const count = await emptyActivity.count();

    if (count > 0) {
      await expect(emptyActivity.first()).toContainText('No participants yet');
    }
  });

});
