import { getFontEmbedCSS, toPng } from 'html-to-image'
import { BRAND_KIT_ONESHEET_FILENAME } from './brand-kit-data'

function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = root.querySelectorAll('img')
  const jobs = Array.from(imgs).map(
    (img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            const done = () => resolve()
            img.addEventListener('load', done, { once: true })
            img.addEventListener('error', done, { once: true })
          }),
  )
  return Promise.all(jobs).then(() => undefined)
}

/**
 * Renders the one-sheet DOM to a PNG and triggers a file download (blob + object URL).
 */
export async function exportBrandKitOneSheetPng(root: HTMLElement): Promise<void> {
  await document.fonts.ready
  await waitForImages(root)

  let fontEmbedCSS: string | undefined
  try {
    fontEmbedCSS = await getFontEmbedCSS(root)
  } catch {
    fontEmbedCSS = undefined
  }

  const dataUrl = await toPng(root, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#fcf8f8',
    ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
  })

  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = BRAND_KIT_ONESHEET_FILENAME
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
