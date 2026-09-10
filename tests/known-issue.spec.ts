import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { users, productNames } from './testData';

/**
 * KNOWN ISSUE — deliberately failing regression guard.
 *
 * Sauce Demo ships several intentionally-broken accounts so testers have
 * real defects to find instead of only exercising happy paths. `problem_user`
 * logs in successfully, but its product grid renders the exact same image
 * for every item instead of each product's actual photo.
 *
 * Correct behavior: each of the 6 products on the inventory page should
 * render a distinct image whose `src` corresponds to that specific product,
 * the same way it does for `standard_user`.
 *
 * Actual behavior: `problem_user` renders one repeated image src across all
 * product cards, so a user cannot visually distinguish products by photo.
 *
 * This test is written against the CORRECT behavior and is left failing on
 * purpose (not skipped, not soft-asserted) so it stands as a live regression
 * guard. It's marked with `test.fail()` — Playwright's annotation for a test
 * that is expected to fail: the suite still runs the real assertion on every
 * CI run, the build stays green while the defect remains, and the moment
 * Sauce Labs fixes the bug this test starts passing unexpectedly, which
 * Playwright reports as a build failure demanding the guard be updated.
 * Removing or skipping it would hide a real bug behind a suite of only
 * happy-path tests.
 */
test.describe('Known issue: problem_user product images', () => {
  test('each product card shows a distinct image (currently broken for problem_user)', async ({
    page,
  }) => {
    test.fail();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.problem.username, users.problem.password);

    const inventoryPage = new InventoryPage(page);
    await expect(page).toHaveURL(/inventory\.html/);

    const imageSrcs = await inventoryPage.getItemImageSrcs();
    const uniqueSrcs = new Set(imageSrcs);

    // Defect: problem_user reuses a single image for every product, so this
    // currently fails with uniqueSrcs.size === 1 instead of productNames.length.
    expect(uniqueSrcs.size).toBe(productNames.length);
  });
});
