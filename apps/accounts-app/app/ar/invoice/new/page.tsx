'use client'

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getSupabaseClient } from "@/app/lib/supabase"
import { getAccountId } from "@/lib/accounts-map"
import { createJournalEntry } from "@/lib/accounting"
import { buildRef, saveLocalRecord, todayIso } from "@/lib/operations"

export default function NewInvoicePage() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const customerName = String(formData.get("customer") || "")
    const invoiceNumber = String(formData.get("number") || "")
    const amount = Number(formData.get("amount") || 0)
    const dueDate = String(formData.get("dueDate") || "")
    const description = String(formData.get("description") || "")

    if (!customerName || !invoiceNumber || !amount || !dueDate) return

    setSubmitting(true)
    setFeedback(null)
    try {
      const supabase = getSupabaseClient()

      // For now we just store customer name on the invoice;
      // you can later link to accounting_customers.id
      const { data: invoice, error } = await supabase
        .from("accounting_invoices")
        .insert({
          invoice_number: invoiceNumber,
          type: "sales",
          issue_date: todayIso(),
          due_date: dueDate,
          amount,
          status: "sent",
          description,
          source: "Sebenza Shop",
        })
        .select("*")
        .single()

      if (error) throw error

      const arId = await getAccountId("1-200")   // Accounts Receivable
      const incomeId = await getAccountId("4-200") // Sales – Sebenza Shop

      await createJournalEntry({
        entry_number: `AR-${invoiceNumber}`,
        entry_date: todayIso(),
        description: `Invoice ${invoiceNumber} – ${customerName}`,
        source_module: "AR",
        source_id: invoice.id,
        lines: [
          { account_id: arId,     debit: amount },
          { account_id: incomeId, credit: amount },
        ],
      })

      form.reset()
      setFeedback({ type: "success", text: "Invoice saved and posted to the ledger." })
    } catch (err) {
      saveLocalRecord("accounting_local_ar_invoices", {
        id: buildRef("ARINV"),
        customer_name: customerName,
        invoice_number: invoiceNumber,
        amount,
        due_date: dueDate,
        description,
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
          <CardTitle>Create Invoice</CardTitle>
          <CardDescription>
            Capture a new Accounts Receivable invoice. On save this should auto‑post a double‑entry journal.
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
                <Label htmlFor="customer">Customer</Label>
                <Input id="customer" name="customer" placeholder="Customer name or code" required />
              </div>
              <div>
                <Label htmlFor="number">Invoice Number</Label>
                <Input id="number" name="number" placeholder="INV-2026-001" required />
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
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} placeholder="What is this invoice for?" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">
                Save Draft
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

