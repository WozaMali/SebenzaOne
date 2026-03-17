'use client'

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getSupabaseClient } from "@/app/lib/supabase"
import { createJournalEntry } from "@/lib/accounting"
import { getAccountId } from "@/lib/accounts-map"
import { buildRef, saveLocalRecord, todayIso } from "@/lib/operations"

export default function NewSupplierInvoicePage() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const supplier = String(formData.get("supplier") || "")
    const invoiceNo = String(formData.get("invoiceNo") || "")
    const poNo = String(formData.get("poNo") || "")
    const amount = Number(formData.get("amount") || 0)
    const dueDate = String(formData.get("dueDate") || "")
    const details = String(formData.get("details") || "")
    if (!supplier || !invoiceNo || !amount || !dueDate) return

    setSubmitting(true)
    setFeedback(null)
    try {
      const supabase = getSupabaseClient()
      const { data: invoice, error } = await supabase
        .from("accounting_invoices")
        .insert({
          invoice_number: invoiceNo,
          type: "purchase",
          issue_date: todayIso(),
          due_date: dueDate,
          amount,
          status: "received",
          description: [details, poNo ? `PO ${poNo}` : ""].filter(Boolean).join(" | "),
          source: supplier,
        })
        .select("*")
        .single()

      if (error) throw error

      const expenseId = await getAccountId("5-100") // COGS - Materials Purchased
      const apId = await getAccountId("2-100") // Accounts Payable

      await createJournalEntry({
        entry_number: `AP-${invoiceNo}`,
        entry_date: todayIso(),
        description: `Supplier invoice ${invoiceNo} - ${supplier}`,
        source_module: "AP",
        source_id: invoice.id,
        lines: [
          { account_id: expenseId, debit: amount },
          { account_id: apId, credit: amount },
        ],
      })

      form.reset()
      setFeedback({ type: "success", text: "Supplier invoice saved and posted to Accounts Payable." })
    } catch (err) {
      saveLocalRecord("accounting_local_ap_invoices", {
        id: buildRef("APINV"),
        supplier_name: supplier,
        invoice_number: invoiceNo,
        po_number: poNo || null,
        amount,
        due_date: dueDate,
        details,
        created_at: new Date().toISOString(),
      })
      console.error(err)
      setFeedback({
        type: "error",
        text: "Saved locally because database posting failed. Check Supabase/table setup.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Record Supplier Invoice</CardTitle>
          <CardDescription>
            Capture the supplier invoice, linked to a PO / GRN, and post to Accounts Payable.
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
                <Label htmlFor="invoiceNo">Supplier Invoice #</Label>
                <Input id="invoiceNo" name="invoiceNo" placeholder="SI-2026-001" required />
              </div>
              <div>
                <Label htmlFor="poNo">Related PO #</Label>
                <Input id="poNo" name="poNo" placeholder="PO-2026-001" />
              </div>
              <div>
                <Label htmlFor="amount">Amount (R)</Label>
                <Input id="amount" name="amount" type="number" min="0" step="0.01" required />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" required />
              </div>
            </div>
            <div>
              <Label htmlFor="details">Description / Details</Label>
              <Textarea id="details" name="details" rows={3} placeholder="Details of goods/services received" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save & Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

