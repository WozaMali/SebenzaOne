'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import SebenzaLogo from "../../../Sebenza Nathi Waste Logo.png"
import { downloadReportCsv, downloadReportElementPdf } from "@/lib/pdf-export"

export default function FunderReportPage() {
  const today = new Date().toLocaleDateString()
  const fileDate = new Date().toISOString().split("T")[0]

  const handleExportPDF = async () => {
    await downloadReportElementPdf({
      elementId: "funder-report",
      filename: `sebenza-funder-report-${fileDate}.pdf`,
    })
  }

  const handleExportExcel = () => {
    const headers = ["Cost Category", "Budget", "Actual", "Variance"]
    const rows = [
      ["Material Purchases (Suppliers)", "", "", ""],
      ["Processing & Sorting Costs", "", "", ""],
      ["Compliance Fees (EPR, landfill, etc.)", "", "", ""],
      ["Logistics & Transport", "", "", ""],
      ["Admin & Overheads", "", "", ""],
    ]
    downloadReportCsv(`funder_report_${fileDate}.csv`, headers, rows)
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
        id="funder-report"
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
              <p className="font-semibold">Donor / Funder Report</p>
              <p>Grant / Project: ____________________________</p>
              <p>Printed on: {today}</p>
            </div>
          </div>
        </header>

        <main className="text-xs text-gray-800 space-y-6">
          <section className="grid grid-cols-4 gap-4 mb-2">
            <div className="border border-gray-300 rounded-md p-2 col-span-1">
              <p className="font-semibold">Grant Amount</p>
              <p>R ____________</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2 col-span-1">
              <p className="font-semibold">Spend to Date</p>
              <p>R ____________</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2 col-span-1">
              <p className="font-semibold">Remaining Budget</p>
              <p>R ____________</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2 col-span-1">
              <p className="font-semibold">Tons Processed (Grant-funded)</p>
              <p>________ tons</p>
            </div>
          </section>

          <section>
            <h2 className="font-semibold mb-1">Recycling Financial Summary by Cost Category</h2>
            <table className="w-full border-collapse text-xs mb-3">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-left">Cost Category</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Budget</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Actual</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Variance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">Material Purchases (Suppliers)</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">Processing &amp; Sorting Costs</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">Compliance Fees (EPR, landfill, etc.)</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">Logistics &amp; Transport</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">Admin &amp; Overheads</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="font-semibold mb-1">Recycling Impact Metrics</h2>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-left">Indicator</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">SDG</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Target</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Actual</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">Tons of waste diverted</td>
                  <td className="border border-gray-300 px-2 py-1">SDG 12 – Responsible Consumption</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">______</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">______</td>
                </tr>
              </tbody>
            </table>
          </section>
        </main>

        <footer className="mt-10 pt-4 border-t border-gray-300 flex justify-between text-[10px] text-gray-600">
          <div>
            <p>Prepared by: ____________________________</p>
            <p>Reviewed by: ____________________________</p>
          </div>
          <div className="text-right">
            <p>Sebenza Nathi Waste – Donor / Funder Report</p>
            <p>Page 1 of 1</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
