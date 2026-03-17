'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Phone, MessageSquare, Video, Mail, Send, PhoneCall, Voicemail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function CommunicationPage() {
  const [activeTab, setActiveTab] = useState('calls')
  const [callLogs, setCallLogs] = useState<any[]>([])
  const [smsMessages, setSmsMessages] = useState<any[]>([])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication</h1>
          <p className="text-muted-foreground mt-1">
            Manage calls, SMS, and video communications
          </p>
        </div>
        <Button>
          <Phone className="h-4 w-4 mr-2" />
          Log Call
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="video">Video Calls</TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Logs</CardTitle>
              <CardDescription>Track and manage phone calls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contacts</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Make Call
                  </Button>
                </div>
                {callLogs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No call logs yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {callLogs.map((call) => (
                      <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{call.contactName}</p>
                          <p className="text-sm text-muted-foreground">{call.duration} min • {call.date}</p>
                        </div>
                        <Badge>{call.type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Messages</CardTitle>
              <CardDescription>Send and receive SMS messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Send SMS</Label>
                  <Input placeholder="Phone number" />
                  <Textarea placeholder="Message..." rows={4} />
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Send SMS
                  </Button>
                </div>
                {smsMessages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No SMS messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {smsMessages.map((sms) => (
                      <div key={sms.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{sms.to}</p>
                        <p className="text-sm">{sms.message}</p>
                        <p className="text-xs text-muted-foreground">{sms.date}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Integration</CardTitle>
              <CardDescription>Connect and manage WhatsApp Business</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">WhatsApp integration will be available here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Calls</CardTitle>
              <CardDescription>Schedule and manage video meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Video call management will be available here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
