import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { users, productNames, checkoutInfo } from './testData';

test.describe('Checkout', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await inventoryPage.addToCart(productNames[0]);
    await inventoryPage.addToCart(productNames[1]);
    await inventoryPage.goToCart();
    await cartPage.goToCheckout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('requires a first name to proceed', async () => {
    await checkoutPage.fillInformation('', checkoutInfo.lastName, checkoutInfo.postalCode);
    await checkoutPage.continueToOverview();
    await checkoutPage.expectFieldError('First Name is required');
  });

  test('requires a postal code to proceed', async () => {
    await checkoutPage.fillInformation(checkoutInfo.firstName, checkoutInfo.lastName, '');
    await checkoutPage.continueToOverview();
    await checkoutPage.expectFieldError('Postal Code is required');
  });

  test('advances through every step to a completed order', async ({ page }) => {
    await checkoutPage.fillInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode,
    );
    await checkoutPage.continueToOverview();
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await checkoutPage.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await checkoutPage.expectOrderComplete();
  });

  test('subtotal plus tax equals the displayed total', async () => {
    await checkoutPage.fillInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode,
    );
    await checkoutPage.continueToOverview();

    const subtotal = await checkoutPage.getSubtotal();
    const tax = await checkoutPage.getTax();
    const total = await checkoutPage.getTotal();

    // Real arithmetic check, not just presence of the labels. Floating point
    // currency math needs a cent-level tolerance rather than exact equality.
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('cart is empty again after a completed order', async ({ page }) => {
    await checkoutPage.fillInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode,
    );
    await checkoutPage.continueToOverview();
    await checkoutPage.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);

    await checkoutPage.backToProductsButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
    await inventoryPage.expectNoCartBadge();
  });
});
