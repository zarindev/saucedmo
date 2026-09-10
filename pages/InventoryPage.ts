import { expect, type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly inventoryItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemImages: Locator;
  readonly sortDropdown: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('.title');
    this.inventoryItems = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.itemImages = page.locator('[data-test="inventory-item"] img.inventory_item_img');
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  /**
   * Sauce Demo derives each add/remove button's data-test suffix from the
   * product name (e.g. "add-to-cart-sauce-labs-backpack"), but the exact
   * slugging of punctuation isn't guaranteed. Scoping to the product card by
   * its visible name and matching any data-test that starts with the
   * expected prefix is robust to that without falling back to CSS classes.
   */
  private cardFor(productName: string): Locator {
    return this.inventoryItems.filter({ hasText: productName });
  }

  addToCartButton(productName: string): Locator {
    return this.cardFor(productName).locator('button[data-test^="add-to-cart-"]');
  }

  removeFromCartButton(productName: string): Locator {
    return this.cardFor(productName).locator('button[data-test^="remove-"]');
  }

  async addToCart(productName: string): Promise<void> {
    await this.addToCartButton(productName).click();
  }

  async removeFromInventory(productName: string): Promise<void> {
    await this.removeFromCartButton(productName).click();
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getItemNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async getItemPrices(): Promise<number[]> {
    const raw = await this.itemPrices.allTextContents();
    return raw.map((price) => parseFloat(price.replace('$', '')));
  }

  async getItemImageSrcs(): Promise<string[]> {
    return this.itemImages.evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).getAttribute('src') ?? ''),
    );
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async expectCartBadgeCount(count: number): Promise<void> {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async expectNoCartBadge(): Promise<void> {
    await expect(this.cartBadge).toHaveCount(0);
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.inventoryItems).toHaveCount(count);
  }
}
