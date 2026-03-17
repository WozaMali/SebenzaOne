'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import SebenzaLogo from "../../../Sebenza Nathi Waste Logo.png"
import { downloadReportCsv, downloadReportElementPdf } from "@/lib/pdf-export"

export default function BalanceSheetPage() {
  const today = new Date().toLocaleDateString()
  const fileDate = new Date().toISOString().split("T")[0]

  const handleExportPDF = async () => {
    await downloadReportElementPdf({
      elementId: "balance-report",
      filename: `sebenza-balance-sheet-${fileDate}.pdf`,
    })
  }

  const handleExportExcel = () => {
    const headers = ["Section", "Account", "Balance"]
    const rows = [
      ["Asset", "Bank Accounts", ""],
      ["Asset", "Accounts Receivable", ""],
      ["Asset", "Inventory & Bales", ""],
      ["Asset", "Prepaid Compliance Fees", ""],
      ["Liability", "Accounts Payable – Suppliers", ""],
      ["Liability", "Compliance Fees Payable", ""],
      ["Liability", "Loans & Other Liabilities", ""],
      ["Equity", "Opening Equity", ""],
      ["Equity", "Current Year Surplus / (Deficit)", ""],
    ]
    downloadReportCsv(`balance_sheet_${fileDate}.csv`, headers, rows)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-end mb-2 no-print max-w-6xl mx-auto">
        <Button size="sm" variant="outline" onClick={handleExportPDF} className="mr-2">
          PDF
        </Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}>
          Excel
        </Button>
      </div>
      <div
        id="balance-report"
        className="report-page mx-auto max-w-6xl border border-gray-300 shadow-sm rounded-lg bg-white"
      >
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
              <p className="font-semibold">Balance Sheet</p>
              <p>As at: ____ / ____ / ______</p>
              <p>Printed on: {today}</p>
            </div>
          </div>
        </header>

        <main className="text-xs text-gray-800 space-y-6">
          <section className="grid grid-cols-3 gap-4 mb-2">
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Total Assets</p>
              <p>R ____________</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Total Liabilities</p>
              <p>R ____________</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Total Equity</p>
              <p>R ____________</p>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <h2 className="font-semibold mb-1">Assets</h2>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1 text-left">Account</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Bank Accounts</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Accounts Receivable</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Inventory &amp; Bales</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Prepaid Compliance Fees</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col-span-1">
              <h2 className="font-semibold mb-1">Liabilities</h2>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1 text-left">Account</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Accounts Payable – Suppliers</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Compliance Fees Payable</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Loans &amp; Other Liabilities</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col-span-1">
              <h2 className="font-semibold mb-1">Equity</h2>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1 text-left">Account</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Opening Equity</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Current Year Surplus / (Deficit)</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <footer className="mt-10 pt-4 border-t border-gray-300 flex justify-between text-[10px] text-gray-600">
          <div>
            <p>Prepared by: ____________________________</p>
            <p>Reviewed by: ____________________________</p>
          </div>
          <div className="text-right">
            <p>Sebenza Nathi Waste – Balance Sheet</p>
            <p>Page 1 of 1</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
