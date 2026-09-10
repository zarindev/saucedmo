import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { users, productNames } from './testData';

test.describe('Cart', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    inventoryPage = new InventoryPage(page);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('starts empty with no cart badge', async () => {
    await inventoryPage.expectNoCartBadge();
  });

  test('adding a single item shows a badge count of 1', async () => {
    await inventoryPage.addToCart(productNames[0]);
    await inventoryPage.expectCartBadgeCount(1);
  });

  test('adding multiple items accumulates the badge count', async () => {
    await inventoryPage.addToCart(productNames[0]);
    await inventoryPage.expectCartBadgeCount(1);

    await inventoryPage.addToCart(productNames[1]);
    await inventoryPage.expectCartBadgeCount(2);

    await inventoryPage.addToCart(productNames[2]);
    await inventoryPage.expectCartBadgeCount(3);
  });

  test('removing an item from the inventory page updates the badge', async () => {
    await inventoryPage.addToCart(productNames[0]);
    await inventoryPage.addToCart(productNames[1]);
    await inventoryPage.expectCartBadgeCount(2);

    await inventoryPage.removeFromInventory(productNames[0]);
    await inventoryPage.expectCartBadgeCount(1);
  });

  test('removing every item from the inventory page clears the badge', async () => {
    await inventoryPage.addToCart(productNames[0]);
    await inventoryPage.removeFromInventory(productNames[0]);
    await inventoryPage.expectNoCartBadge();
  });

  test('removing an item from the cart page updates cart contents and badge', async ({ page }) => {
    await inventoryPage.addToCart(productNames[0]);
    await inventoryPage.addToCart(productNames[1]);
    await inventoryPage.goToCart();

    const cartPage = new CartPage(page);
    await cartPage.expectItemCount(2);

    await cartPage.removeItem(productNames[0]);
    await cartPage.expectItemCount(1);
    await expect(cartPage.cartBadge).toHaveText('1');

    const remaining = await cartPage.getItemNames();
    expect(remaining).toEqual([productNames[1]]);
  });

  test('cart page shows an empty state once all items are removed', async ({ page }) => {
    await inventoryPage.addToCart(productNames[0]);
    await inventoryPage.goToCart();

    const cartPage = new CartPage(page);
    await cartPage.removeItem(productNames[0]);
    await cartPage.expectEmpty();
    await inventoryPage.expectNoCartBadge();
  });
});
