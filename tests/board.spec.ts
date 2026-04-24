import { test, expect, type Page } from '@playwright/test'

async function freshLoad(page: Page) {
  await page.goto('/')
  await page.getByTestId('board').waitFor()
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByTestId('board').waitFor()
}

test.describe('Initial render', () => {
  test('shows three default columns and welcome card', async ({ page }) => {
    await freshLoad(page)
    await expect(page.getByTestId('column-title-0')).toHaveText('To Do')
    await expect(page.getByTestId('column-title-1')).toHaveText('Doing')
    await expect(page.getByTestId('column-title-2')).toHaveText('Done')
    const welcome = page.getByTestId('card-0-0')
    await expect(welcome).toContainText('Welcome')
    await expect(welcome).toHaveClass(/outline-sky-400/)
    await expect(page.getByTestId('mode-chip')).toContainText('cards')
  })
})

test.describe('Card navigation (cards target)', () => {
  test('Right moves selection to next column add slot when next column empty', async ({
    page,
  }) => {
    await freshLoad(page)
    await page.keyboard.press('ArrowRight')
    await expect(page.getByTestId('add-card-1')).toHaveClass(/outline-sky-400/)
    await expect(page.getByTestId('card-0-0')).not.toHaveClass(/outline-sky-400/)
  })

  test('Down clamps at add-card slot', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.press('ArrowDown')
    await expect(page.getByTestId('add-card-0')).toHaveClass(/outline-sky-400/)
    await page.keyboard.press('ArrowDown')
    await expect(page.getByTestId('add-card-0')).toHaveClass(/outline-sky-400/)
  })
})

test.describe('Card move (Shift+Arrow)', () => {
  test('Shift+Right moves card to neighbor column', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.down('Shift')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.up('Shift')
    await expect(page.getByTestId('card-1-0')).toContainText('Welcome')
    await expect(page.getByTestId('card-0-0')).toHaveCount(0)
  })
})

test.describe('Edit card', () => {
  test('Enter enters edit mode (amber outline), typing updates, Enter exits', async ({
    page,
  }) => {
    await freshLoad(page)
    await page.keyboard.press('Enter')
    const input = page.getByTestId('card-0-0')
    await expect(input).toHaveClass(/outline-amber-400/)
    await page.keyboard.press('End')
    await page.keyboard.type(' edited')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('card-0-0')).toContainText('Welcome — press Enter to edit edited')
    await expect(page.getByTestId('card-0-0')).toHaveClass(/outline-sky-400/)
  })

  test('Escape also exits edit', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.press('Enter')
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('card-0-0')).toHaveClass(/outline-sky-400/)
    await expect(page.getByTestId('card-0-0')).not.toHaveClass(/outline-amber-400/)
  })
})

test.describe('Delete card', () => {
  test('first Delete arms (red), second deletes', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.press('Delete')
    await expect(page.getByTestId('card-0-0')).toHaveClass(/outline-red-500/)
    await page.keyboard.press('Delete')
    await expect(page.getByTestId('card-0-0')).toHaveCount(0)
  })

  test('arrow cancels armed state', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.press('Delete')
    await expect(page.getByTestId('card-0-0')).toHaveClass(/outline-red-500/)
    await page.keyboard.press('ArrowDown')
    await expect(page.getByTestId('card-0-0')).not.toHaveClass(/outline-red-500/)
  })
})

test.describe('Add card via Space', () => {
  test('Space on add-slot creates a new card in edit mode', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.press('ArrowRight') // select empty col 1's add slot
    await page.keyboard.press('Space')
    const newCard = page.getByTestId('card-1-0')
    await expect(newCard).toHaveClass(/outline-amber-400/)
    await page.keyboard.type('hello')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('card-1-0')).toContainText('hello')
  })

  test('Space on a real card does NOT add card', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.press('Space')
    await expect(page.getByTestId('card-0-1')).toHaveCount(0)
  })
})

test.describe('Mode toggle (M)', () => {
  test('M switches to columns target and outlines first column', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.press('m')
    await expect(page.getByTestId('mode-chip')).toContainText('columns')
    await expect(page.getByTestId('column-0')).toHaveClass(/outline-sky-400/)
    await expect(page.getByTestId('card-0-0')).not.toHaveClass(/outline-sky-400/)
    await expect(page.getByTestId('add-card-0')).toHaveCount(0)
    await expect(page.getByTestId('add-column')).toBeVisible()
  })

  test('Cmd+M does not toggle', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.press('Meta+m')
    await expect(page.getByTestId('mode-chip')).toContainText('cards')
    await page.keyboard.press('Control+m')
    await expect(page.getByTestId('mode-chip')).toContainText('cards')
  })
})

test.describe('Columns target', () => {
  test('Shift+Right swaps neighbor columns', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.press('m')
    await page.keyboard.down('Shift')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.up('Shift')
    await expect(page.getByTestId('column-title-0')).toHaveText('Doing')
    await expect(page.getByTestId('column-title-1')).toHaveText('To Do')
  })

  test('Enter on add-column slot creates a new column in edit mode', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.press('m')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight') // 0 -> 1 -> 2 -> add slot (idx 3)
    await expect(page.getByTestId('add-column')).toHaveClass(/outline-sky-400/)
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('column-3')).toBeVisible()
    await page.keyboard.type('Backlog')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('column-title-3')).toHaveText('Backlog')
  })

  test('Double-Delete removes a column', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.press('m')
    await page.keyboard.press('Delete')
    await expect(page.getByTestId('column-0')).toHaveClass(/outline-red-500/)
    await page.keyboard.press('Delete')
    await expect(page.getByTestId('column-title-0')).toHaveText('Doing')
    await expect(page.getByTestId('column-title-2')).toHaveCount(0)
  })
})

test.describe('Persistence', () => {
  test('state survives reload', async ({ page }) => {
    await freshLoad(page)
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Space')
    await page.keyboard.type('persisted')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('card-1-0')).toContainText('persisted')
    await page.reload()
    await expect(page.getByTestId('card-1-0')).toContainText('persisted')
  })
})
