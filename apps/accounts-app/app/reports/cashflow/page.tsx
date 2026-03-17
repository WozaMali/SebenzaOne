'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import SebenzaLogo from "../../../Sebenza Nathi Waste Logo.png"
import { downloadReportCsv, downloadReportElementPdf } from "@/lib/pdf-export"

export default function CashFlowStatementPage() {
  const today = new Date().toLocaleDateString()
  const fileDate = new Date().toISOString().split("T")[0]

  const handleExportPDF = async () => {
    await downloadReportElementPdf({
      elementId: "cashflow-report",
      filename: `sebenza-cashflow-${fileDate}.pdf`,
    })
  }

  const handleExportExcel = () => {
    const headers = ["Section", "Description", "Amount"]
    const rows = [
      ["Operating", "Cash received from customers (Sebenza Shop & material sales)", ""],
      ["Operating", "Cash paid to suppliers (material purchases, services)", ""],
      ["Operating", "Compliance fees paid (EPR, landfill, certificates)", ""],
      ["Operating", "Logistics & transport payments", ""],
      ["Investing", "Purchase of recycling equipment / infrastructure", ""],
      ["Financing", "Grants / capital injections received", ""],
      ["Financing", "Loan drawdowns / repayments", ""],
    ]
    downloadReportCsv(`cashflow_${fileDate}.csv`, headers, rows)
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
        id="cashflow-report"
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
              <p className="font-semibold">Cash Flow Statement</p>
              <p>Reporting Period: ____ / ____ / ______ to ____ / ____ / ______</p>
              <p>Printed on: {today}</p>
            </div>
          </div>
        </header>

        <main className="text-xs text-gray-800 space-y-6">
          <section className="grid grid-cols-3 gap-4 mb-2">
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Net Cash from Operating</p>
              <p>R ____________</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Net Cash from Investing</p>
              <p>R ____________</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Net Cash from Financing</p>
              <p>R ____________</p>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <h2 className="font-semibold mb-1">Operating Activities</h2>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1 text-left">Description</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Cash received from customers (shop & material sales)</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Cash paid to material suppliers &amp; services</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Compliance fees paid (EPR, landfill, etc.)</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Logistics &amp; transport cash outflows</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col-span-1">
              <h2 className="font-semibold mb-1">Investing Activities</h2>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1 text-left">Description</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Purchase of recycling equipment / infrastructure</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col-span-1">
              <h2 className="font-semibold mb-1">Financing Activities</h2>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1 text-left">Description</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Grants / capital injections received</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Loan drawdowns / repayments</td>
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
            <p>Sebenza Nathi Waste – Cash Flow Statement</p>
            <p>Page 1 of 1</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
