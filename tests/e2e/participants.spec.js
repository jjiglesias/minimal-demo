const { test, expect } = require('@playwright/test');

test.describe('Participants Management', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.activity-card', { timeout: 5000 });
  });

  test('should display participant badges for activities with participants', async ({ page }) => {
    // Chess Club should have participants from the start
    const chessClubCard = page.locator('.activity-card', {
      has: page.locator('h4', { hasText: 'Chess Club' })
    });

    const participantBadges = chessClubCard.locator('.participant-badge');
    const count = await participantBadges.count();
    expect(count).toBeGreaterThanOrEqual(2); // michael and daniel
  });

  test('should display delete button on each participant badge', async ({ page }) => {
    const chessClubCard = page.locator('.activity-card', {
      has: page.locator('h4', { hasText: 'Chess Club' })
    });

    const deleteButtons = chessClubCard.locator('.delete-btn');
    const count = await deleteButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should successfully remove a participant from an activity', async ({ page }) => {
    // First add a test participant
    const testEmail = `remove-test-${Date.now()}@mergington.edu`;
    const activityName = 'Robotics Club';

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
    await page.waitForTimeout(1000);

    // Find the participant badge and delete button
    const activityCard = page.locator('.activity-card', {
      has: page.locator('h4', { hasText: activityName })
    });

    const participantBadge = activityCard.locator('.participant-badge', {
      hasText: testEmail
    });
    await expect(participantBadge).toBeVisible();

    const deleteButton = participantBadge.locator('.delete-btn');
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/participants') && response.request().method() === 'DELETE'
      ),
      deleteButton.click()
    ]);

    // Wait for removal success message
    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });
    await expect(messageDiv).toContainText(`Removed ${testEmail} from ${activityName}`);
  });

  test('should refresh activities list after removing participant', async ({ page }) => {
    // Add and then remove a participant
    const testEmail = `refresh-remove-${Date.now()}@mergington.edu`;
    const activityName = 'Programming Class';

    // Sign up
    await page.fill('#email', testEmail);
    await page.selectOption('#activity', activityName);
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/signup') && response.request().method() === 'POST'
      ),
      page.click('button[type="submit"]')
    ]);

    const messageDiv = page.locator('#message');
    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Find and remove
    const activityCard = page.locator('.activity-card', {
      has: page.locator('h4', { hasText: activityName })
    });

    const participantBadge = activityCard.locator('.participant-badge', {
      hasText: testEmail
    });
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/participants') && response.request().method() === 'DELETE'
      ),
      participantBadge.locator('.delete-btn').click()
    ]);

    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Participant should no longer be visible
    await expect(activityCard).not.toContainText(testEmail);
  });

  test('should update spots left count when participant is added', async ({ page }) => {
    const activityName = 'Gym Class';

    // Get initial spots
    const activityCard = page.locator('.activity-card', {
      has: page.locator('h4', { hasText: activityName })
    });

    const initialSpotsText = await activityCard.locator('p:has-text("Availability:")').textContent();
    const initialSpots = parseInt(initialSpotsText.match(/(\d+) spots left/)[1]);

    // Add participant
    const testEmail = `spots-test-${Date.now()}@mergington.edu`;
    await page.fill('#email', testEmail);
    await page.selectOption('#activity', activityName);
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/signup') && response.request().method() === 'POST'
      ),
      page.click('button[type="submit"]')
    ]);

    // Wait for refresh
    const messageDiv = page.locator('#message');
    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Check spots decreased
    const newSpotsText = await activityCard.locator('p:has-text("Availability:")').textContent();
    const newSpots = parseInt(newSpotsText.match(/(\d+) spots left/)[1]);

    expect(newSpots).toBe(initialSpots - 1);
  });

  test('should update spots left count when participant is removed', async ({ page }) => {
    const activityName = 'Basketball Club';

    // Add participant first
    const testEmail = `spots-remove-${Date.now()}@mergington.edu`;
    await page.fill('#email', testEmail);
    await page.selectOption('#activity', activityName);
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/signup') && response.request().method() === 'POST'
      ),
      page.click('button[type="submit"]')
    ]);

    const messageDiv = page.locator('#message');
    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Get spots after adding
    const activityCard = page.locator('.activity-card', {
      has: page.locator('h4', { hasText: activityName })
    });

    const afterAddSpotsText = await activityCard.locator('p:has-text("Availability:")').textContent();
    const afterAddSpots = parseInt(afterAddSpotsText.match(/(\d+) spots left/)[1]);

    // Remove participant
    const participantBadge = activityCard.locator('.participant-badge', {
      hasText: testEmail
    });
    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/participants') && response.request().method() === 'DELETE'
      ),
      participantBadge.locator('.delete-btn').click()
    ]);

    await expect(messageDiv).toHaveClass('success', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Check spots increased
    const afterRemoveSpotsText = await activityCard.locator('p:has-text("Availability:")').textContent();
    const afterRemoveSpots = parseInt(afterRemoveSpotsText.match(/(\d+) spots left/)[1]);

    expect(afterRemoveSpots).toBe(afterAddSpots + 1);
  });

  test('should display participants section with count', async ({ page }) => {
    const chessClubCard = page.locator('.activity-card', {
      has: page.locator('h4', { hasText: 'Chess Club' })
    });

    const participantsSection = chessClubCard.locator('.participants-section h5');
    await expect(participantsSection).toContainText('Participants');
    await expect(participantsSection).toContainText('/'); // Should show count like "(2/12)"
  });

});
