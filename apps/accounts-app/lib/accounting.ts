import { getSupabaseClient } from "@/app/lib/supabase"

type JournalLineInput = {
  account_id: string
  description?: string
  debit?: number
  credit?: number
  project_code?: string
  entity_code?: string
}

export async function createJournalEntry(params: {
  entry_number: string
  entry_date: string
  description?: string
  source_module: string
  source_id?: string
  lines: JournalLineInput[]
}) {
  const supabase = getSupabaseClient()

  const totalDebit = params.lines.reduce((s, l) => s + (l.debit ?? 0), 0)
  const totalCredit = params.lines.reduce((s, l) => s + (l.credit ?? 0), 0)
  if (Number(totalDebit.toFixed(2)) !== Number(totalCredit.toFixed(2))) {
    throw new Error("Journal not balanced (debits != credits)")
  }

  const { data: entry, error: entryError } = await supabase
    .from("accounting_journal_entries")
    .insert({
      entry_number: params.entry_number,
      entry_date: params.entry_date,
      description: params.description,
      source_module: params.source_module,
      source_id: params.source_id,
      status: "posted",
    })
    .select("*")
    .single()

  if (entryError) throw entryError

  const linesToInsert = params.lines.map(l => ({
    journal_id: entry.id,
    account_id: l.account_id,
    description: l.description,
    debit: l.debit ?? 0,
    credit: l.credit ?? 0,
    project_code: l.project_code,
    entity_code: l.entity_code,
  }))

  const { error: linesError } = await supabase
    .from("accounting_journal_lines")
    .insert(linesToInsert)

  if (linesError) throw linesError

  return entry
}

