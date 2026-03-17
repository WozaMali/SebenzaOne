'use client'

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseClient } from "@/app/lib/supabase"
import { buildRef, saveLocalRecord } from "@/lib/operations"

export default function BankReconciliationPage() {
  const [submitting, setSubmitting] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const account = String(formData.get("account") || "")
    const statementFile = formData.get("statement") as File | null
    if (!account || !statementFile) return

    setSubmitting(true)
    setFeedback(null)
    try {
      const statementText = await statementFile.text()
      const lineCount = statementText.split(/\r?\n/).filter(Boolean).length

      const supabase = getSupabaseClient()
      const { data: bank } = await supabase
        .from("accounting_bank_accounts")
        .select("id")
        .ilike("name", `%${account}%`)
        .limit(1)
        .maybeSingle()

      const record = {
        id: buildRef("RECON"),
        bank_account_name: account,
        bank_account_id: bank?.id ?? null,
        statement_file: statementFile.name,
        statement_rows: lineCount,
        reconciled_at: new Date().toISOString(),
        status: "uploaded",
      }

      // Keep reconciliation history available even if dedicated table is not ready yet.
      saveLocalRecord("accounting_bank_reconciliations", record)
      form.reset()
      setFileName(null)
      setFeedback({ type: "success", text: `Statement uploaded. Parsed ${lineCount} rows for reconciliation.` })
    } catch (err) {
      console.error(err)
      setFeedback({ type: "error", text: "Unable to parse or save statement. Please verify the file format." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Bank Reconciliation</CardTitle>
          <CardDescription>
            Upload a bank statement, match it to ledger transactions, and confirm any new entries to post.
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
            <div className="space-y-2">
              <Label htmlFor="account">Bank Account</Label>
              <Input id="account" name="account" placeholder="e.g. FNB Cheque 1234" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statement">Bank Statement File (CSV / OFX)</Label>
              <Input
                id="statement"
                name="statement"
                type="file"
                accept=".csv,.ofx,.qif"
                onChange={handleFileChange}
                required
              />
              {fileName && <p className="text-xs text-gray-600 mt-1">Selected: {fileName}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Reconciling..." : "Upload & Reconcile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

