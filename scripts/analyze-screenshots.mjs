import sharp from 'sharp'
import { existsSync } from 'node:fs'

const labels = ['start', 'mid', 'end']

for (const label of labels) {
  const path = `/tmp/mac-debug-${label}.png`
  if (!existsSync(path)) {
    console.log(`${label}: file not found`)
    continue
  }

  const { channels, mean, dominance } = await sharp(path).stats()
  // sharp.stats() returns mean per channel for grayscale or RGBA images
  const avg = mean.reduce((a, b) => a + b, 0) / mean.length
  const max = Math.max(...mean)

  console.log(
    `${label}: size=${(await sharp(path).metadata()).width}x${(await sharp(path).metadata()).height}, ` +
      `avg=${avg.toFixed(1)}, max channel mean=${max.toFixed(1)}, ` +
      `dominance=${dominance ? dominance.toFixed(3) : 'n/a'} ` +
      `mean channels=[${mean.map((m) => m.toFixed(1)).join(', ')}]`
  )
}
