/* global Buffer */
import { test, expect } from '@playwright/test';

test.describe('Create Post Flow', () => {
    test('should successfully create a new post with an image', async ({ page }) => {


        // mocking that we are logged in
        await page.route('http://localhost:8080/api/users/login', async route => {
            await route.fulfill({ json: { token: 'fake-jwt-token-12345' } });
        });

        // mock the get request for the feed
        await page.route('http://localhost:8080/api/posts', async route => {

            const corsHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': '*'
            };

            // show the feed after login
            if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, headers: corsHeaders, json: [] });
            }
            // create a post
            else if (route.request().method() === 'POST') {
                await route.fulfill({ status: 201, headers: corsHeaders, json: { id: 99, title: 'Test' } });
            } else {
                // CORS preflight
                await route.fulfill({ status: 200, headers: corsHeaders });
            }
        });

        // login
        await page.goto('http://localhost:5173');
        await page.getByPlaceholder('Username').fill('testuser');
        await page.getByPlaceholder('Password').fill('password123');
        await page.getByRole('button', { name: 'Log In' }).click();

        // open create post modal
        // click on create post button on feed
        await page.getByRole('button', { name: 'Post', exact: true }).click();

        // check if modal appeared
        await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();

        const whitePixel = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
            'base64'
        );

        // fill the form
        // upload photo
        await page.locator('input[type="file"]').setInputFiles({
            name: 'test.png',
            mimeType: 'image/png',
            buffer: whitePixel
        });


        // filling the title field
        await page.getByText('TITLE').locator('..').locator('input').fill('test title');

        // caption
        await page.locator('textarea').fill('this is a test, this is a test, 12345675, auytgfsdl');

        // tags
        await page.getByPlaceholder('nature, travel, photography').fill('tag1, tag2, tag3');


        // send data and check resukt
        // click "New Post" button
        await page.getByRole('button', { name: 'New Post' }).click();

        // wait for successful toast
        await expect(page.getByText('Post created successfully!')).toBeVisible();

        // window should be closed so "Create New Post" shoud dissappear
        await expect(page.getByRole('heading', { name: 'Create New Post' })).not.toBeVisible();
    });
});