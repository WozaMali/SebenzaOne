'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import SebenzaLogo from "../../../Sebenza Nathi Waste Logo.png"
import { downloadReportCsv, downloadReportElementPdf } from "@/lib/pdf-export"

export default function IncomeStatementPage() {
  const today = new Date().toLocaleDateString()
  const fileDate = new Date().toISOString().split("T")[0]

  const handleExportPDF = async () => {
    await downloadReportElementPdf({
      elementId: "income-report",
      filename: `sebenza-income-statement-${fileDate}.pdf`,
    })
  }

  const handleExportExcel = () => {
    const headers = ["Account Code", "Account Name", "Current Period", "Year-to-Date"]
    const rows = [
      ["4‑200", "Sales – Sebenza Shop", "", ""],
      ["4‑300", "Sales – Material Recycling", "", ""],
      ["4‑400", "Compliance Income / Deposits", "", ""],
      ["5‑100", "COGS – Materials Purchased", "", ""],
      ["5‑110", "COGS – Shop", "", ""],
      ["5‑400", "Compliance Fees Expense", "", ""],
      ["5‑500", "Logistics & Transport", "", ""],
      ["5‑600", "Admin & Overheads", "", ""],
    ]
    downloadReportCsv(`income_statement_${fileDate}.csv`, headers, rows)
  }

  return (
    <div className="p-4 md:p-8">
      {/* Controls (not included in captured PDF area) */}
      <div className="flex justify-end mb-2 no-print max-w-6xl mx-auto">
        <Button size="sm" variant="outline" onClick={handleExportPDF} className="mr-2">
          PDF
        </Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}>
          Excel
        </Button>
      </div>
      <div
        id="income-report"
        className="report-page mx-auto max-w-6xl border border-gray-300 shadow-sm rounded-lg bg-white"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-300 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <Image src={SebenzaLogo} alt="Sebenza Nathi Waste" className="h-10 w-auto" priority />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Sebenza Nathi Waste</h1>
              <p className="text-xs text-gray-600">Recycling Operations</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-right text-xs text-gray-700">
              <p className="font-semibold">Income Statement</p>
              <p>Reporting Period: ____ / ____ / ______ to ____ / ____ / ______</p>
              <p>Printed on: {today}</p>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="text-xs text-gray-800 space-y-6">
          {/* Summary row */}
          <section className="grid grid-cols-3 gap-4 mb-4 mt-2">
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Total Income</p>
              <p>R ____________</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Total Expenses</p>
              <p>R ____________</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Net Surplus / (Deficit)</p>
              <p>R ____________</p>
            </div>
          </section>

          {/* Detailed table */}
          <section className="mt-2">
            <h2 className="font-semibold mb-1">Recycling Income and Expenses by Account</h2>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-left">Account Code</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Account Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Current Period</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Year‑to‑Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">4‑200</td>
                  <td className="border border-gray-300 px-2 py-1">Sales – Sebenza Shop</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">4‑300</td>
                  <td className="border border-gray-300 px-2 py-1">Sales – Material Recycling</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">4‑400</td>
                  <td className="border border-gray-300 px-2 py-1">Compliance Income / Deposits</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">5‑100</td>
                  <td className="border border-gray-300 px-2 py-1">COGS – Materials Purchased</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">5‑110</td>
                  <td className="border border-gray-300 px-2 py-1">COGS – Shop</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">5‑400</td>
                  <td className="border border-gray-300 px-2 py-1">Compliance Fees Expense</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">5‑500</td>
                  <td className="border border-gray-300 px-2 py-1">Logistics & Transport</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">5‑600</td>
                  <td className="border border-gray-300 px-2 py-1">Admin & Overheads</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
              </tbody>
            </table>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-10 pt-4 border-t border-gray-300 flex justify-between text-[10px] text-gray-600">
          <div>
            <p>Prepared by: ____________________________</p>
            <p>Reviewed by: ____________________________</p>
          </div>
          <div className="text-right">
            <p>Sebenza Nathi Waste – Income Statement</p>
            <p>Page 1 of 1</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
