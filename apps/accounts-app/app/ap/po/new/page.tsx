'use client'

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getSupabaseClient } from "@/app/lib/supabase"
import { buildRef, saveLocalRecord } from "@/lib/operations"

export default function NewPurchaseOrderPage() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const supplier = String(formData.get("supplier") || "")
    const number = String(formData.get("number") || "")
    const amount = Number(formData.get("amount") || 0)
    const date = String(formData.get("date") || "")
    const notes = String(formData.get("notes") || "")
    if (!supplier || !number || !amount || !date) return

    setSubmitting(true)
    setFeedback(null)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("accounting_purchase_orders").insert({
        po_number: number,
        supplier_name: supplier,
        order_date: date,
        total_amount: amount,
        status: "draft",
        notes,
      })
      if (error) throw error
      form.reset()
      setFeedback({ type: "success", text: "Purchase order saved successfully." })
    } catch (err) {
      saveLocalRecord("accounting_local_ap_purchase_orders", {
        id: buildRef("PO"),
        po_number: number,
        supplier_name: supplier,
        order_date: date,
        total_amount: amount,
        notes,
        created_at: new Date().toISOString(),
      })
      console.error(err)
      setFeedback({
        type: "error",
        text: "Saved locally because database table/columns are not ready yet.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Purchase Order</CardTitle>
          <CardDescription>
            Issue a Purchase Order to a supplier. Later GRN and Supplier Invoice will reference this PO.
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
                <Label htmlFor="number">PO Number</Label>
                <Input id="number" name="number" placeholder="PO-2026-001" required />
              </div>
              <div>
                <Label htmlFor="amount">Estimated Amount (R)</Label>
                <Input id="amount" name="amount" type="number" min="0" step="0.01" required />
              </div>
              <div>
                <Label htmlFor="date">Order Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes / Items Summary</Label>
              <Textarea id="notes" name="notes" rows={3} placeholder="Brief description of materials or services" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save PO"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

