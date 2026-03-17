'use client'

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseClient } from "@/app/lib/supabase"
import { getAccountId } from "@/lib/accounts-map"
import { createJournalEntry } from "@/lib/accounting"
import { buildRef, saveLocalRecord } from "@/lib/operations"

export default function NewPaymentPage() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [method, setMethod] = useState<"cash" | "card" | "eft" | "dignity">("cash")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const invoiceNumber = String(formData.get("invoice") || "")
    const amount = Number(formData.get("amount") || 0)
    const payDate = String(formData.get("date") || "")
    const selectedMethod = String(formData.get("method") || "cash") as "cash" | "card" | "eft" | "dignity"

    if (!invoiceNumber || !amount || !payDate) return

    setSubmitting(true)
    setFeedback(null)
    try {
      const supabase = getSupabaseClient()

      // Look up invoice
      const { data: invoice, error: invError } = await supabase
        .from("accounting_invoices")
        .select("*")
        .eq("invoice_number", invoiceNumber)
        .single()
      if (invError || !invoice) throw invError || new Error("Invoice not found")

      // For now, pick the first bank account as the receipt account
      const { data: bankAccounts, error: bankError } = await supabase
        .from("accounting_bank_accounts")
        .select("id, gl_account_id")
        .limit(1)
      if (bankError || !bankAccounts?.length) throw bankError || new Error("No bank account configured")

      const bank = bankAccounts[0]

      const { data: payment, error } = await supabase
        .from("accounting_payments")
        .insert({
          invoice_id: invoice.id,
          counterparty_type: "customer",
          customer_id: invoice.customer_id,
          bank_account_id: bank.id,
          payment_date: payDate,
          amount,
          method: selectedMethod,
          status: "completed",
        })
        .select("*")
        .single()
      if (error) throw error

      const bankGlId = bank.gl_account_id as string
      const arId = await getAccountId("1-200") // Accounts Receivable

      await createJournalEntry({
        entry_number: `RCPT-${invoiceNumber}`,
        entry_date: payDate,
        description: `Receipt for invoice ${invoiceNumber}`,
        source_module: "AR",
        source_id: payment.id,
        lines: [
          { account_id: bankGlId, debit: amount },
          { account_id: arId,      credit: amount },
        ],
      })

      form.reset()
      setMethod("cash")
      setFeedback({ type: "success", text: "Payment recorded and posted to the ledger." })
    } catch (err) {
      saveLocalRecord("accounting_local_ar_payments", {
        id: buildRef("ARPAY"),
        invoice_number: invoiceNumber,
        payment_date: payDate,
        amount,
        method: selectedMethod,
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
          <CardTitle>Record Payment</CardTitle>
          <CardDescription>
            Allocate a customer payment against an invoice. This should clear Accounts Receivable and increase cash/bank.
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
                <Label htmlFor="invoice">Invoice Number</Label>
                <Input id="invoice" name="invoice" placeholder="INV-2026-001" required />
              </div>
              <div>
                <Label htmlFor="amount">Amount (R)</Label>
                <Input id="amount" name="amount" type="number" min="0" step="0.01" required />
              </div>
              <div>
                <Label htmlFor="date">Payment Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div>
                <Label>Method</Label>
                <Select value={method} onValueChange={(value) => setMethod(value as "cash" | "card" | "eft" | "dignity")}>
                  <input type="hidden" name="method" value={method} />
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="eft">EFT</SelectItem>
                    <SelectItem value="dignity">Dignity Credits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

