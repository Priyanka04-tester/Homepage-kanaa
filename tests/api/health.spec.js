const { test, expect } = require('@playwright/test');

test.describe('API health', () => {
  test('homepage responds 200', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/en-sa/`);
    expect(res.status()).toBe(200);
  });

  test('client-ip verification endpoint responds', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/api/verify-client-ip/`);
    expect(res.ok()).toBeTruthy();
  });

  test('auth session endpoint responds', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/api/auth/session/`);
    expect(res.ok()).toBeTruthy();
  });
});
