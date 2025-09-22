import { useState } from "react"
import { Mail, Search, Archive, Trash2, Star, Reply, Forward, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Email {
  id: string
  sender: string
  subject: string
  preview: string
  time: string
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
}

const sampleEmails: Email[] = [
  {
    id: "1",
    sender: "Sarah Johnson",
    subject: "Q4 Marketing Strategy Review",
    preview: "Hi team, I've attached the updated marketing strategy document for review...",
    time: "2m ago",
    isRead: false,
    isStarred: true,
    isImportant: true,
  },
  {
    id: "2",
    sender: "Mike Chen",
    subject: "Website Redesign Mockups",
    preview: "Please find the latest mockups attached. Looking forward to your feedback...",
    time: "1h ago",
    isRead: false,
    isStarred: false,
    isImportant: false,
  },
  {
    id: "3",
    sender: "Lisa Rodriguez",
    subject: "Team Meeting Notes",
    preview: "Thanks for the productive meeting today. Here are the key takeaways...",
    time: "3h ago",
    isRead: true,
    isStarred: false,
    isImportant: false,
  },
]

const folders = [
  { name: "Inbox", count: 12, active: true },
  { name: "Sent", count: 0, active: false },
  { name: "Drafts", count: 3, active: false },
  { name: "Starred", count: 5, active: false },
  { name: "Archive", count: 156, active: false },
  { name: "Spam", count: 2, active: false },
  { name: "Trash", count: 8, active: false },
]

export function MailPage() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(sampleEmails[0])
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="h-full flex gap-6">
      {/* Email Folders Sidebar */}
      <div className="w-64 enterprise-card p-4">
        <div className="mb-4">
          <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
            <Mail className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
        
        <div className="space-y-1">
          {folders.map((folder) => (
            <div
              key={folder.name}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                folder.active 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <span className="font-medium">{folder.name}</span>
              {folder.count > 0 && (
                <Badge 
                  variant={folder.active ? "secondary" : "outline"} 
                  className="text-xs"
                >
                  {folder.count}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Email List */}
      <div className="w-96 enterprise-card flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {sampleEmails.map((email) => (
            <div
              key={email.id}
              className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedEmail?.id === email.id ? 'bg-accent' : ''
              } ${!email.isRead ? 'bg-accent/20' : ''}`}
              onClick={() => setSelectedEmail(email)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${!email.isRead ? 'font-semibold' : ''}`}>
                    {email.sender}
                  </span>
                  {email.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  {email.isImportant && <Badge variant="destructive" className="text-xs">Important</Badge>}
                </div>
                <span className="text-sm text-muted-foreground">{email.time}</span>
              </div>
              <h4 className={`font-medium mb-1 ${!email.isRead ? 'font-semibold' : ''}`}>
                {email.subject}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {email.preview}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 enterprise-card flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline" size="sm">
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="dropdown-3d">
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Star
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>From: <strong>{selectedEmail.sender}</strong></span>
                <span>To: john@company.com</span>
                <span>{selectedEmail.time}</span>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose max-w-none">
                <p>Hi team,</p>
                <p>
                  I hope this email finds you well. I wanted to share some updates on our Q4 marketing 
                  strategy and get your feedback on the attached document.
                </p>
                <p>
                  The key highlights include:
                </p>
                <ul>
                  <li>Increased focus on digital marketing channels</li>
                  <li>New customer acquisition strategies</li>
                  <li>Brand awareness campaigns for Q1 2024</li>
                  <li>Budget allocation for different marketing verticals</li>
                </ul>
                <p>
                  Please review the document and let me know your thoughts by Friday. We'll discuss 
                  this further in our next team meeting.
                </p>
                <p>
                  Best regards,<br />
                  Sarah Johnson<br />
                  Marketing Director
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select an email to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}