'use client'

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { getDocuments, fetchDocuments, createDocument } from "@/lib/document-api"
import type { Document } from "@/lib/document-api"

export default function DocumentsPage() {
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [documents, setDocuments] = useState<Document[]>([])
  useEffect(() => {
    setDocuments(getDocuments())
    fetchDocuments().then(setDocuments)
  }, [])
  const [newDoc, setNewDoc] = useState({
    title: "",
    category: "SOP",
    version: "1.0",
    owner: "",
    content: "",
  })
  const [feedback, setFeedback] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return documents.filter((d) => {
      const matchesSearch = !q || d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
      const matchesCategory = categoryFilter === "all" || d.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [documents, query, categoryFilter])

  const handleCreate = async () => {
    if (!newDoc.title.trim() || !newDoc.content.trim()) {
      setFeedback("Please complete at least title and content.")
      return
    }
    const record = await createDocument({
      title: newDoc.title.trim(),
      category: newDoc.category.trim(),
      version: newDoc.version.trim() || "1.0",
      owner: newDoc.owner.trim() || "Unassigned",
      content: newDoc.content.trim(),
    })
    setDocuments((prev) => [...prev.filter((d) => d.id !== record.id), record])
    setNewDoc({ title: "", category: "SOP", version: "1.0", owner: "", content: "" })
    setFeedback("Document created successfully.")
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Control</CardTitle>
          <CardDescription>Manage SOPs, policies, compliance records, and processed documents (OCR, attachments) for recycling operations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-4 flex-wrap">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or category..."
              className="flex-1 min-w-[200px]"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              <option value="Processed">Processed</option>
              <option value="SOP">SOP</option>
              <option value="Policy">Policy</option>
              <option value="Compliance">Compliance</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {feedback && <p className="text-sm text-gray-600">{feedback}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newDoc.title}
                onChange={(e) => setNewDoc((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={newDoc.category}
                onChange={(e) => setNewDoc((prev) => ({ ...prev, category: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="SOP">SOP</option>
                <option value="Policy">Policy</option>
                <option value="Processed">Processed</option>
                <option value="Compliance">Compliance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={newDoc.version}
                onChange={(e) => setNewDoc((prev) => ({ ...prev, version: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                value={newDoc.owner}
                onChange={(e) => setNewDoc((prev) => ({ ...prev, owner: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              rows={5}
              value={newDoc.content}
              onChange={(e) => setNewDoc((prev) => ({ ...prev, content: e.target.value }))}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCreate}>Create Document</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((doc) => (
            <div key={doc.id} className="border rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-xs text-gray-600">
                    {doc.category} · v{doc.version} · {doc.owner}
                  </p>
                </div>
                <Badge variant="outline">{doc.status}</Badge>
              </div>
              <p className="text-sm text-gray-700">{doc.content}</p>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-gray-500">No documents found.</p>}
        </CardContent>
      </Card>
    </div>
  )
}