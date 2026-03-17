/**
 * Professional invoice PDF export for Sebenza Nathi Waste
 * Layout inspired by modern tax invoices with clear hierarchy and branding
 */

import { jsPDF } from "jspdf"

export type InvoiceLineItem = {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export type InvoiceForPdf = {
  number: string
  client: string
  clientAddress?: string
  shippingAddress?: string
  issueDate: string
  deliveryDate?: string
  dueDate: string
  description?: string
  amount: number
  tax?: number
  taxRate?: number // e.g. 0.15 for 15% VAT
  lineItems?: InvoiceLineItem[]
  status?: string
  paymentMethod?: string
  poNumber?: string
  companyBankDetails?: string
  clientVatNumber?: string
}

const COMPANY = {
  name: "Sebenza Nathi Waste",
  tagline: "Recycling Operations",
  address: "652 Hashe Street",
  city: "Dobsonville, Soweto, 1863",
  country: "South Africa",
  phone: "+27 11 988 6191",
  email: "info@sebenzanathi.co.za",
  website: "www.sebenzanathi.co.za",
}

const COLORS = {
  primary: [46, 64, 87] as const,        // Deep navy for general headers
  accent: [180, 188, 200] as const,      // Light grey-blue
  highlight: [212, 96, 16] as const,     // Dark orange highlight (date + amount cards)
  dark: [40, 40, 40] as const,           // Dark text
  medium: [90, 90, 90] as const,         // Secondary text
  lightRow: [245, 246, 248] as const,    // Table stripe
  line: [210, 210, 215] as const,
  white: [255, 255, 255] as const,
}

const CARD_BORDER_W = 1.75

export async function generateInvoicePdf(invoice: InvoiceForPdf, filename?: string): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  const margin = 40

  const fmt = (n: number) =>
    `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  const issueDate = invoice.issueDate
  const deliveryDate = invoice.deliveryDate || invoice.issueDate
  const dueDate = invoice.dueDate
  const paymentMethod = invoice.paymentMethod || "CASH ON DELIVERY"
  const poNumber = invoice.poNumber || invoice.number

  // Load logo
  const logoImg = await new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = "/Sebenza-Logo.png"
  })

  // === Top header ===
  let y = margin

  if (logoImg) {
    const logoH = 42
    const logoW = (logoImg.width / logoImg.height) * logoH
    doc.addImage(logoImg, "PNG", margin, y, logoW, logoH)
  }

  // Right-hand date block - compact dark orange card containing labels and values
  const blockW = 220
  const blockX = width - margin - blockW
  const blockH = 60

  doc.setFillColor(...COLORS.highlight)
  doc.rect(blockX, y, blockW, blockH, "F")

  const rowH = 14
  const labelStartY = y + 18

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.white)
  doc.text("ISSUE DATE", blockX + 12, labelStartY)
  doc.text("DELIVERY DATE", blockX + 12, labelStartY + rowH)
  doc.text("DUE DATE", blockX + 12, labelStartY + rowH * 2)

  doc.setFontSize(9)
  const valueX = blockX + blockW - 12
  doc.text(fmtDate(issueDate), valueX, labelStartY, { align: "right" })
  doc.text(fmtDate(deliveryDate), valueX, labelStartY + rowH, { align: "right" })
  doc.text(fmtDate(dueDate), valueX, labelStartY + rowH * 2, { align: "right" })

  // Invoice label box under logo
  y += 70
  // Stretch the TAX INVOICE card to the end (right margin)
  const invBoxW = width - margin * 2
  const invBoxH = 40
  doc.setFillColor(...COLORS.accent)
  doc.rect(margin, y, invBoxW, invBoxH, "F")
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(8)
  doc.text("TAX INVOICE", margin + 14, y + 16)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text(invoice.number, margin + 14, y + 32)

  y += invBoxH + 20

  // === Supplier / shipping / client columns ===
  const colW = (width - margin * 2) / 3

  const drawAddressBlock = (
    label: string,
    name: string,
    addressLines: string[],
    x: number,
    yPos: number,
    boxW: number,
    boxH: number
  ) => {
    // Box
    doc.setDrawColor(...COLORS.line)
    doc.setLineWidth(CARD_BORDER_W)
    doc.rect(x, yPos - 8, boxW, boxH, "S")

    const padX = 10
    const startX = x + padX
    const startY = yPos

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.medium)
    doc.text(label, startX, startY)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.dark)
    doc.text(name, startX, startY + 14)
    doc.setTextColor(...COLORS.medium)
    let yy = startY + 28
    addressLines.forEach((ln) => {
      doc.text(ln, startX, yy)
      yy += 12
    })
  }

  const addrBoxH = 70
  const addrBoxW = colW - 14
  const boxGap = 7

  drawAddressBlock(
    "PAYABLE TO",
    COMPANY.name,
    [COMPANY.address, COMPANY.city, COMPANY.country],
    margin,
    y,
    addrBoxW,
    addrBoxH
  )

  drawAddressBlock(
    "BILL TO",
    invoice.client,
    [
      invoice.shippingAddress || invoice.clientAddress || "",
      ...(invoice.clientVatNumber ? [`VAT: ${invoice.clientVatNumber}`] : []),
    ].filter(Boolean) as string[],
    margin + colW + boxGap,
    y,
    addrBoxW,
    addrBoxH
  )

  drawAddressBlock(
    "CLIENT",
    invoice.client,
    invoice.clientAddress ? [invoice.clientAddress] : [],
    margin + colW * 2 + boxGap * 2,
    y,
    addrBoxW,
    addrBoxH
  )

  y += addrBoxH + 10

  // Payment + PO row
  // Single card holding both fields
  // Align card so its RIGHT EDGE matches the BILL TO box right edge
  const billToRightX = margin + colW + boxGap + addrBoxW
  const payCardX = margin
  const payCardW = billToRightX - payCardX
  const payCardH = 38
  doc.setDrawColor(...COLORS.line)
  doc.setLineWidth(CARD_BORDER_W)
  doc.rect(payCardX, y - 10, payCardW, payCardH, "S")

  const payPadX = 10
  const payLeftX = payCardX + payPadX
  const payRightX = payCardX + payCardW / 2 + payPadX

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.medium)
  doc.text("PAYMENT METHOD", payLeftX, y)
  doc.text("PO NUMBER", payRightX, y)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.dark)
  doc.text(paymentMethod.toUpperCase(), payLeftX, y + 16)
  doc.text(poNumber, payRightX, y + 16)

  // Thank you text aligned with totals / orange cards on the right
  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  doc.setTextColor(...COLORS.dark)
  const thanksX = blockX + blockW - 8
  doc.text("THANK YOU FOR YOUR", thanksX, y + 6, { align: "right" })
  doc.text("PURCHASE.", thanksX, y + 26, { align: "right" })

  y += 50

  // === Items table ===
  const tableX = margin
  const tableW = width - margin * 2

  // Column positions based on total table width for better spacing in landscape
  const colItem = tableX + tableW * 0.03
  const colDesc = tableX + tableW * 0.18
  // Pull quantity slightly left so it is not crowded against Unit Price
  const colQty = tableX + tableW * 0.50
  const colUnit = tableX + tableW * 0.68
  const colDiscount = tableX + tableW * 0.80
  // Align TOTAL column values with the right edge of the orange cards (date + amount due)
  const colTotal = blockX + blockW - 8

  const lineItems =
    invoice.lineItems && invoice.lineItems.length > 0
      ? invoice.lineItems
      : [
          {
            // Fall back to whatever description was captured on the invoice,
            // and only use a generic label if absolutely nothing was provided.
            description: invoice.description && invoice.description.trim().length > 0 ? invoice.description : "Item",
            quantity: 1,
            unitPrice: invoice.amount,
            amount: invoice.amount,
          },
        ]

  // table header background (light grey band just for the header row)
  doc.setFillColor(247, 247, 249)
  const headerY = y
  const headerH = 20
  doc.rect(tableX, headerY, tableW, headerH, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.dark)
  const headerBaseline = headerY + 14
  doc.text("ITEM", colItem, headerBaseline)
  doc.text("DESCRIPTION", colDesc, headerBaseline)
  doc.text("QUANTITY", colQty, headerBaseline)
  doc.text("UNIT PRICE", colUnit, headerBaseline, { align: "right" })
  doc.text("DISCOUNT", colDiscount, headerBaseline, { align: "right" })
  doc.text("TOTAL", colTotal, headerBaseline, { align: "right" })

  // Move the first data row a bit further down so it is clearly outside the grey header band
  y = headerY + headerH + 10

  let stripe = false
  let subtotal = 0

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.dark)

  lineItems.forEach((item, index) => {
    const rowH = 22
    if (stripe) {
      doc.setFillColor(...COLORS.lightRow)
      doc.rect(tableX, y - 12, tableW, rowH, "F")
    }
    stripe = !stripe

    const total = item.amount
    subtotal += total

    // ITEM column shows row number; DESCRIPTION column shows the actual item description
    doc.text(String(index + 1), colItem, y)
    doc.text(item.description || "", colDesc, y)
    doc.text(String(item.quantity), colQty, y, { align: "right" })
    doc.text(fmt(item.unitPrice), colUnit, y, { align: "right" })
    doc.text("0%", colDiscount, y, { align: "right" })
    doc.text(fmt(total), colTotal, y, { align: "right" })

    y += rowH
  })

  // Totals summary rows
  const taxRate = invoice.taxRate ?? 0.15
  const taxAmount = invoice.tax ?? Math.round(subtotal * taxRate * 100) / 100
  const totalIncl = subtotal + taxAmount

  // Align totals so that numeric values are exactly under the TOTAL column
  const summaryValueX = colTotal
  // Place labels so they share the same right edge as the DISCOUNT header
  const summaryLabelX = colDiscount
  const summaryYStart = y + 6

  const drawSummaryRow = (label: string, value: string, yy: number, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal")
    doc.setTextColor(...COLORS.dark)
    // Right-align the label so its edge aligns exactly with the DISCOUNT column header
    doc.text(label, summaryLabelX, yy, { align: "right" })
    doc.text(value, summaryValueX, yy, { align: "right" })
  }

  drawSummaryRow("Total excl. tax", fmt(subtotal), summaryYStart)
  drawSummaryRow(`Tax (VAT) ${Math.round(taxRate * 100)}%`, fmt(taxAmount), summaryYStart + 18)
  drawSummaryRow("Total incl. tax", fmt(totalIncl), summaryYStart + 36)

  // Amount due block, with extra spacing below totals
  const amountBlockY = summaryYStart + 60
  const amountBlockH = 22
  // Match the width and position of the date card (blockX/blockW)
  const amountBlockX = blockX
  const amountBlockW = blockW
  doc.setFillColor(...COLORS.highlight)
  doc.rect(amountBlockX, amountBlockY - 16, amountBlockW, amountBlockH, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.white)
  doc.text("AMOUNT DUE", amountBlockX + 6, amountBlockY)
  doc.text(fmt(totalIncl), amountBlockX + amountBlockW - 8, amountBlockY, { align: "right" })

  // === Footer ===
  const footerY = height - margin - 60
  doc.setDrawColor(...COLORS.line)
  doc.line(margin, footerY, width - margin, footerY)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.medium)
  // Company details left
  doc.text(COMPANY.name, margin, footerY + 14)
  doc.text(`${COMPANY.address}, ${COMPANY.city}`, margin, footerY + 24)
  doc.text(COMPANY.country, margin, footerY + 34)

  // Company banking details (if provided) in the center
  if (invoice.companyBankDetails) {
    const bankLines = invoice.companyBankDetails.split('\n').filter(Boolean)
    let by = footerY + 14
    bankLines.forEach((ln) => {
      doc.text(ln, width / 2, by, { align: "center" })
      by += 10
    })
  }

  // Contact details right
  doc.text(`Email: ${COMPANY.email}`, width - margin, footerY + 14, { align: "right" })
  doc.text(`Web: ${COMPANY.website}`, width - margin, footerY + 24, { align: "right" })

  doc.save(filename || `invoice-${invoice.number.replace(/\s/g, "-")}.pdf`)
}
