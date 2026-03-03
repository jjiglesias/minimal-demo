const { test, expect } = require('@playwright/test');

test.describe('Homepage - Mergington High School Activities', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Mergington High School Activities');
  });

  test('should display the main heading', async ({ page }) => {
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toHaveText('Mergington High School');
  });

  test('should display the subheading', async ({ page }) => {
    const subHeading = page.locator('h2');
    await expect(subHeading).toHaveText('Extracurricular Activities');
  });

  test('should display the activities section', async ({ page }) => {
    const activitiesSection = page.locator('#activities-container');
    await expect(activitiesSection).toBeVisible();
    await expect(activitiesSection.locator('h3')).toHaveText('Available Activities');
  });

  test('should display the signup section', async ({ page }) => {
    const signupSection = page.locator('#signup-container');
    await expect(signupSection).toBeVisible();
    await expect(signupSection.locator('h3')).toHaveText('Sign Up for an Activity');
  });

  test('should display the signup form with email input', async ({ page }) => {
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should display the signup form with activity select', async ({ page }) => {
    const activitySelect = page.locator('#activity');
    await expect(activitySelect).toBeVisible();
    await expect(activitySelect).toHaveAttribute('required');
  });

  test('should display the submit button', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveText('Sign Up');
  });

  test('should display the footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('p')).toContainText('2023 Mergington High School');
  });

});
