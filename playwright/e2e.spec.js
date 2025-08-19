const { test, expect } = require('@playwright/test');

test('basic stock search', async ({ page }) => {
  await page.goto('/');

  // Check for header
  await expect(page.getByRole('heading', { name: 'MarketPulse AI' })).toBeVisible();

  // Check for search bar
  const searchInput = page.getByPlaceholder('Enter stock symbol (e.g., AAPL)');
  await expect(searchInput).toBeVisible();

  // Search for a stock
  await searchInput.fill('MSFT');
  await page.getByRole('button', { name: 'Search' }).click();

  // Wait for loading to finish
  await expect(page.getByText('Fetching data for MSFT...')).toBeVisible();
  await expect(page.getByText('Fetching data for MSFT...')).not.toBeVisible({ timeout: 15000 });

  // Check that the stock data is displayed
  await expect(page.getByText('MSFT')).toBeVisible();
});
