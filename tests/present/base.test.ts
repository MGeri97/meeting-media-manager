// eslint-disable-next-line import/named
import { existsSync } from 'fs-extra'
import { sync } from 'fast-glob'
import { expect, test } from '@playwright/test'
import { ipcRendererInvoke } from 'electron-playwright-helpers'
import jimp from 'jimp'
import { ElectronApplication, Page } from 'playwright'
import { join } from 'upath'
import { version } from '../../package.json'
import { startApp, openHomePage } from './../helpers/electronHelpers'
import { getDate } from './../helpers/generalHelpers'
import prefs from './../mocks/prefs/prefsOld.json'
import locale from './../../src/renderer/locales/en.json'

let electronApp: ElectronApplication
let page: Page

test.beforeAll(async () => {
  electronApp = await startApp()
})

test.afterAll(async () => {
  await page.locator('[aria-label="Go to home"]').click()
  await electronApp.close()
})

test('render the presentation mode page correctly', async () => {
  page = await openHomePage(electronApp)

  // Open settings page
  await page.locator('[aria-label="settings"]').click()

  // Check for correct version
  expect((await page.locator('text=M³ v').innerText()).toLowerCase()).toBe(
    `m³ v${version}`
  )

  // Expand media setup
  await page.locator('button', { hasText: locale.optionsMedia }).click()

  // Turn media presentation mode on
  await page.locator(`text=${locale.enableMediaDisplayButton}`).check()

  // Go back to home page
  await page.locator('[aria-label="home"]').click()

  // Verify home page
  expect(page.locator(`text=${prefs.congregationName}`).innerText).toBeTruthy()

  // Close media window
  await page.locator('[aria-label="toggleScreen"]').click()

  // Open presentation mode
  await page.locator('[aria-label="present"]').click()

  // If one date or todays date, that one gets opened automatically
  const mediaPath = await ipcRendererInvoke(page, 'downloads')
  if (
    existsSync(join(mediaPath, prefs.lang, getDate())) ||
    sync(join(mediaPath, prefs.lang, '*'), {
      onlyDirectories: true,
      ignore: [join(mediaPath, prefs.lang, 'Recurring')],
    }).length === 1
  ) {
    // Check if toggle prefix button is present
    expect(
      await page
        .locator('[aria-label="Toggle prefix"]')
        .getAttribute('aria-label')
    ).toBeTruthy()
  } else {
    // Check for correct heading
    expect(await page.locator('h2').innerText()).toBe(locale.meeting)
  }
})
/*
 test('send IPC message from renderer', async () => {
   // evaluate this script in render process
   // requires webPreferences.nodeIntegration true and contextIsolation false
   await page.evaluate(() => {
     // eslint-disable-next-line @typescript-eslint/no-var-requires
     require('electron').ipcRenderer.send('new-window')
   })
   const newPage = await electronApp.waitForEvent('window')
   expect(newPage).toBeTruthy()
   expect(await newPage.title()).toBe('Window 4')
   page = newPage
 }) */

test('receive IPC invoke/handle via renderer', async () => {
  // evaluate this script in RENDERER process and collect the result
  const result = await ipcRendererInvoke(page, 'appVersion')
  expect(result).toBe(version)
})

test('make sure two screenshots of the same page match', async ({ page }) => {
  // take a screenshot of the current page
  const screenshot1: Buffer = await page.screenshot()
  // create a visual hash using Jimp
  const screenshot1hash = (await jimp.read(screenshot1)).hash()
  // take a screenshot of the page
  const screenshot2: Buffer = await page.screenshot()
  // create a visual hash using Jimp
  const screenshot2hash = (await jimp.read(screenshot2)).hash()
  // compare the two hashes
  expect(screenshot1hash).toEqual(screenshot2hash)
})
