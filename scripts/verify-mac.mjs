import puppeteer from 'puppeteer-core'
import { existsSync } from 'node:fs'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

if (!existsSync(CHROME_PATH)) {
  console.error('Chrome not found at', CHROME_PATH)
  process.exit(1)
}

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--use-gl=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--disable-webgl-developer-extensions',
  ],
})

const page = await browser.newPage()
page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })

// Capture all console messages from the page.
page.on('console', (msg) => {
  const type = msg.type().padEnd(8)
  console.log(`[console.${type}] ${msg.text()}`)
})
page.on('pageerror', (err) => {
  console.error('[pageerror]', err.message)
})
page.on('requestfailed', (req) => {
  console.error('[requestfailed]', req.url(), req.failure()?.errorText)
})
page.on('response', (res) => {
  if (res.status() >= 400) {
    console.error('[response]', res.status(), res.url())
  }
})

console.log('Navigating to http://localhost:8080 ...')
await page.goto('http://localhost:8080/', { waitUntil: 'networkidle2' })

// Wait for the model to load and any React/Three render passes.
await new Promise((resolve) => setTimeout(resolve, 5000))

// Get the 3D section geometry.
const sectionInfo = await page.evaluate(() => {
  const section = document.querySelector('.mac-showcase')
  if (!section) return null
  return {
    top: section.offsetTop,
    height: section.offsetHeight,
    windowHeight: window.innerHeight,
  }
})

console.log('Section info:', sectionInfo)

if (!sectionInfo) {
  console.error('Could not find .mac-showcase section')
  await browser.close()
  process.exit(1)
}

const screenshots = []

async function takeAtPercent(percent, label) {
  const scrollY = Math.max(
    0,
    sectionInfo.top + sectionInfo.height * percent - sectionInfo.windowHeight / 2
  )
  await page.evaluate((y) => window.scrollTo(0, y), scrollY)
  // Give the scroll-driven animation a moment to settle.
  await new Promise((resolve) => setTimeout(resolve, 1200))
  const path = `/tmp/mac-debug-${label}.png`
  await page.screenshot({ path })
  screenshots.push({ label, path, scrollY })
  console.log(`Screenshot [${label}] saved to ${path}`)
}

await takeAtPercent(0, 'start')
await takeAtPercent(0.5, 'mid')
await takeAtPercent(1, 'end')

await browser.close()

console.log('\nScreenshots:')
screenshots.forEach((s) => {
  console.log(`  ${s.label}: ${s.path} (scrollY=${s.scrollY})`)
})
