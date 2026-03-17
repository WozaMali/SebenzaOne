export const generateIncomeStatementPdf = async () => {
  const { jsPDF } = await import("jspdf")

  const doc = new jsPDF({ orientation: "landscape" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 32

  // Light grey background similar to app
  doc.setFillColor(245, 248, 252)
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  // White rounded card
  const cardX = margin
  const cardY = 30
  const cardW = pageWidth - margin * 2
  const cardH = pageHeight - cardY - margin
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(225, 225, 225)
  doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, "FD")

  const img = new Image()
  // Logo file should be placed in apps/accounts-app/public as "sebenza-logo.png"
  img.src = "/sebenza-logo.png"

  const drawBodyAndSave = () => {
    const today = new Date().toISOString().slice(0, 10)

    // Header area inside card
    const innerMarginX = cardX + 24
    let y = cardY + 28

    // Right top meta
    const metaX = cardX + cardW - 24
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.text("Income Statement", metaX, y, { align: "right" })
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    y += 11
    doc.text("Reporting Period: ___ / ___ / ____ to ___ / ___ / ____", metaX, y, {
      align: "right",
    })
    y += 11
    doc.text(`Printed on: ${today}`, metaX, y, { align: "right" })

    // Reset y to below logo/title region
    y = cardY + 80

    // Thin divider line
    doc.setDrawColor(228, 232, 239)
    doc.line(innerMarginX, y, cardX + cardW - 24, y)
    y += 18

    // Summary boxes
    const boxWidth = (cardW - 24 * 2 - 20) / 3
    const boxHeight = 40
    const drawBox = (x: number, title: string) => {
      doc.setDrawColor(226, 231, 240)
      doc.roundedRect(x, y, boxWidth, boxHeight, 6, 6)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(85, 90, 100)
      doc.text(title, x + 8, y + 14)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text("R ____________", x + 8, y + 26)
    }
    drawBox(innerMarginX, "Total Income")
    drawBox(innerMarginX + boxWidth + 10, "Total Expenses")
    drawBox(innerMarginX + (boxWidth + 10) * 2, "Net Surplus / (Deficit)")

    // Table title
    y += boxHeight + 28
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(70, 70, 70)
    doc.text("Recycling Income and Expenses by Account", innerMarginX, y)
    y += 10

    // Table header
    const colCode = innerMarginX
    const colName = innerMarginX + 90
    const colCurrent = cardX + cardW - 24 - 110
    const colYtd = cardX + cardW - 24

    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(90, 95, 105)
    doc.text("Account Code", colCode, y)
    doc.text("Account Name", colName, y)
    doc.text("Current Period", colCurrent, y, { align: "right" })
    doc.text("Year-to-Date", colYtd, y, { align: "right" })
    y += 4
    doc.setDrawColor(214, 219, 230)
    doc.line(innerMarginX, y, cardX + cardW - 24, y)
    y += 10

    // Table rows
    const rows: [string, string][] = [
      ["4-200", "Sales - Sebenza Shop"],
      ["4-300", "Sales - Material Recycling"],
      ["4-400", "Compliance Income / Deposits"],
      ["5-100", "COGS - Materials Purchased"],
      ["5-110", "COGS - Shop"],
      ["5-400", "Compliance Fees Expense"],
      ["5-500", "Logistics & Transport"],
      ["5-600", "Admin & Overheads"],
    ]

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 90)

    rows.forEach(([code, name]) => {
      doc.text(code, colCode, y)
      doc.text(name, colName, y)
      doc.text("R ________", colCurrent, y, { align: "right" })
      doc.text("R ________", colYtd, y, { align: "right" })
      y += 14
    })

    // Footer inside card
    const footerY = cardY + cardH - 28
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(110, 110, 120)
    doc.text("Prepared by: ____________________________", innerMarginX, footerY)
    doc.text("Reviewed by: ____________________________", innerMarginX, footerY + 10)
    doc.text("Sebenza Nathi Waste - Income Statement", cardX + cardW - 24, footerY, {
      align: "right",
    })
    doc.text("Page 1 of 1", cardX + cardW - 24, footerY + 10, { align: "right" })

    doc.save(`sebenza-income-statement-${today}.pdf`)
  }

  img.onload = () => {
    // Make logo more compact, closer to UI scale
    const logoHeight = 22
    const logoWidth = (img.width / img.height) * logoHeight
    const logoX = cardX + 32
    const logoY = cardY + 24
    doc.addImage(img, "PNG", logoX, logoY, logoWidth, logoHeight)

    // Company name and subtitle to the right of logo
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 40)
    const textX = logoX + logoWidth + 12
    const textY = logoY + 10
    doc.text("Sebenza Nathi Waste", textX, textY)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(120, 120, 120)
    doc.text("Recycling Operations", textX, textY + 14)

    drawBodyAndSave()
  }

  if (img.complete) {
    img.onload?.(null as any)
  }
}

