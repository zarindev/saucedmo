/**
 * Central source of truth for Sauce Demo's documented test accounts and
 * shared fixtures, so specs never hard-code strings that might drift.
 * Account behaviors are documented at https://www.saucedemo.com
 */

export interface SauceUser {
  username: string;
  password: string;
  description: string;
}

export const users: Record<string, SauceUser> = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
    description: 'Well-behaved account with no injected defects.',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: 'secret_sauce',
    description: 'Account is blocked at login with an "Epic sadface" error.',
  },
  problem: {
    username: 'problem_user',
    password: 'secret_sauce',
    description:
      'Logs in successfully but ships UI defects (e.g. every product photo ' +
      'renders the same broken image regardless of the actual product).',
  },
  error: {
    username: 'error_user',
    password: 'secret_sauce',
    description: 'Logs in successfully but triggers JS errors on some interactions.',
  },
  visual: {
    username: 'visual_user',
    password: 'secret_sauce',
    description: 'Logs in successfully but has minor visual/CSS regressions.',
  },
  performanceGlitch: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
    description: 'Logs in successfully but with an artificial delay.',
  },
};

export const invalidCredentials = {
  wrongPassword: 'not_the_right_password',
};

export const checkoutInfo = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  postalCode: '94107',
};

/** The six products Sauce Demo always ships, in default (A-Z) order. */
export const productNames = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Test.allTheThings() T-Shirt (Red)',
];

export const sortOptions = {
  nameAsc: 'az',
  nameDesc: 'za',
  priceAsc: 'lohi',
  priceDesc: 'hilo',
} as const;
