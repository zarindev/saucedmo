# Sauce Demo QA Automation

Playwright + TypeScript end-to-end test suite for [saucedemo.com](https://www.saucedemo.com), built with a Page Object Model architecture across Chromium, Firefox, WebKit, and mobile viewport.

[![Playwright Tests](https://github.com/zarindev/sauce-demo-qa-automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/zarindev/sauce-demo-qa-automation/actions/workflows/playwright.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.63-2EAD33?logo=playwright&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

> **This is a self-built demo/practice project, not a paid client engagement.** It runs entirely against [saucedemo.com](https://www.saucedemo.com), a public site Sauce Labs built specifically for QA automation practice — no client code, credentials, or data is involved. Real client test suites and bug reports are covered by NDAs and can't be shared publicly, so this repo exists to demonstrate the same skills — architecture, coverage design, CI wiring, defect reporting — on a site anyone can independently verify.

## Why this exists

Portfolios full of descriptions ("I test with Playwright," "I write POM-based suites") are cheap to write and hard to verify. This repo is the alternative: a real, runnable suite with real coverage decisions, a real CI pipeline, and a real defect found and documented as a regression guard — all inspectable by clicking around the repo rather than taking my word for it.

## Tech stack

| Tool | Role |
|---|---|
| [Playwright](https://playwright.dev) | Browser automation & test runner |
| TypeScript (strict mode) | Type-safe page objects and specs |
| Page Object Model | One class per page, locators + actions + assertions |
| GitHub Actions | CI on push/PR to `main` + weekly scheduled run |
| HTML Reporter | Traces, screenshots, and video on failure |

## Test coverage

| Area | File | What's actually tested |
|---|---|---|
| Login | `tests/login.spec.ts` | Form renders correctly; `standard_user` reaches inventory; `locked_out_user` is rejected; wrong password is rejected; missing username/password are each rejected with the correct field-specific error |
| Sorting | `tests/sorting.spec.ts` | Default name A-Z order; name Z-A; price low-high; price high-low; item count (6) stays stable across every sort option |
| Cart | `tests/cart.spec.ts` | Empty-cart start state; badge count on single/multiple adds; badge accuracy after removing from the inventory page; badge accuracy after removing from the cart page; cart contents match what remains; empty-cart state after removing everything |
| Checkout | `tests/checkout.spec.ts` | First-name required-field validation; postal-code required-field validation; full happy-path through all three checkout steps; **subtotal + tax = total as a real arithmetic check** (not just that the labels render); cart resets to empty after a completed order |
| Known issue | `tests/known-issue.spec.ts` | Documents a real `problem_user` defect as a deliberately-failing regression guard (see below) |

Every assertion uses Playwright's auto-waiting `expect()` — there is no `waitForTimeout` or manual sleep anywhere in the suite. Locators prefer `data-test` attributes (via `page.getByTestId`, configured to read `data-test`) over CSS classes wherever Sauce Demo provides them.

## The deliberate "known issue" test

Sauce Demo ships several intentionally broken accounts (`problem_user`, `error_user`, etc.) so testers have real defects to find instead of only exercising happy paths. Investigating `problem_user` turned up a concrete UI bug: **every product card on the inventory page renders the exact same image, instead of each product's own photo.**

`tests/known-issue.spec.ts` asserts the *correct* behavior — six products should produce six distinct image sources — and is written to fail as long as the bug exists. It uses Playwright's `test.fail()` annotation rather than `test.skip()`, which means:

- The real assertion still runs on every CI build, against the live site.
- The build stays green while the defect is present (an *expected* failure counts as a pass).
- If Sauce Labs ever fixes the bug, this test starts passing unexpectedly, which Playwright reports as a build failure — a signal that the guard needs to be updated, not silently stale.

This is the difference between a suite that only proves happy paths work and one that actively documents what's broken.

## Project structure

```
sauce-demo-qa-automation/
├── .github/
│   └── workflows/
│       └── playwright.yml       # CI: push/PR to main + weekly cron
├── pages/
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── tests/
│   ├── testData.ts               # Shared users, checkout info, product names
│   ├── login.spec.ts
│   ├── sorting.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   └── known-issue.spec.ts
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Local setup

```bash
# Install dependencies
npm install

# Install browser binaries
npx playwright install --with-deps

# Type-check the suite
npm run typecheck

# Run the full suite (Chromium, Firefox, WebKit, Pixel 5)
npm test

# Run a single project
npx playwright test --project=chromium

# Run headed, for watching it work
npm run test:headed

# Open the last HTML report
npm run report
```

## Design decisions

**Page Object Model over inline selectors.** Every locator lives in `pages/`, behind readable action methods (`login()`, `addToCart()`, `sortBy()`). Specs read like test plans, not selector soup, and a markup change only requires updating one file instead of every spec that touches that page.

**`data-test` attributes over CSS classes.** Sauce Demo exposes stable `data-test` hooks specifically for automation. Locators are built on those (via a configured `testIdAttribute`) rather than class names, which are far more likely to change for styling reasons unrelated to the test.

**Explicit assertions over sleeps.** There is no `waitForTimeout` anywhere in this suite. Every wait is an auto-retrying `expect()` against a real condition (visibility, text, URL, count), which is both faster and far less flaky than fixed delays.

**Cross-browser and mobile by default.** The config runs every spec against Chromium, Firefox, WebKit, and a Pixel 5 viewport. A suite that only proves "it works in one engine" doesn't prove much — real users don't all share one browser.

**Scheduled CI runs, not just push-triggered.** The workflow runs weekly on a cron schedule in addition to push/PR. Third-party sites change without your codebase changing; a suite that only runs when you touch it can't catch upstream drift on its own.

## About me

QA Engineer specializing in manual and automation testing — Selenium, Playwright, and end-to-end test strategy for web applications. Available for QA engagements on Upwork.
