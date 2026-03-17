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

export default function IssueCreditsPage() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const youth = String(formData.get("youth") || "")
    const amount = Number(formData.get("amount") || 0)
    const reason = String(formData.get("reason") || "")
    if (!youth || !amount) return

    setSubmitting(true)
    setFeedback(null)
    try {
      const supabase = getSupabaseClient()
      const creditNumber = buildRef("DC")

      const { data: issue, error } = await supabase
        .from("accounting_dignity_credits")
        .insert({
          credit_number: creditNumber,
          beneficiary_ref: youth,
          amount,
          issued_date: todayIso(),
          status: "issued",
          notes: reason || null,
        })
        .select("*")
        .single()
      if (error) throw error

      const creditsExpense = await getAccountId("5-350")
      const creditsLiability = await getAccountId("2-500")

      await createJournalEntry({
        entry_number: `DCI-${creditNumber}`,
        entry_date: todayIso(),
        description: `Dignity credits issued to ${youth}`,
        source_module: "CREDITS",
        source_id: issue.id,
        lines: [
          { account_id: creditsExpense, debit: amount },
          { account_id: creditsLiability, credit: amount },
        ],
      })

      form.reset()
      setFeedback({ type: "success", text: "Dignity credits issued and posted to ledger." })
    } catch (err) {
      saveLocalRecord("accounting_local_credits_issue", {
        id: buildRef("LDCI"),
        beneficiary_ref: youth,
        amount,
        reason,
        issued_date: todayIso(),
        created_at: new Date().toISOString(),
      })
      console.error(err)
      setFeedback({
        type: "error",
        text: "Saved locally because credit tables/journals are not fully configured.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Issue Dignity Credits</CardTitle>
          <CardDescription>
            Allocate new Dignity Credits to a youth account, updating the liability balance in the ledger.
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
                <Label htmlFor="amount">Credits Amount</Label>
                <Input id="amount" name="amount" type="number" min="0" step="1" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason / Grant</Label>
              <Input id="reason" name="reason" placeholder="Grant / programme name (optional)" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Issuing..." : "Issue Credits"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

