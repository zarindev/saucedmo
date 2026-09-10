import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { users, invalidCredentials } from './testData';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('renders username, password, and login controls', async () => {
    await loginPage.expectFormVisible();
  });

  test('standard_user can log in and reach the inventory page', async ({ page }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('locked_out_user is rejected with a lockout error', async () => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);
    await loginPage.expectErrorMessage('Sorry, this user has been locked out');
  });

  test('wrong password is rejected with a credentials error', async () => {
    await loginPage.login(users.standard.username, invalidCredentials.wrongPassword);
    await loginPage.expectErrorMessage('Username and password do not match');
  });

  test('missing username is rejected with a required-field error', async () => {
    await loginPage.login('', users.standard.password);
    await loginPage.expectErrorMessage('Username is required');
  });

  test('missing password is rejected with a required-field error', async () => {
    await loginPage.login(users.standard.username, '');
    await loginPage.expectErrorMessage('Password is required');
  });
});
