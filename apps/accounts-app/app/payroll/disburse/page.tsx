'use client'

import { useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseClient } from "@/app/lib/supabase"
import { createJournalEntry } from "@/lib/accounting"
import { getAccountId } from "@/lib/accounts-map"
import { buildRef, saveLocalRecord, todayIso } from "@/lib/operations"

type PayrollLine = {
  id: string
  employeeCode: string
  employeeName: string
  role: string
  department: string
  idNumber: string
  taxNumber: string
  bankName: string
  bankAccount: string
  hours: number
  rate: number
  allowance: number
  deduction: number
  tax: number
}

const round2 = (value: number) => Number(value.toFixed(2))
const UIF_RATE = 0.01
const UIF_MONTHLY_CAP = 177.12
const SDL_RATE = 0.01
const PRIMARY_REBATE_ANNUAL = 17235

function calculatePayeMonthly(grossMonthly: number) {
  const annual = grossMonthly * 12
  let annualTax = 0
  if (annual <= 237100) annualTax = annual * 0.18
  else if (annual <= 370500) annualTax = 42678 + (annual - 237100) * 0.26
  else if (annual <= 512800) annualTax = 77362 + (annual - 370500) * 0.31
  else if (annual <= 673000) annualTax = 121475 + (annual - 512800) * 0.36
  else if (annual <= 857900) annualTax = 179147 + (annual - 673000) * 0.39
  else if (annual <= 1817000) annualTax = 251258 + (annual - 857900) * 0.41
  else annualTax = 644489 + (annual - 1817000) * 0.45

  const annualAfterRebate = Math.max(0, annualTax - PRIMARY_REBATE_ANNUAL)
  return round2(annualAfterRebate / 12)
}

function calculateStatutory(grossMonthly: number) {
  const paye = calculatePayeMonthly(grossMonthly)
  const uif = round2(Math.min(grossMonthly * UIF_RATE, UIF_MONTHLY_CAP))
  const sdl = round2(grossMonthly * SDL_RATE)
  const total = round2(paye + uif + sdl)
  return { paye, uif, sdl, total }
}

