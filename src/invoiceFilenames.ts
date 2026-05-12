/** Basename safe for PDF (no extension). Keep in sync with Backend/src/utils/invoiceFilenames.js */
export function sanitizeInvoicePdfBasename(invoiceNumber: string | undefined | null): string {
  if (invoiceNumber == null || invoiceNumber === '') return 'invoice'
  const s = String(invoiceNumber)
    .replace(/[\u0000-\u001f\\/:*?"<>|]/g, '-')
    .replace(/-+/g, '-')
    .trim()
  const t = s.slice(0, 180)
  return t || 'invoice'
}

export function invoicePdfDownloadName(invoiceNumber: string | undefined | null): string {
  return `${sanitizeInvoicePdfBasename(invoiceNumber)}.pdf`
}

export function receiptPdfDownloadName(invoiceNumber: string | undefined | null): string {
  return `${sanitizeInvoicePdfBasename(invoiceNumber)}-receipt.pdf`
}
