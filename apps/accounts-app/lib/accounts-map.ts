import { getSupabaseClient } from "@/app/lib/supabase"

export type AccountCode =
  | "1-100" | "1-110" | "1-200" | "1-300" | "1-400"
  | "2-100" | "2-200" | "2-300" | "2-400" | "2-500"
  | "3-100" | "3-200"
  | "4-100" | "4-110" | "4-200" | "4-300" | "4-400"
  | "5-100" | "5-110" | "5-200" | "5-210" | "5-300" | "5-350" | "5-400" | "5-500" | "5-600"

let accountMap: Record<AccountCode, string> | null = null

export async function loadAccountMap() {
  if (accountMap) return accountMap
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("accounting_chart_accounts")
    .select("id, code")

  if (error) throw error

  const map: Partial<Record<AccountCode, string>> = {}
  for (const row of data ?? []) {
    if ((row.code as AccountCode) in map || true) {
      ;(map as any)[row.code as AccountCode] = row.id
    }
  }

  accountMap = map as Record<AccountCode, string>
  return accountMap
}

export async function getAccountId(code: AccountCode) {
  const map = await loadAccountMap()
  const id = map[code]
  if (!id) {
    throw new Error(`Account with code ${code} not found`)
  }
  return id
}

