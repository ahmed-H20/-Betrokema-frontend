import html2canvas from 'html2canvas'

/**
 * Captures an invoice paper DOM element to a crisp, high-resolution WebP/JPEG Blob (~200KB - 350KB)
 * Identical visual sharpness across mobile phones, tablets, and desktop computers while
 * staying well under Vercel's 4.5MB serverless payload limit (HTTP 413) and saving 95% bandwidth.
 */
export async function captureInvoicePaperToBlob(element: HTMLElement): Promise<Blob | null> {
  if (!element) return null

  // 1. Wait for web fonts (e.g., IBM Plex Sans Arabic) to be fully loaded
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready
    } catch {
      // ignore font loading error
    }
  }

  // 2. Ensure any embedded images (logos, stamps) are fully loaded
  const imgs = Array.from(element.querySelectorAll('img'))
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve(true)
          } else {
            const onFinish = () => resolve(true)
            img.addEventListener('load', onFinish, { once: true })
            img.addEventListener('error', onFinish, { once: true })
            // 1.2s fallback timeout
            setTimeout(onFinish, 1200)
          }
        }),
    ),
  )

  // 3. Small tick to let any SVGs (like QRCodeSVG) settle
  await new Promise((r) => setTimeout(r, 50))

  try {
    const canvas = await html2canvas(element, {
      scale: 1.6, // 1.6x provides ~1270px width (crisp text & QR) with fast rendering and low mobile memory
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
      windowWidth: 1280, // Forces desktop media query evaluation inside the capture iframe
      windowHeight: 1800,
      onclone: (clonedDoc, clonedElement) => {
        // Unhide all parents in the cloned iframe document
        let current: HTMLElement | null = clonedElement
        while (current && current !== clonedDoc.body) {
          current.style.display = 'block'
          current.style.visibility = 'visible'
          current.style.opacity = '1'
          current.style.overflow = 'visible'
          current.style.maxWidth = 'none'
          current.style.transform = 'none'
          current = current.parentElement
        }

        // Lock exact A4 dimensions on the cloned invoice sheet
        clonedElement.style.width = '794px'
        clonedElement.style.minWidth = '794px'
        clonedElement.style.maxWidth = '794px'
        clonedElement.style.margin = '0 auto'
        clonedElement.style.boxSizing = 'border-box'
        clonedElement.style.transform = 'none'
        clonedElement.style.letterSpacing = 'normal'
      },
    })

    // Export to WebP (supported by modern mobile browsers, ~250KB), fallback to high quality JPEG
    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            resolve(blob)
          } else {
            // Fallback to high quality JPEG if WebP is unsupported
            canvas.toBlob((jpegBlob) => resolve(jpegBlob), 'image/jpeg', 0.88)
          }
        },
        'image/webp',
        0.88,
      )
    })
  } catch (err) {
    console.error('Invoice image capture failed:', err)
    return null
  }
}

/**
 * Downloads a Blob as a file in the browser
 */
export function downloadBlob(blob: Blob, filename: string) {
  let finalName = filename
  if (blob.type === 'image/webp' && !finalName.endsWith('.webp')) {
    finalName = finalName.replace(/\.[a-zA-Z0-9]+$/, '') + '.webp'
  } else if (blob.type === 'image/jpeg' && !finalName.endsWith('.jpg') && !finalName.endsWith('.jpeg')) {
    finalName = finalName.replace(/\.[a-zA-Z0-9]+$/, '') + '.jpg'
  }

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = finalName
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Captures an invoice paper DOM element and immediately triggers browser download
 */
export async function captureAndDownloadInvoicePaper(
  element: HTMLElement,
  filename: string,
): Promise<boolean> {
  const blob = await captureInvoicePaperToBlob(element)
  if (!blob) return false
  downloadBlob(blob, filename)
  return true
}
