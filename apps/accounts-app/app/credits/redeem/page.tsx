'use client'

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseClient } from "@/app/lib/supabase"
import { createJournalEntry } from "@/lib/accounting"
import { getAccountId } from "@/lib/accounts-map"
import { buildRef, saveLocalRecord, todayIso } from "@/lib/operations"

export default function RedeemCreditsPage() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const youth = String(formData.get("youth") || "")
    const amount = Number(formData.get("amount") || 0)
    const date = String(formData.get("date") || todayIso())
    const location = String(formData.get("location") || "")
    if (!youth || !amount || !date) return

    setSubmitting(true)
    setFeedback(null)
    try {
      const supabase = getSupabaseClient()
      const redemptionRef = buildRef("DCR")
      const { data: redemption, error } = await supabase
        .from("accounting_dignity_credit_movements")
        .insert({
          movement_ref: redemptionRef,
          beneficiary_ref: youth,
          movement_type: "redeem",
          amount,
          movement_date: date,
          location: location || null,
        })
        .select("*")
        .single()
      if (error) throw error

      const creditsLiability = await getAccountId("2-500")
      const salesShop = await getAccountId("4-200")

      await createJournalEntry({
        entry_number: `DCR-${redemptionRef}`,
        entry_date: date,
        description: `Dignity credits redeemed by ${youth}`,
        source_module: "CREDITS",
        source_id: redemption.id,
        lines: [
          { account_id: creditsLiability, debit: amount },
          { account_id: salesShop, credit: amount },
        ],
      })

      form.reset()
      setFeedback({ type: "success", text: "Redemption saved and posted to ledger." })
    } catch (err) {
      saveLocalRecord("accounting_local_credits_redeem", {
        id: buildRef("LDCR"),
        beneficiary_ref: youth,
        amount,
        movement_date: date,
        location,
        created_at: new Date().toISOString(),
      })
      console.error(err)
      setFeedback({
        type: "error",
        text: "Saved locally because redemption tables/journals are not fully configured.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Redeem Dignity Credits</CardTitle>
          <CardDescription>
            Capture a redemption of Dignity Credits at Sebenza Shop or partner, posting expense and liability reduction.
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
                <Label htmlFor="youth">Youth / Beneficiary ID</Label>
                <Input id="youth" name="youth" placeholder="e.g. YM-12345" required />
              </div>
              <div>
                <Label htmlFor="amount">Redeemed Amount</Label>
                <Input id="amount" name="amount" type="number" min="0" step="1" required />
              </div>
              <div>
                <Label htmlFor="date">Redemption Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location / Shop</Label>
              <Input id="location" name="location" placeholder="Sebenza Shop / partner outlet" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Redemption"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

