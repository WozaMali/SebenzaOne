export interface Document {
  id: string
  title: string
  category: string
  version: string
  status: "approved" | "under_review" | "draft" | "expired"
  owner: string
  lastUpdated: string
  nextReview: string
  content: string
}

const STORAGE_KEY = 'sebenza_documents';

function getStoredDocuments(): Document[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveToStorage(docs: Document[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
  }
}

export const initializeDocuments = (_defaultDocs: Document[] = []) => {}

export const getDocuments = (): Document[] => getStoredDocuments()

export const getDocumentById = (id: string): Document | undefined =>
  getStoredDocuments().find(doc => doc.id === id)

export async function fetchDocuments(): Promise<Document[]> {
  try {
    const { getSupabaseClient } = await import('@/app/lib/supabase')
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('accounting_documents')
      .select('*')
      .order('last_updated', { ascending: false })
    if (error) throw error
    if (data && data.length > 0) {
      const docs = data.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category ?? 'SOP',
        version: r.version ?? '1.0',
        status: r.status ?? 'draft',
        owner: r.owner ?? '',
        lastUpdated: r.last_updated ? new Date(r.last_updated).toISOString().split('T')[0] : '',
        nextReview: r.next_review ? new Date(r.next_review).toISOString().split('T')[0] : '',
        content: r.content ?? '',
      }))
      saveToStorage(docs)
      return docs
    }
  } catch {}
  return getStoredDocuments()
}

export async function createDocument(newDoc: Omit<Document, 'id' | 'lastUpdated' | 'nextReview' | 'status'> & { status?: Document['status'] }): Promise<Document> {
  const lastUpdated = new Date().toISOString().split('T')[0]
  const nextReview = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  const document: Document = {
    ...newDoc,
    id: '',
    status: newDoc.status || "draft",
    lastUpdated,
    nextReview,
  }
  try {
    const { getSupabaseClient } = await import('@/app/lib/supabase')
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('accounting_documents')
      .insert({
        title: newDoc.title,
        category: newDoc.category ?? 'SOP',
        version: newDoc.version ?? '1.0',
        owner: newDoc.owner ?? null,
        status: document.status,
        content: newDoc.content ?? null,
        last_updated: lastUpdated,
        next_review: nextReview,
      })
      .select('id')
      .single()
    if (!error && data) {
      document.id = data.id
      const docs = getStoredDocuments().concat(document)
      saveToStorage(docs)
      return document
    }
  } catch {}
  document.id = Math.random().toString(36).substr(2, 9)
  const docs = getStoredDocuments().concat(document)
  saveToStorage(docs)
  return document
}

export const createDocumentSync = (newDoc: Omit<Document, 'id' | 'lastUpdated' | 'nextReview' | 'status'> & { status?: Document['status'] }): Document => {
  const document: Document = {
    ...newDoc,
    id: Math.random().toString(36).substr(2, 9),
    status: newDoc.status || "draft",
    lastUpdated: new Date().toISOString().split('T')[0],
    nextReview: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  }
  const docs = getStoredDocuments().concat(document)
  saveToStorage(docs)
  return document
}

export async function updateDocument(updatedDoc: Document): Promise<Document> {
  const doc = { ...updatedDoc, lastUpdated: new Date().toISOString().split('T')[0] }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updatedDoc.id)
  try {
    if (isUuid) {
      const { getSupabaseClient } = await import('@/app/lib/supabase')
      const supabase = getSupabaseClient()
      await supabase.from('accounting_documents').update({
        title: doc.title,
        category: doc.category,
        version: doc.version,
        owner: doc.owner || null,
        status: doc.status,
        content: doc.content || null,
        last_updated: doc.lastUpdated,
        next_review: doc.nextReview || null,
        updated_at: new Date().toISOString(),
      }).eq('id', doc.id)
    }
  } catch {}
  const docs = getStoredDocuments().map(d => d.id === doc.id ? doc : d)
  saveToStorage(docs)
  return doc
}

export async function deleteDocument(id: string): Promise<void> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  try {
    if (isUuid) {
      const { getSupabaseClient } = await import('@/app/lib/supabase')
      const supabase = getSupabaseClient()
      await supabase.from('accounting_documents').delete().eq('id', id)
    }
  } catch {}
  const docs = getStoredDocuments().filter(d => d.id !== id)
  saveToStorage(docs)
}