export default function PayrollBatchPage() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [period, setPeriod] = useState("")
  const [payDate, setPayDate] = useState("")
  const [companyName, setCompanyName] = useState("Sebenza Nathi Waste")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [companyRegistrationNo, setCompanyRegistrationNo] = useState("")
  const [companyVatNo, setCompanyVatNo] = useState("")
  const [batchType, setBatchType] = useState("monthly")
  const [programme, setProgramme] = useState("Sebenza Nathi Waste Payroll")
  const [paymentMethod, setPaymentMethod] = useState("eft")
  const [approver, setApprover] = useState("")
  const [projectCode, setProjectCode] = useState("")
  const [bankReference, setBankReference] = useState("")
  const [notes, setNotes] = useState("")
  const [lines, setLines] = useState<PayrollLine[]>([
    {
      id: buildRef("EMP"),
      employeeCode: "",
      employeeName: "",
      role: "",
      department: "",
      idNumber: "",
      taxNumber: "",
      bankName: "",
      bankAccount: "",
      hours: 160,
      rate: 0,
      allowance: 0,
      deduction: 0,
      tax: 0,
    },
  ])

  const totals = useMemo(() => {
    let totalGross = 0
    let totalDeductions = 0
    let totalNet = 0
    let people = 0

    for (const line of lines) {
      if (!line.employeeName.trim()) continue
      const gross = line.hours * line.rate + line.allowance
      const statutory = calculateStatutory(gross)
      const deductions = line.deduction + statutory.total
      const net = gross - deductions
      totalGross += gross
      totalDeductions += deductions
      totalNet += net
      people += 1
    }

    return {
      people,
      totalGross: round2(totalGross),
      totalDeductions: round2(totalDeductions),
      totalNet: round2(totalNet),
    }
  }, [lines])

  const updateLine = (id: string, patch: Partial<PayrollLine>) => {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)))
  }

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: buildRef("EMP"),
        employeeCode: "",
        employeeName: "",
        role: "",
        department: "",
        idNumber: "",
        taxNumber: "",
        bankName: "",
        bankAccount: "",
        hours: 160,
        rate: 0,
        allowance: 0,
        deduction: 0,
        tax: 0,
      },
    ])
  }

  const removeLine = (id: string) => {
    setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev))
  }

  const resetForm = () => {
    setPeriod("")
    setPayDate("")
    setCompanyName("Sebenza Nathi Waste")
    setCompanyAddress("")
    setCompanyPhone("")
    setCompanyEmail("")
    setCompanyRegistrationNo("")
    setCompanyVatNo("")
    setBatchType("monthly")
    setProgramme("Sebenza Nathi Waste Payroll")
    setPaymentMethod("eft")
    setApprover("")
    setProjectCode("")
    setBankReference("")
    setNotes("")
    setFeedback(null)
    setLines([
      {
        id: buildRef("EMP"),
        employeeCode: "",
        employeeName: "",
        role: "",
        department: "",
        idNumber: "",
        taxNumber: "",
        bankName: "",
        bankAccount: "",
        hours: 160,
        rate: 0,
        allowance: 0,
        deduction: 0,
        tax: 0,
      },
    ])
  }

  const generatePayslipsPdf = async () => {
    const validLines = lines.filter((line) => line.employeeName.trim())
    if (!validLines.length) {
      setFeedback({ type: "error", text: "Add at least one employee line before generating payslips." })
      return
    }

    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
    const currency = (value: number) => `R ${value.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const logoImg = await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = "/Sebenza-Logo.png"
    })

    validLines.forEach((line, index) => {
      if (index > 0) doc.addPage()

      const gross = round2(line.hours * line.rate + line.allowance)
      const statutory = calculateStatutory(gross)
      const deductions = round2(line.deduction + statutory.total)
      const net = round2(gross - deductions)
      const width = doc.internal.pageSize.getWidth()
      const margin = 36
      const fullW = width - margin * 2
      const darkGray = [46, 46, 50] as const
      const mediumGray = [93, 93, 99] as const
      const lightGray = [243, 243, 245] as const
      const lineGray = [198, 198, 203] as const
      const orange = [242, 126, 33] as const

      const drawSectionHeader = (label: string, y: number) => {
        doc.setFillColor(...darkGray)
        doc.rect(margin, y, fullW, 16, "F")
        doc.setFillColor(...orange)
        doc.rect(margin, y, 5, 16, "F")
        doc.setTextColor(255, 255, 255)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text(label, margin + 12, y + 11)
      }

      const drawTableRow = (y: number, cols: Array<{ text: string; x: number; align?: "left" | "right" }>, bold = false) => {
        doc.setDrawColor(...lineGray)
        doc.line(margin, y + 14, margin + fullW, y + 14)
        doc.setTextColor(35, 35, 35)
        doc.setFont("helvetica", bold ? "bold" : "normal")
        doc.setFontSize(9)
        cols.forEach((col) => {
          doc.text(col.text, col.x, y + 10, { align: col.align ?? "left" })
        })
      }

      // Header (no grey background) – logo left, company centred, PAYSLIP right
      const headerY = 48
      const headerCenterY = headerY + 18
      if (logoImg) {
        const logoH = 32
        const logoW = (logoImg.width / logoImg.height) * logoH
        doc.addImage(logoImg, "PNG", margin, headerY, logoW, logoH)
      }
      doc.setTextColor(35, 35, 35)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.text(companyName || "Sebenza Nathi Waste", width / 2, headerCenterY - 4, { align: "center" })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(...mediumGray)
      doc.text("Payroll Department", width / 2, headerCenterY + 8, { align: "center" })
      doc.setTextColor(...orange)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(17)
      doc.text("PAYSLIP", width - margin, headerCenterY, { align: "right" })

      // Employee + payment summary blocks
      const blockY = 108
      const blockH = 140
      const gap = 12
      const blockW = (fullW - gap) / 2
      doc.setDrawColor(...lineGray)
      doc.rect(margin, blockY, blockW, blockH)
      doc.rect(margin + blockW + gap, blockY, blockW, blockH)

      drawSectionHeader("PAY SUMMARY", blockY)
      doc.setTextColor(35, 35, 35)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(`Employee Name: ${line.employeeName}`, margin + 12, blockY + 34)
      doc.text(`Employee Code: ${line.employeeCode || "-"}`, margin + 12, blockY + 50)
      doc.text(`Role: ${line.role || "-"}`, margin + 12, blockY + 66)
      doc.text(`Department: ${line.department || "-"}`, margin + 12, blockY + 82)
      doc.text(`ID Number: ${line.idNumber || "-"}`, margin + 12, blockY + 98)
      doc.text(`Tax Number: ${line.taxNumber || "-"}`, margin + 12, blockY + 114)
      const rx = margin + blockW + gap + 12
      doc.text(`Pay Date: ${payDate || "-"}`, rx, blockY + 34)
      doc.text(`Period: ${period || "-"}`, rx, blockY + 50)
      doc.text(`Reference: ${bankReference || companyName || "Sebenza Nathi Waste"}`, rx, blockY + 66)
      doc.text(`Bank: ${line.bankName || "-"} / ${line.bankAccount || "-"}`, rx, blockY + 82)
      doc.text(`Company Reg: ${companyRegistrationNo || "-"} | VAT: ${companyVatNo || "-"}`, rx, blockY + 98)
      doc.text(`Contact: ${companyPhone || "-"} | ${companyEmail || "-"}`, rx, blockY + 114)

      // Earnings table
      let y = blockY + blockH + 18
      drawSectionHeader("EARNINGS", y)
      y += 20
      doc.setFillColor(...lightGray)
      doc.rect(margin, y - 2, fullW, 16, "F")
      drawTableRow(
        y,
        [
          { text: "DESCRIPTION", x: margin + 8 },
          { text: "HOURS", x: margin + fullW - 210, align: "right" },
          { text: "RATE", x: margin + fullW - 130, align: "right" },
          { text: "CURRENT", x: margin + fullW - 8, align: "right" },
        ],
        true
      )
      y += 16
      drawTableRow(y, [
        { text: "Standard Pay", x: margin + 8 },
        { text: line.hours.toFixed(2), x: margin + fullW - 210, align: "right" },
        { text: currency(line.rate), x: margin + fullW - 130, align: "right" },
        { text: currency(line.hours * line.rate), x: margin + fullW - 8, align: "right" },
      ])
      y += 16
      drawTableRow(y, [
        { text: "Allowances", x: margin + 8 },
        { text: "-", x: margin + fullW - 210, align: "right" },
        { text: "-", x: margin + fullW - 130, align: "right" },
        { text: currency(line.allowance), x: margin + fullW - 8, align: "right" },
      ])
      y += 16
      drawTableRow(
        y,
        [
          { text: "GROSS PAY", x: margin + fullW - 200, align: "right" },
          { text: currency(gross), x: margin + fullW - 8, align: "right" },
        ],
        true
      )

      // Deductions table
      y += 28
      drawSectionHeader("DEDUCTIONS", y)
      y += 20
      doc.setFillColor(...lightGray)
      doc.rect(margin, y - 2, fullW, 16, "F")
      drawTableRow(
        y,
        [
          { text: "DESCRIPTION", x: margin + 8 },
          { text: "CURRENT", x: margin + fullW - 8, align: "right" },
        ],
        true
      )
      y += 16
      drawTableRow(y, [
        { text: "PAYE Tax", x: margin + 8 },
        { text: currency(statutory.paye), x: margin + fullW - 8, align: "right" },
      ])
      y += 16
      drawTableRow(y, [
        { text: "UIF", x: margin + 8 },
        { text: currency(statutory.uif), x: margin + fullW - 8, align: "right" },
      ])
      y += 16
      drawTableRow(y, [
        { text: "SDL", x: margin + 8 },
        { text: currency(statutory.sdl), x: margin + fullW - 8, align: "right" },
      ])
      y += 16
      drawTableRow(y, [
        { text: "Other Deductions", x: margin + 8 },
        { text: currency(line.deduction), x: margin + fullW - 8, align: "right" },
      ])
      y += 16
      drawTableRow(
        y,
        [
          { text: "TOTAL DEDUCTIONS", x: margin + fullW - 200, align: "right" },
          { text: currency(deductions), x: margin + fullW - 8, align: "right" },
        ],
        true
      )

      // Net pay banner and footer
      y += 24
      doc.setFillColor(...darkGray)
      doc.rect(margin, y, fullW, 26, "F")
      doc.setDrawColor(...lineGray)
      doc.rect(margin, y, fullW, 26)
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("NET PAY", margin + 10, y + 17)
      doc.setTextColor(...orange)
      doc.text(currency(net), margin + fullW - 10, y + 17, { align: "right" })

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(...mediumGray)
      doc.text("If you have any queries about this payslip, please contact payroll.", width / 2, 792, { align: "center" })
    })

    doc.save(`sebenza-payslips-${period || todayIso()}.pdf`)
    setFeedback({ type: "success", text: "Payslip PDF generated successfully." })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!period || !payDate || totals.totalGross <= 0 || totals.people <= 0) return

    setSubmitting(true)
    setFeedback(null)
    try {
      const supabase = getSupabaseClient()
      const runNumber = buildRef("PAYRUN")

      const { data: run, error } = await supabase
        .from("accounting_payroll_runs")
        .insert({
          run_number: runNumber,
          period_name: period,
          period_label: period,
          pay_date: payDate,
          total_amount: totals.totalGross,
          status: "processed",
          source: `${programme} (${batchType})`,
          company_name: companyName || null,
          company_address: companyAddress || null,
          company_phone: companyPhone || null,
          company_email: companyEmail || null,
          company_registration_no: companyRegistrationNo || null,
          company_vat_no: companyVatNo || null,
          project_code: projectCode || null,
        })
        .select("*")
        .single()
      if (error) throw error

      const payrollExpense = await getAccountId("5-300")
      const payrollPayable = await getAccountId("2-300")
      const statutoryPayable = await getAccountId("2-400")

      await createJournalEntry({
        entry_number: `PAY-${runNumber}`,
        entry_date: payDate || todayIso(),
        description: `Business payroll run - ${period} (${programme})`,
        source_module: "PAYROLL",
        source_id: run.id,
        lines: [
          { account_id: payrollExpense, debit: totals.totalGross, project_code: projectCode || undefined },
          { account_id: payrollPayable, credit: totals.totalNet, project_code: projectCode || undefined },
          { account_id: statutoryPayable, credit: totals.totalDeductions, project_code: projectCode || undefined },
        ],
      })

      await supabase.from("accounting_payroll_lines").insert(
        lines
          .filter((line) => line.employeeName.trim())
          .map((line) => {
            const gross = round2(line.hours * line.rate + line.allowance)
            const statutory = calculateStatutory(gross)
            const deductions = round2(line.deduction + statutory.total)
            const net = round2(gross - deductions)
            return {
              payroll_run_id: run.id,
              employee_code: line.employeeCode || null,
              employee_name: line.employeeName,
              role: line.role || null,
              department: line.department || null,
              id_number: line.idNumber || null,
              tax_number: line.taxNumber || null,
              bank_name: line.bankName || null,
              bank_account: line.bankAccount || null,
              hours_worked: line.hours,
              rate: line.rate,
              allowances: line.allowance,
              deductions: line.deduction,
              tax: statutory.total,
              gross_amount: gross,
              net_amount: net,
            }
          })
      )

      resetForm()
      setFeedback({ type: "success", text: "Business payroll batch posted successfully." })
    } catch (err) {
      saveLocalRecord("accounting_local_payroll_runs", {
        id: buildRef("LPAY"),
        period_name: period,
        pay_date: payDate,
        total_amount: totals.totalGross,
        beneficiary_count: totals.people,
        total_deductions: totals.totalDeductions,
        net_disbursement: totals.totalNet,
        company_name: companyName || null,
        company_address: companyAddress || null,
        company_phone: companyPhone || null,
        company_email: companyEmail || null,
        company_registration_no: companyRegistrationNo || null,
        company_vat_no: companyVatNo || null,
        payment_method: paymentMethod,
        batch_type: batchType,
        programme,
        approver,
        bank_reference: bankReference,
        notes,
        lines,
        project_code: projectCode || null,
        created_at: new Date().toISOString(),
      })
      console.error(err)
      setFeedback({
        type: "error",
        text: "Saved payroll batch locally because database posting failed.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Run Business Payroll</CardTitle>
          <CardDescription>
            Run payroll for staff and stipend beneficiaries, capture hours/rates/deductions, generate payslips, and post payroll journals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {feedback && (
              <div
                className={`rounded-md border px-3 py-2 text-sm ${
                  feedback.type === "success"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-amber-300 bg-amber-50 text-amber-700"
                }`}
              >
                {feedback.text}
              </div>
            )}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Company Information (for Payslip)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="companyRegistrationNo">Registration Number</Label>
                  <Input
                    id="companyRegistrationNo"
                    value={companyRegistrationNo}
                    onChange={(e) => setCompanyRegistrationNo(e.target.value)}
                    placeholder="e.g. 2016/123456/07"
                  />
                </div>
                <div>
                  <Label htmlFor="companyVatNo">VAT Number</Label>
                  <Input
                    id="companyVatNo"
                    value={companyVatNo}
                    onChange={(e) => setCompanyVatNo(e.target.value)}
                    placeholder="e.g. 4120271234"
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="e.g. +27 11 000 0000"
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="payroll@sebenza.co.za"
                  />
                </div>
                <div>
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Input
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Street, City, Province"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="period">Payroll Period</Label>
                <Input
                  id="period"
                  name="period"
                  placeholder="e.g. March 2026"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Batch Type</Label>
                <Select value={batchType} onValueChange={setBatchType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="ad-hoc">Ad-hoc Correction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payDate">Payment Date</Label>
                <Input
                  id="payDate"
                  name="payDate"
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Total Gross Payroll (R)</Label>
                <Input value={totals.totalGross.toFixed(2)} readOnly />
              </div>
              <div>
                <Label>Number of People Paid</Label>
                <Input value={totals.people} readOnly />
              </div>
              <div>
                <Label>Total Statutory/Other Deductions (R)</Label>
                <Input value={totals.totalDeductions.toFixed(2)} readOnly />
              </div>
              <div>
                <Label htmlFor="programme">Programme Source</Label>
                <Input
                  id="programme"
                  name="programme"
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Payroll Line Items (Hours, Rates, Deductions)</Label>
                <Button type="button" variant="outline" onClick={addLine}>
                  Add Employee Line
                </Button>
              </div>
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                Enter values per employee: <strong>Hours Worked</strong> (e.g. 160 monthly / actual hours),
                <strong> Hourly Rate</strong> (Rand per hour), <strong>Allowance</strong> (transport/overtime allowance),
                <strong> Other Deductions</strong> (loan/advance/unpaid leave), and <strong>Tax/Statutory</strong>
                (PAYE/UIF/SDL). PAYE/UIF/SDL now auto-calculates from Gross Pay. The form calculates Gross, Deductions, and Net automatically.
              </div>
              <div className="space-y-3">
                {lines.map((line) => {
                  const gross = round2(line.hours * line.rate + line.allowance)
                  const statutory = calculateStatutory(gross)
                  const deductions = round2(line.deduction + statutory.total)
                  const net = round2(gross - deductions)
                  return (
                    <div key={line.id} className="border rounded-md p-3 space-y-3 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input
                          placeholder="Employee code"
                          value={line.employeeCode}
                          onChange={(e) => updateLine(line.id, { employeeCode: e.target.value })}
                        />
                        <Input
                          placeholder="Employee full name"
                          value={line.employeeName}
                          onChange={(e) => updateLine(line.id, { employeeName: e.target.value })}
                        />
                        <Input
                          placeholder="Role / position"
                          value={line.role}
                          onChange={(e) => updateLine(line.id, { role: e.target.value })}
                        />
                        <Button type="button" variant="outline" onClick={() => removeLine(line.id)}>
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input
                          placeholder="Department"
                          value={line.department}
                          onChange={(e) => updateLine(line.id, { department: e.target.value })}
                        />
                        <Input
                          placeholder="ID number / passport"
                          value={line.idNumber}
                          onChange={(e) => updateLine(line.id, { idNumber: e.target.value })}
                        />
                        <Input
                          placeholder="Tax number"
                          value={line.taxNumber}
                          onChange={(e) => updateLine(line.id, { taxNumber: e.target.value })}
                        />
                        <Input
                          placeholder="Bank name"
                          value={line.bankName}
                          onChange={(e) => updateLine(line.id, { bankName: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Bank account number"
                          value={line.bankAccount}
                          onChange={(e) => updateLine(line.id, { bankAccount: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-medium text-gray-600 px-1">
                        <p>Hours Worked</p>
                        <p>Hourly Rate (R)</p>
                        <p>Allowance (R)</p>
                        <p>Other Deductions (R)</p>
                        <p>Tax / Statutory Auto (R)</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.hours}
                          onChange={(e) => updateLine(line.id, { hours: Number(e.target.value || 0) })}
                          placeholder="e.g. 160"
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.rate}
                          onChange={(e) => updateLine(line.id, { rate: Number(e.target.value || 0) })}
                          placeholder="e.g. 28.50"
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.allowance}
                          onChange={(e) => updateLine(line.id, { allowance: Number(e.target.value || 0) })}
                          placeholder="e.g. 650"
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.deduction}
                          onChange={(e) => updateLine(line.id, { deduction: Number(e.target.value || 0) })}
                          placeholder="e.g. 250"
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={statutory.total}
                          readOnly
                          placeholder="Auto"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Auto statutory split: PAYE R {statutory.paye.toFixed(2)} | UIF R {statutory.uif.toFixed(2)} | SDL R {statutory.sdl.toFixed(2)}
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="border rounded-md p-2 bg-white">
                          <p className="text-gray-500">Gross</p>
                          <p className="font-semibold">R {gross.toFixed(2)}</p>
                        </div>
                        <div className="border rounded-md p-2 bg-white">
                          <p className="text-gray-500">Total Deductions</p>
                          <p className="font-semibold">R {deductions.toFixed(2)}</p>
                        </div>
                        <div className="border rounded-md p-2 bg-white">
                          <p className="text-gray-500">Net Pay</p>
                          <p className="font-semibold">R {net.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eft">EFT Batch</SelectItem>
                    <SelectItem value="cash">Cash Payroll</SelectItem>
                    <SelectItem value="wallet">Mobile Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="approver">Approved By</Label>
                <Input
                  id="approver"
                  name="approver"
                  placeholder="Finance manager / approver"
                  value={approver}
                  onChange={(e) => setApprover(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="projectCode">Project / Grant Code</Label>
                <Input
                  id="projectCode"
                  name="projectCode"
                  placeholder="Optional cost centre / funding code"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bankReference">Bank Reference / Batch ID</Label>
                <Input
                  id="bankReference"
                  name="bankReference"
                  placeholder="Optional bank batch reference"
                  value={bankReference}
                  onChange={(e) => setBankReference(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Batch Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Add exceptions, payroll notes, or audit comments."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={generatePayslipsPdf}>
                Generate Payslips PDF
              </Button>
              <Button
                type="reset"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Processing..." : "Run Payroll Batch"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

