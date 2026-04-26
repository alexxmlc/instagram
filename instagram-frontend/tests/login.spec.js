import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should successfully log in a user', async ({ page }) => {
    
    // go to server 
    await page.goto('http://localhost:5173');

    // fill the login form
    await page.getByPlaceholder('Username').fill('testuser');
    await page.getByPlaceholder('Password').fill('password123');

    // intercepts the API request  
    await page.route('http://localhost:8080/api/users/login', async route => {
      const json = { token: 'fake-jwt-token-12345' };
      await route.fulfill({ json });
    });

    // click login
    await page.getByRole('button', { name: 'Log In' }).click();

    // wait for react toast to be shown
    await expect(page.getByText('Login successful!')).toBeVisible();

    // check if the jwt was saved in localStorage
    const token = await page.evaluate(() => localStorage.getItem('jwt_token'));
    expect(token).toBe('fake-jwt-token-12345');
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.getByPlaceholder('Username').fill('wronguser');
    await page.getByPlaceholder('Password').fill('wrongpass');

    // mock failed backend response
    await page.route('http://localhost:8080/api/users/login', async route => {
      await route.fulfill({ status: 401 });
    });

    await page.getByRole('button', { name: 'Log In' }).click();

   // check that inline paragraph error appears in front
    await expect(page.getByRole('paragraph').filter({ hasText: 'Invalid username or password' })).toBeVisible();

    // check that the toast notification aklso appears
    await expect(page.getByRole('status').filter({ hasText: 'Invalid username or password' })).toBeVisible();
  });
});