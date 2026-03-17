'use client'

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseClient } from "@/app/lib/supabase"
import { buildRef, saveLocalRecord } from "@/lib/operations"

export default function ScheduleSupplierPaymentPage() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const supplier = String(formData.get("supplier") || "")
    const invoiceNo = String(formData.get("invoiceNo") || "")
    const amount = Number(formData.get("amount") || 0)
    const payDate = String(formData.get("payDate") || "")
    if (!supplier || !invoiceNo || !amount || !payDate) return

    setSubmitting(true)
    setFeedback(null)
    try {
      const supabase = getSupabaseClient()
      const { data: invoice } = await supabase
        .from("accounting_invoices")
        .select("id, supplier_id")
        .eq("invoice_number", invoiceNo)
        .limit(1)
        .maybeSingle()

      const { data: bankAccounts } = await supabase
        .from("accounting_bank_accounts")
        .select("id")
        .limit(1)

      const { error } = await supabase.from("accounting_payments").insert({
        invoice_id: invoice?.id ?? null,
        counterparty_type: "supplier",
        supplier_id: invoice?.supplier_id ?? null,
        bank_account_id: bankAccounts?.[0]?.id ?? null,
        payment_date: payDate,
        amount,
        method: "eft",
        status: "scheduled",
      })
      if (error) throw error

      form.reset()
      setFeedback({ type: "success", text: "Supplier payment scheduled successfully." })
    } catch (err) {
      saveLocalRecord("accounting_local_ap_payment_schedule", {
        id: buildRef("APSCH"),
        supplier_name: supplier,
        invoice_number: invoiceNo,
        payment_date: payDate,
        amount,
        status: "scheduled",
        created_at: new Date().toISOString(),
      })
      console.error(err)
      setFeedback({
        type: "error",
        text: "Scheduled locally because database setup is incomplete.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Supplier Payment</CardTitle>
          <CardDescription>
            Plan and approve a payment for a supplier invoice. This should respect approval workflows and cashflow.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier" name="supplier" placeholder="Supplier name or code" required />
              </div>
              <div>
                <Label htmlFor="invoiceNo">Invoice #</Label>
                <Input id="invoiceNo" name="invoiceNo" placeholder="SI-2026-001" required />
              </div>
              <div>
                <Label htmlFor="amount">Payment Amount (R)</Label>
                <Input id="amount" name="amount" type="number" min="0" step="0.01" required />
              </div>
              <div>
                <Label htmlFor="payDate">Planned Payment Date</Label>
                <Input id="payDate" name="payDate" type="date" required />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Scheduling..." : "Schedule Payment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

