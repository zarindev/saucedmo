import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  private cardFor(productName: string): Locator {
    return this.cartItems.filter({ hasText: productName });
  }

  removeButton(productName: string): Locator {
    return this.cardFor(productName).locator('button[data-test^="remove-"]');
  }

  async removeItem(productName: string): Promise<void> {
    await this.removeButton(productName).click();
  }

  async getItemNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async goToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }

  async expectEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }
}
