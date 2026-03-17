'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import SebenzaLogo from "../../../Sebenza Nathi Waste Logo.png"
import { downloadReportCsv, downloadReportElementPdf } from "@/lib/pdf-export"

export default function ImpactDashboardPage() {
  const today = new Date().toLocaleDateString()
  const fileDate = new Date().toISOString().split("T")[0]

  const handleExportPDF = async () => {
    await downloadReportElementPdf({
      elementId: "impact-report",
      filename: `sebenza-impact-dashboard-${fileDate}.pdf`,
    })
  }

  const handleExportExcel = () => {
    const headers = ["Stream", "Metric", "Value"]
    const rows = [
      ["Recycling", "Tons of Waste Diverted", ""],
      ["Recycling", "Tons of Material Sold", ""],
      ["Operations", "Number of Active Suppliers", ""],
      ["Operations", "Average Price per Ton", ""],
      ["Logistics", "Average Transport Cost per Ton", ""],
    ]
    downloadReportCsv(`impact_dashboard_${fileDate}.csv`, headers, rows)
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
        id="impact-report"
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
              <p className="font-semibold">Impact Dashboard</p>
              <p>Reporting Period: ____ / ____ / ______ to ____ / ____ / ______</p>
              <p>Printed on: {today}</p>
            </div>
          </div>
        </header>

        <main className="text-xs text-gray-800 space-y-6">
          <section className="grid grid-cols-4 gap-4 mb-2">
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Tons of Waste Diverted</p>
              <p>________ tons</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Tons of Material Sold</p>
              <p>________ tons</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Active Suppliers</p>
              <p>________ suppliers</p>
            </div>
            <div className="border border-gray-300 rounded-md p-2">
              <p className="font-semibold">Average Price per Ton</p>
              <p>R ________</p>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="font-semibold mb-1">Material Purchases by Programme / Route</h2>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1 text-left">Route / Programme</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Tons</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Community Buy-Back</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">______</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Enterprise &amp; Co-op Supply</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">______</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="font-semibold mb-1">Sebenza Shop &amp; Recycling Sales</h2>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1 text-left">Stream</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Tons / Units</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Sebenza Shop Sales</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">______</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">R ________</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">EcoHub Project Costs</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">______</td>
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
            <p>Sebenza Nathi Waste – Impact Dashboard</p>
            <p>Page 1 of 1</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
