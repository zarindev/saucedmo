import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { users, productNames } from './testData';

test.describe('Product sorting', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    inventoryPage = new InventoryPage(page);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('defaults to name A-Z on load', async () => {
    const names = await inventoryPage.getItemNames();
    expect(names).toEqual([...productNames].sort());
  });

  test('name Z-A reverses alphabetical order', async () => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.getItemNames();
    expect(names).toEqual([...productNames].sort().reverse());
  });

  test('price low-high sorts ascending by price', async () => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getItemPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('price high-low sorts descending by price', async () => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.getItemPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  test('item count stays stable across every sort option', async () => {
    const options = ['az', 'za', 'lohi', 'hilo'] as const;
    for (const option of options) {
      await inventoryPage.sortBy(option);
      await inventoryPage.expectItemCount(productNames.length);
    }
  });
});
