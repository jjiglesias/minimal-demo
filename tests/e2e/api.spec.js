const { test, expect } = require('@playwright/test');

test.describe('API Endpoints', () => {

  test('GET /activities should return all activities', async ({ request }) => {
    const response = await request.get('/activities');

    expect(response.ok()).toBeTruthy();

    const activities = await response.json();
    expect(activities).toBeTruthy();
    expect(Object.keys(activities).length).toBeGreaterThanOrEqual(9);

    // Check structure of an activity
    const firstActivity = Object.values(activities)[0];
    expect(firstActivity).toHaveProperty('description');
    expect(firstActivity).toHaveProperty('schedule');
    expect(firstActivity).toHaveProperty('max_participants');
    expect(firstActivity).toHaveProperty('participants');
    expect(Array.isArray(firstActivity.participants)).toBeTruthy();
  });

  test('POST /activities/{name}/signup should register a student', async ({ request }) => {
    const testEmail = `api-test-${Date.now()}@mergington.edu`;
    const activityName = 'Chess Club';

    const response = await request.post(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(testEmail)}`);

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.message).toContain('Signed up');
    expect(result.message).toContain(testEmail);
    expect(result.message).toContain(activityName);
  });

  test('POST /activities/{name}/signup should reject duplicate signup', async ({ request }) => {
    const testEmail = `api-dup-${Date.now()}@mergington.edu`;
    const activityName = 'Programming Class';

    // First signup
    const firstResponse = await request.post(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(testEmail)}`);
    expect(firstResponse.ok()).toBeTruthy();

    // Second signup with same email
    const secondResponse = await request.post(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(testEmail)}`);

    expect(secondResponse.status()).toBe(400);

    const result = await secondResponse.json();
    expect(result.detail).toContain('Student already signed up');
  });

  test('POST /activities/{name}/signup should return 404 for non-existent activity', async ({ request }) => {
    const testEmail = `api-404-${Date.now()}@mergington.edu`;
    const activityName = 'NonExistentActivity';

    const response = await request.post(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(testEmail)}`);

    expect(response.status()).toBe(404);

    const result = await response.json();
    expect(result.detail).toContain('Activity not found');
  });

  test('DELETE /activities/{name}/participants should remove a participant', async ({ request }) => {
    // First add a participant
    const testEmail = `api-delete-${Date.now()}@mergington.edu`;
    const activityName = 'Gym Class';

    const addResponse = await request.post(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(testEmail)}`);
    expect(addResponse.ok()).toBeTruthy();

    // Then remove them
    const deleteResponse = await request.delete(`/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(testEmail)}`);

    expect(deleteResponse.ok()).toBeTruthy();

    const result = await deleteResponse.json();
    expect(result.message).toContain('Removed');
    expect(result.message).toContain(testEmail);
  });

  test('DELETE /activities/{name}/participants should return 404 for non-existent participant', async ({ request }) => {
    const testEmail = `nonexistent-${Date.now()}@mergington.edu`;
    const activityName = 'Chess Club';

    const response = await request.delete(`/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(testEmail)}`);

    expect(response.status()).toBe(404);

    const result = await response.json();
    expect(result.detail).toContain('Participant not found');
  });

  test('DELETE /activities/{name}/participants should return 404 for non-existent activity', async ({ request }) => {
    const testEmail = `api-del-404-${Date.now()}@mergington.edu`;
    const activityName = 'NonExistentActivity';

    const response = await request.delete(`/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(testEmail)}`);

    expect(response.status()).toBe(404);

    const result = await response.json();
    expect(result.detail).toContain('Activity not found');
  });

  test('Root path should redirect to static index.html', async ({ request }) => {
    const response = await request.get('/');

    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain('Mergington High School');
  });

  test('Static files should be served', async ({ request }) => {
    const response = await request.get('/static/styles.css');

    expect(response.ok()).toBeTruthy();

    const body = await response.text();
    expect(body).toContain('box-sizing');
  });

});
