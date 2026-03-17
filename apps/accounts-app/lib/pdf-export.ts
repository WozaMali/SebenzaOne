import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

// Shared branding with invoice PDF (one source of truth for report styling)
const COMPANY = {
  name: "Sebenza Nathi Waste",
  address: "652 Hashe Street",
  city: "Dobsonville, Soweto, 1863",
  country: "South Africa",
  email: "info@sebenzanathi.co.za",
  website: "www.sebenzanathi.co.za",
}

const COLORS = {
  primary: [46, 64, 87] as const,
  accent: [180, 188, 200] as const,
  highlight: [212, 96, 16] as const,
  dark: [40, 40, 40] as const,
  medium: [90, 90, 90] as const,
  lightRow: [245, 246, 248] as const,
  line: [210, 210, 215] as const,
}

export type TableReportColumn = {
  key: string
  label: string
  format?: "text" | "number" | "currency" | "date"
}

export type TableReportPdfOptions = {
  title: string
  subtitle?: string
  columns: TableReportColumn[]
  rows: Record<string, unknown>[]
  filename?: string
}

function formatCell(value: unknown, format?: string): string {
  if (value == null || value === "") return ""
  if (format === "currency" && typeof value === "number")
    return `R${value.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (format === "number" && typeof value === "number") return String(value)
  if (format === "date" && (typeof value === "string" || value instanceof Date))
    return new Date(value as string).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
  return String(value)
}

export async function generateTableReportPdf(options: TableReportPdfOptions): Promise<void> {
  const { title, subtitle, columns, rows, filename } = options
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  const margin = 40
  const tableW = width - margin * 2
  const colW = tableW / columns.length
  const rowH = 18
  const headerH = 22

  let y = margin

  // Logo (optional)
  const logoImg = await new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = "/Sebenza-Logo.png"
  })
  if (logoImg) {
    const logoH = 32
    const logoW = (logoImg.width / logoImg.height) * logoH
    doc.addImage(logoImg, "PNG", margin, y, logoW, logoH)
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(...COLORS.dark)
  doc.text(title, width - margin, y + 20, { align: "right" })
  if (subtitle) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.medium)
    doc.text(subtitle, width - margin, y + 36, { align: "right" })
  }
  y += 52

  // Table header
  doc.setFillColor(247, 247, 249)
  doc.rect(margin, y, tableW, headerH, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.dark)
  columns.forEach((col, i) => {
    doc.text(col.label, margin + i * colW + 6, y + 15)
  })
  y += headerH + 4

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  let stripe = false
  for (const row of rows) {
    if (y + rowH > height - margin - 40) {
      doc.addPage([width, height], "landscape")
      y = margin
      doc.setFillColor(247, 247, 249)
      doc.rect(margin, y, tableW, headerH, "F")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      columns.forEach((col, i) => {
        doc.text(col.label, margin + i * colW + 6, y + 15)
      })
      y += headerH + 4
      doc.setFont("helvetica", "normal")
      stripe = false
    }
    if (stripe) {
      doc.setFillColor(...COLORS.lightRow)
      doc.rect(margin, y - 4, tableW, rowH, "F")
    }
    stripe = !stripe
    columns.forEach((col, i) => {
      const val = row[col.key]
      const text = formatCell(val, col.format)
      const x = margin + i * colW + 6
      doc.setTextColor(...COLORS.dark)
      doc.text(text.slice(0, 25), x, y + 12)
    })
    y += rowH
  }

  y += 16
  doc.setDrawColor(...COLORS.line)
  doc.line(margin, y, width - margin, y)
  y += 20
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.medium)
  doc.text(COMPANY.name, margin, y)
  doc.text(`${COMPANY.address}, ${COMPANY.city}`, margin, y + 10)
  doc.text(COMPANY.country, margin, y + 20)
  doc.text(`Email: ${COMPANY.email}`, width - margin, y, { align: "right" })
  doc.text(`Web: ${COMPANY.website}`, width - margin, y + 10, { align: "right" })

  doc.save(filename || `${title.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`)
}

type ElementPdfOptions = {
  elementId: string
  filename: string
}

export async function downloadReportElementPdf({ elementId, filename }: ElementPdfOptions) {
  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  })
  const imgData = canvas.toDataURL("image/png")

  const pdf = new jsPDF("landscape", "pt", "a4")
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const imgWidth = pdfWidth - 40
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  const x = (pdfWidth - imgWidth) / 2
  const y = 24

  pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight)
  pdf.save(filename)
}

export function downloadReportCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

