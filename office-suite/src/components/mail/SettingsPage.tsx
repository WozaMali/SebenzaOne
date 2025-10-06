"use client"

import React, { useMemo, useState, useEffect } from "react"
import { 
	Settings as SettingsIcon,
	X,
	BarChart3,
	Globe,
	Users as UsersIcon,
	Mail as MailIcon,
	FileText,
	Check,
	AlertCircle,
	Plus,
	Trash2,
	Edit,
	RefreshCw,
	Download,
	Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
	import { useToast } from "@/hooks/use-toast"
	import { emailService } from "@/lib/email-service"
	import { zipProcessor } from "@/lib/zip-processor"
	import { SignatureTemplate, UserSignature } from "@/lib/signature-service"

	// Dynamic signature service hook
	const useSignatureService = () => {
		const [service, setService] = useState<any>(null)
		
		useEffect(() => {
			if (typeof window !== 'undefined') {
				import('@/lib/signature-service').then(({ signatureService }) => {
					setService(signatureService.instance)
				})
			}
		}, [])
		
		return service
	}

// Optional helpers (only used if provided by the app)
// These imports are safe: if files exist they'll be bundled; otherwise you can remove them later.
// @ts-ignore
import { initSupabase, saveMailConfig } from "@/lib/supabase-mail"
// @ts-ignore
import { getDomains as supabaseGetDomains, addDomain as supabaseAddDomain, updateDomain as supabaseUpdateDomain, deleteDomain as supabaseDeleteDomain, updateDomainVerification as supabaseUpdateDomainVerification } from "@/lib/supabase-mail"
// @ts-ignore
import { testSESConnection } from "@/lib/aws-ses"

interface SettingsPageProps {
	onClose: () => void
}

type Domain = {
	id: string
	name: string
	status: "pending" | "verified"
	users: number
	// DNS config
	mxTarget?: string
	spfValue?: string
	dkimSelectors?: string[]
	dmarcValue?: string
	// Verification results
	verification?: {
		mx?: boolean
		spf?: boolean
		dkim?: boolean[]
		dmarc?: boolean
		lastChecked?: string
	}
}

type AppUser = {
	id: string
	name: string
	email: string
	role: "Admin" | "Moderator" | "User"
	status: "Active" | "Inactive"
}

export function SettingsPage({ onClose }: SettingsPageProps) {
	// Get services dynamically
	const signatureService = useSignatureService()
	
	const [activeTab, setActiveTab] = useState("dashboard")
	const [mailSettings, setMailSettings] = useState({
		// General SMTP
		smtpHost: "email-smtp.us-east-1.amazonaws.com",
		smtpPort: "587",
		fromEmail: "",
		fromName: "",
		// Security & limits
		sslEnabled: true,
		spamProtection: true,
		virusScanning: true,
		twoFactorEnabled: false,
		maxAttachmentSize: 25,
		maxRecipients: 100,
		retentionDays: 365,
		// AWS SES
		awsRegion: "us-east-1",
		awsAccessKeyId: "",
		awsSecretAccessKey: "",
		// Supabase (optional persistence)
		supabaseUrl: "",
		supabaseAnonKey: "",
	})

	const [domains, setDomains] = useState<Domain[]>([
		{ id: "1", name: "yourdomain.com", status: "verified", users: 5, mxTarget: `mail.yourdomain.com`, spfValue: `v=spf1 include:amazonses.com -all`, dkimSelectors: ["ses1","ses2","ses3"], dmarcValue: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc@yourdomain.com; fo=1` },
		{ id: "2", name: "sub.yourdomain.com", status: "pending", users: 2, mxTarget: `mail.sub.yourdomain.com`, spfValue: `v=spf1 include:amazonses.com -all`, dkimSelectors: ["ses1","ses2","ses3"], dmarcValue: `v=DMARC1; p=none; rua=mailto:dmarc@sub.yourdomain.com; ruf=mailto:dmarc@sub.yourdomain.com; fo=1` },
	])
	const [newDomain, setNewDomain] = useState({ name: "" })
	const [showAddDomain, setShowAddDomain] = useState(false)

	const [users, setUsers] = useState<AppUser[]>([
		{ id: "u1", name: "Admin User", email: "admin@yourdomain.com", role: "Admin", status: "Active" },
		{ id: "u2", name: "John Doe", email: "john@yourdomain.com", role: "User", status: "Active" },
	])
	const [newUser, setNewUser] = useState({ name: "", email: "", role: "User" as AppUser["role"] })
	const [showAddUser, setShowAddUser] = useState(false)

	const [reports, setReports] = useState<Array<{ id: string; name: string; date: string; type: string; size: string }>>([
		{ id: "r1", name: "Monthly Email Report", date: "2024-01-15", type: "PDF", size: "2.3 MB" },
		{ id: "r2", name: "User Activity Summary", date: "2024-01-14", type: "CSV", size: "1.1 MB" },
	])

	const systemStatus = useMemo(() => ({
		mailServer: { status: "online" as const },
		database: { status: "online" as const },
		storage: { status: "warning" as const },
	}), [])

	const handleUpdate = (key: keyof typeof mailSettings, value: any) => {
		setMailSettings(prev => ({ ...prev, [key]: value }))
	}

	const handleTestConnection = async () => {
		try {
			if (!mailSettings.awsAccessKeyId || !mailSettings.awsSecretAccessKey || !mailSettings.fromEmail) {
				toast({
					title: "Missing Configuration",
					description: "Please fill in AWS credentials and From Email first.",
					variant: "destructive"
				})
				return
			}
			
			// Test AWS SES connection
			const result = await testSESConnection?.({
				region: mailSettings.awsRegion,
				accessKeyId: mailSettings.awsAccessKeyId,
				secretAccessKey: mailSettings.awsSecretAccessKey,
				fromEmail: mailSettings.fromEmail,
				fromName: mailSettings.fromName || "",
			})
			
			if (result?.success) {
				toast({
					title: "Connection Successful",
					description: "AWS SES connection verified successfully!"
				})
			} else {
				toast({
					title: "Connection Failed",
					description: result?.error || "Unable to connect to AWS SES",
					variant: "destructive"
				})
			}
		} catch (e) {
			toast({
				title: "Connection Test Failed",
				description: "An unexpected error occurred while testing the connection",
				variant: "destructive"
			})
		}
	}

	const handleSaveSettings = async () => {
		try {
			if (mailSettings.supabaseUrl && mailSettings.supabaseAnonKey) {
				initSupabase?.(mailSettings.supabaseUrl, mailSettings.supabaseAnonKey)
				const ok = await saveMailConfig?.({
					smtp_host: mailSettings.smtpHost,
					smtp_port: parseInt(mailSettings.smtpPort) || 587,
					aws_region: mailSettings.awsRegion,
					aws_access_key_id: mailSettings.awsAccessKeyId,
					aws_secret_access_key: mailSettings.awsSecretAccessKey,
					from_email: mailSettings.fromEmail,
					from_name: mailSettings.fromName,
					ssl_enabled: mailSettings.sslEnabled,
					two_factor_enabled: mailSettings.twoFactorEnabled,
					spam_protection: mailSettings.spamProtection,
					virus_scanning: mailSettings.virusScanning,
					max_attachment_size: mailSettings.maxAttachmentSize,
					max_recipients: mailSettings.maxRecipients,
					retention_days: mailSettings.retentionDays,
					supabase_url: mailSettings.supabaseUrl,
					supabase_anon_key: mailSettings.supabaseAnonKey,
				})
				if (ok) {
					toast({
						title: "Settings Saved",
						description: "Mail configuration saved to Supabase successfully!"
					})
					return
				}
			}
			toast({
				title: "Settings Saved Locally",
				description: "Settings saved locally. Configure Supabase to persist data.",
				variant: "default"
			})
		} catch (e) {
			toast({
				title: "Save Failed",
				description: "Failed to save settings. Please try again.",
				variant: "destructive"
			})
		}
	}

	// Migration state
	const { toast } = useToast()
	const [migrationForm, setMigrationForm] = useState({
		provider: "zoho",
		hostname: "imap.zoho.com",
		port: 993,
		useSSL: true,
		username: "",
		password: "",
		folders: "INBOX,Sent",
		dateFrom: "",
		dateTo: "",
		maxMessages: 50,
		allowInsecureTLS: false
	})
	const [migrationRunning, setMigrationRunning] = useState(false)
	const [migrationResult, setMigrationResult] = useState<null | { processed: number; imported: number; failed: number; details?: string }>(null)
	const [zipUploading, setZipUploading] = useState(false)
	const [zipResult, setZipResult] = useState<null | { processed: number; imported: number; failed: number }>(null)
	
	// Backup and Settings Migration
	const [backupUploading, setBackupUploading] = useState(false)
	const [backupResult, setBackupResult] = useState<null | { success: boolean; message: string; importedData?: any }>(null)
	const [showBackupModal, setShowBackupModal] = useState(false)
	const [backupType, setBackupType] = useState<'settings' | 'emails' | 'users' | 'domains'>('settings')
	const [selectedFolder, setSelectedFolder] = useState<string>('inbox')

	// Signature states
	const [signatures, setSignatures] = useState<SignatureTemplate[]>([])
	const [userSignatures, setUserSignatures] = useState<UserSignature[]>([])
	const [showSignatureModal, setShowSignatureModal] = useState(false)
	const [signatureName, setSignatureName] = useState('')
	const [signatureContent, setSignatureContent] = useState('')
	const [editingSignature, setEditingSignature] = useState<SignatureTemplate | null>(null)

	// Load signatures on mount
	useEffect(() => {
		if (signatureService) {
			setSignatures(signatureService.getSignatureTemplates())
		}
	}, [signatureService])
	
	// Encrypted ZIP support
	const [zipPassword, setZipPassword] = useState('')
	const [showPasswordModal, setShowPasswordModal] = useState(false)
	const [pendingZipFile, setPendingZipFile] = useState<File | null>(null)

	const startMigration = async () => {
		try {
			setMigrationRunning(true)
			setMigrationResult(null)
			const body = {
				provider: migrationForm.provider,
				hostname: migrationForm.hostname,
				port: Number(migrationForm.port) || 993,
				useSSL: migrationForm.useSSL,
				username: migrationForm.username,
				password: migrationForm.password,
				folders: migrationForm.folders.split(",").map(s=>s.trim()).filter(Boolean),
				dateFrom: migrationForm.dateFrom || undefined,
				dateTo: migrationForm.dateTo || undefined,
				maxMessages: migrationForm.maxMessages,
				allowInsecureTLS: migrationForm.allowInsecureTLS,
				action: 'migrate'
			}
			const res = await fetch("/api/mail/migrate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
			if (!res.ok) {
				let errText = `HTTP ${res.status}`
				try { const j = await res.json(); if (j?.error) errText = j.error } catch {}
				throw new Error(errText)
			}
			const data = await res.json()
			setMigrationResult(data)
			toast({ title: "Migration complete", description: `${data.imported} imported, ${data.failed} failed` })
		} catch (e:any) {
			toast({ title: "Migration failed", description: e?.message || "Unexpected error", variant: "destructive" })
		} finally {
			setMigrationRunning(false)
		}
	}

	const testConnection = async () => {
		try {
			const body = {
				provider: migrationForm.provider,
				hostname: migrationForm.hostname,
				port: Number(migrationForm.port) || 993,
				useSSL: migrationForm.useSSL,
				username: migrationForm.username,
				password: migrationForm.password,
				allowInsecureTLS: migrationForm.allowInsecureTLS,
				action: 'test'
			}
			const res = await fetch("/api/mail/migrate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
			if (!res.ok) {
				let errText = `HTTP ${res.status}`
				try { const j = await res.json(); if (j?.error) errText = j.error } catch {}
				throw new Error(errText)
			}
			const data = await res.json()
			toast({ title: "IMAP connected", description: `${(data?.mailboxes||[]).length} folders found` })
		} catch (e:any) {
			toast({ title: "Connection failed", description: e?.message || "Unexpected error", variant: "destructive" })
		}
	}

	const supabaseEnabled = !!(mailSettings.supabaseUrl && mailSettings.supabaseAnonKey)
	const ensureSupabase = () => {
		if (supabaseEnabled) {
			initSupabase?.(mailSettings.supabaseUrl, mailSettings.supabaseAnonKey)
		}
	}

	const addDomain = async () => {
		if (!newDomain.name.trim()) return
		const dn = newDomain.name.trim()
		const toAdd: Domain = { 
			id: Date.now().toString(), 
			name: dn, 
			status: "pending", 
			users: 0,
			mxTarget: `mail.${dn}`,
			spfValue: `v=spf1 include:amazonses.com -all`,
			dkimSelectors: ["ses1","ses2","ses3"],
			dmarcValue: `v=DMARC1; p=none; rua=mailto:dmarc@${dn}; ruf=mailto:dmarc@${dn}; fo=1`
		}
		setDomains(prev => prev.concat(toAdd))
		setNewDomain({ name: "" })
		setShowAddDomain(false)
		if (supabaseEnabled) {
			try {
				ensureSupabase()
				await supabaseAddDomain?.({
					name: dn,
					status: 'pending',
					records: 0,
					total_records: 3,
					users: 0,
					is_active: false,
					mx_record: toAdd.mxTarget || '',
					txt_record: toAdd.spfValue || '',
				})
			} catch {}
		}
	}
	const verifyDomain = async (id: string) => {
		setDomains(prev => prev.map(d => d.id === id ? { ...d, status: "verified" } : d))
		if (supabaseEnabled) {
			try { ensureSupabase(); const d = domains.find(x=>x.id===id); if (d) await supabaseUpdateDomain?.(id, { status: 'verified' }) } catch {}
		}
	}
	const deleteDomain = async (id: string) => {
		setDomains(prev => prev.filter(d => d.id !== id))
		if (supabaseEnabled) {
			try { ensureSupabase(); await supabaseDeleteDomain?.(id) } catch {}
		}
	}

	const verifyDns = async (domainId: string) => {
		const d = domains.find(x => x.id === domainId)
		if (!d) return
		
		const name = d.name
		const results: Domain["verification"] = { 
			mx: false, 
			spf: false, 
			dkim: [], 
			dmarc: false, 
			lastChecked: new Date().toLocaleString() 
		}
		
		try {
			toast({
				title: "Verifying DNS Records",
				description: `Checking DNS records for ${name}...`
			})
			
			// MX Record Verification
			try {
				const mxRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=MX`)
				const mxData = await mxRes.json()
				const mxRecords: string[] = mxData?.Answer?.map((a: any) => a.data) || []
				results.mx = d.mxTarget ? 
					mxRecords.some((mx) => mx.toLowerCase().includes(d.mxTarget!.toLowerCase())) : 
					mxRecords.length > 0
			} catch (e) {
				console.error('MX verification failed:', e)
			}
			
			// SPF Record Verification
			try {
				const txtRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=TXT`)
				const txtData = await txtRes.json()
				const txtRecords: string[] = (txtData?.Answer || []).flatMap((a: any) => [a.data.replace(/^"|"$/g, "")])
				results.spf = d.spfValue ? 
					txtRecords.some(t => t.includes("v=spf1") && t.includes("amazonses.com")) : 
					txtRecords.some(t => t.includes("v=spf1"))
			} catch (e) {
				console.error('SPF verification failed:', e)
			}
			
			// DKIM Record Verification
			const dkims: boolean[] = []
			for (const sel of (d.dkimSelectors || [])) {
				try {
				const host = `${sel}._domainkey.${name}`
					const cnameRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(host)}&type=CNAME`)
					const cnameData = await cnameRes.json()
					const cnameRecords: string[] = cnameData?.Answer?.map((a: any) => a.data.replace(/\.$/, "")) || []
					dkims.push(cnameRecords.some(c => c.includes("dkim.amazonses.com")))
				} catch (e) {
					console.error(`DKIM verification failed for ${sel}:`, e)
					dkims.push(false)
				}
			}
			results.dkim = dkims
			
			// DMARC Record Verification
			try {
			const dmarcHost = `_dmarc.${name}`
				const dmarcRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(dmarcHost)}&type=TXT`)
				const dmarcData = await dmarcRes.json()
				const dmarcRecords: string[] = (dmarcData?.Answer || []).flatMap((a: any) => [a.data.replace(/^"|"$/g, "")])
				results.dmarc = dmarcRecords.some(t => t.toUpperCase().includes("V=DMARC1"))
			} catch (e) {
				console.error('DMARC verification failed:', e)
			}
			
			// Update domain with verification results
		setDomains(prev => prev.map(x => x.id === domainId ? { ...x, verification: results } : x))
			
			// Save to Supabase if enabled
		if (supabaseEnabled) {
				try { 
					ensureSupabase()
					await supabaseUpdateDomainVerification?.(domainId, results || {} as any) 
				} catch (e) {
					console.error('Failed to save verification results:', e)
				}
			}
			
			// Show verification results
			const allVerified = results.mx && results.spf && results.dkim.every(d => d) && results.dmarc
			toast({
				title: allVerified ? "DNS Verification Complete" : "DNS Verification Partial",
				description: allVerified ? 
					`All DNS records verified for ${name}` : 
					`Some DNS records need attention for ${name}`,
				variant: allVerified ? "default" : "destructive"
			})
			
		} catch (e) {
			console.error('DNS verification failed:', e)
			toast({
				title: "Verification Failed",
				description: "Failed to verify DNS records. Please check your internet connection.",
				variant: "destructive"
			})
		}
	}

	const saveDomain = async (domain: Domain) => {
		if (!supabaseEnabled) { alert('Set Supabase URL/Key in Mail Settings first'); return }
		try {
			ensureSupabase()
			await supabaseUpdateDomain?.(domain.id, {
				name: domain.name,
				status: domain.status as any,
				users: domain.users,
				mx_record: domain.mxTarget || '',
				txt_record: domain.spfValue || '',
				dkim_selectors: domain.dkimSelectors || [],
				dmarc_value: domain.dmarcValue || '',
				verification: domain.verification || null,
			})
			alert('Domain saved')
		} catch {
			alert('Failed to save domain')
		}
	}

	const addUser = async () => {
		if (!newUser.name.trim() || !newUser.email.trim()) {
			toast({
				title: "Missing Information",
				description: "Please fill in both name and email fields.",
				variant: "destructive"
			})
			return
		}
		
		const userToAdd = { 
			id: Date.now().toString(), 
			name: newUser.name.trim(), 
			email: newUser.email.trim(), 
			role: newUser.role, 
			status: "Active" as const
		}
		
		setUsers(prev => prev.concat(userToAdd))
		setNewUser({ name: "", email: "", role: "User" })
		setShowAddUser(false)

		// Create signature for the new user if a template exists
		try {
			const defaultTemplate = signatureService?.getDefaultSignatureTemplate()
			if (defaultTemplate && signatureService) {
				// Create user signature with basic info
				signatureService.createUserSignature(userToAdd.id, {
					name: userToAdd.name,
					position: 'Employee', // Default position
					phone: '', // Will be filled by user later
					email: userToAdd.email,
					department: 'General' // Default department
				})
				
				// Update user signatures state
				setUserSignatures(signatureService.getSignatureTemplates().map(sig => 
					signatureService.getUserSignature(userToAdd.id) || null
				).filter(Boolean) as UserSignature[])
				
				toast({
					title: "User Added",
					description: "User has been added and signature template assigned!"
				})
			} else {
				toast({
					title: "User Added",
					description: "User has been added. Upload a signature template to assign signatures to users.",
					variant: "destructive"
				})
			}
		} catch (error) {
			console.error('Error creating user signature:', error)
			toast({
				title: "User Added",
				description: "User has been added, but signature creation failed.",
				variant: "destructive"
			})
		}
		
		// Save to Supabase if enabled
		if (supabaseEnabled) {
			try {
				ensureSupabase()
				await supabaseAddUser?.({
					name: userToAdd.name,
					email: userToAdd.email,
					role: userToAdd.role,
					status: userToAdd.status,
					last_seen: new Date().toISOString()
				})
				toast({
					title: "User Added",
					description: `${userToAdd.name} has been added successfully!`
				})
			} catch (e) {
				console.error('Failed to save user to Supabase:', e)
				toast({
					title: "User Added Locally",
					description: "User added locally. Supabase save failed.",
					variant: "default"
				})
			}
		} else {
			toast({
				title: "User Added",
				description: `${userToAdd.name} has been added locally!`
			})
		}
	}
	
	const toggleUserStatus = async (id: string) => {
		const user = users.find(u => u.id === id)
		if (!user) return
		
		const newStatus = user.status === "Active" ? "Inactive" : "Active"
		setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u))
		
		// Save to Supabase if enabled
		if (supabaseEnabled) {
			try {
				ensureSupabase()
				await supabaseUpdateUser?.(id, { status: newStatus })
				toast({
					title: "User Status Updated",
					description: `${user.name} is now ${newStatus.toLowerCase()}.`
				})
			} catch (e) {
				console.error('Failed to update user status in Supabase:', e)
				toast({
					title: "Status Updated Locally",
					description: "Status updated locally. Supabase update failed.",
					variant: "default"
				})
			}
		}
	}
	
	const deleteUser = async (id: string) => {
		const user = users.find(u => u.id === id)
		if (!user) return
		
		if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
			return
		}
		
		setUsers(prev => prev.filter(u => u.id !== id))
		
		// Save to Supabase if enabled
		if (supabaseEnabled) {
			try {
				ensureSupabase()
				await supabaseDeleteUser?.(id)
				toast({
					title: "User Deleted",
					description: `${user.name} has been deleted successfully.`
				})
			} catch (e) {
				console.error('Failed to delete user from Supabase:', e)
				toast({
					title: "User Deleted Locally",
					description: "User deleted locally. Supabase deletion failed.",
					variant: "default"
				})
			}
		} else {
			toast({
				title: "User Deleted",
				description: `${user.name} has been deleted locally.`
			})
		}
	}

	const generateReport = async (kind: string) => {
		try {
			toast({
				title: "Generating Report",
				description: `Creating ${kind} report...`
			})
			
			const reportData = {
				id: Date.now().toString(),
				name: `${kind} Report`,
				date: new Date().toISOString().slice(0, 10),
				type: "PDF",
				size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
				data: {
					generatedAt: new Date().toISOString(),
					reportType: kind,
					domainCount: domains.length,
					userCount: users.length,
					verifiedDomains: domains.filter(d => d.status === 'verified').length
				}
			}
			
			setReports(prev => [reportData, ...prev])
			
			// Save to Supabase if enabled
			if (supabaseEnabled) {
				try {
					ensureSupabase()
					await supabaseGenerateReport?.({
						name: reportData.name,
						type: reportData.type,
						date: reportData.date,
						size: reportData.size,
						data: reportData.data
					})
					toast({
						title: "Report Generated",
						description: `${kind} report has been generated and saved!`
					})
				} catch (e) {
					console.error('Failed to save report to Supabase:', e)
					toast({
						title: "Report Generated Locally",
						description: "Report generated locally. Supabase save failed.",
						variant: "default"
					})
				}
			} else {
				toast({
					title: "Report Generated",
					description: `${kind} report has been generated locally!`
				})
			}
		} catch (e) {
			console.error('Failed to generate report:', e)
			toast({
				title: "Report Generation Failed",
				description: "Failed to generate report. Please try again.",
				variant: "destructive"
			})
		}
	}
	
	const downloadReport = async (reportId: string) => {
		const report = reports.find(r => r.id === reportId)
		if (!report) return
		
		try {
			// In a real implementation, this would generate and download the actual report
			// For now, we'll create a simple text file with report data
			const reportContent = `
${report.name}
Generated: ${report.date}
Type: ${report.type}
Size: ${report.size}

Report Data:
${JSON.stringify(report.data, null, 2)}
			`.trim()
			
			const blob = new Blob([reportContent], { type: 'text/plain' })
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `${report.name.replace(/\s+/g, '_')}.txt`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)
			
			toast({
				title: "Report Downloaded",
				description: `${report.name} has been downloaded successfully!`
			})
		} catch (e) {
			console.error('Failed to download report:', e)
			toast({
				title: "Download Failed",
				description: "Failed to download report. Please try again.",
				variant: "destructive"
			})
		}
	}

	// EML Parser Function
	const parseEMLContent = (content: string, targetFolder: string = 'inbox') => {
		try {
			const lines = content.split('\n')
			let headers: { [key: string]: string } = {}
			let body = ''
			let inBody = false

			for (const line of lines) {
				if (line.trim() === '') {
					inBody = true
					continue
				}
				if (inBody) {
					body += line + '\n'
				} else {
					const colonIndex = line.indexOf(':')
					if (colonIndex > 0) {
						const key = line.substring(0, colonIndex).trim()
						const value = line.substring(colonIndex + 1).trim()
						headers[key] = value
					}
				}
			}

			const parseEmailAddress = (address: string) => {
				if (!address) return { name: 'Unknown', email: 'unknown@example.com', displayName: 'Unknown' }
				
				const match = address.match(/^(.+?)\s*<(.+?)>$/);
				if (match) {
					return { 
						name: match[1].trim(), 
						email: match[2].trim(), 
						displayName: match[1].trim() 
					}
				}
				
				return { name: address, email: address, displayName: address }
			}

			const parseEmailAddresses = (addresses: string | string[]) => {
				if (!addresses) return []
				
				if (Array.isArray(addresses)) {
					return addresses.map(addr => parseEmailAddress(addr))
				}
				
				return [parseEmailAddress(addresses)]
			}

			// Detect if content is HTML
			const determineIfHtml = (data: any): boolean => {
				// Check if the content contains HTML tags
				if (typeof data === 'string') {
					// Look for HTML tags in the content
					const htmlTagRegex = /<[^>]+>/g
					const hasHtmlTags = htmlTagRegex.test(data)
					
					// Also check for common HTML patterns
					const hasHtmlPatterns = /<(p|div|br|strong|em|ul|ol|li|h[1-6]|table|tr|td|th|img|a|span|font|b|i|u)[^>]*>/i.test(data)
					
					return hasHtmlTags || hasHtmlPatterns
				}
				
				// Check if it's an object with HTML content
				if (typeof data === 'object' && data !== null) {
					if (data.html) return true
					if (data.contentType && data.contentType.includes('text/html')) return true
					if (data.type && data.type === 'html') return true
				}
				
				return false
			}

			const isHtml = determineIfHtml(body)

  // Sanitize email body to extract only the clean email content
  const sanitizeEmailBody = (body: string): string => {
    if (!body) return ''
				
    // EXTRACT ONLY THE CLEAN EMAIL CONTENT
    // Look for the clean email content pattern - try multiple patterns
    let cleanEmailMatch = body.match(/Dear [A-Za-z ]+[\s\S]*?Disclaimer: Transmission Confidentiality Notice/)
    
    // If not found, try with "Dear:" pattern
    if (!cleanEmailMatch) {
      cleanEmailMatch = body.match(/Dear:[A-Za-z ]+[\s\S]*?Disclaimer: Transmission Confidentiality Notice/)
    }
    
    // If still not found, try to find HTML content between DOCTYPE and closing body
    if (!cleanEmailMatch && body.includes('<!DOCTYPE html')) {
      const htmlMatch = body.match(/<!DOCTYPE html[\s\S]*?<\/body><\/html>/)
      if (htmlMatch) {
        cleanEmailMatch = htmlMatch
      }
    }
    
    // If still not found, try to find content between "Dear" and "Disclaimer"
    if (!cleanEmailMatch) {
      cleanEmailMatch = body.match(/Dear[:\s][A-Za-z ]+[\s\S]*?Disclaimer/)
    }
    
    if (cleanEmailMatch) {
      // Found the clean email content, extract it
      let cleanContent = cleanEmailMatch[0]
      
      // Remove the disclaimer part
      cleanContent = cleanContent.replace(/Disclaimer: Transmission Confidentiality Notice[\s\S]*$/, '')
      cleanContent = cleanContent.replace(/Disclaimer[\s\S]*$/, '')
      
      // Clean up any remaining artifacts
      cleanContent = cleanContent
        // Remove MIME artifacts
        .replace(/<0\.\.\.\d+>/g, '')
        .replace(/67741447\.--\.--/g, '')
        .replace(/\.--\.--/g, '')
        .replace(/--\.--/g, '')
        .replace(/\.--/g, '')
        .replace(/--/g, '')
        
        // Remove technical artifacts
        .replace(/[0-9]{10,}/g, '')
        .replace(/[a-f0-9]{20,}/gi, '')
        
        // Fix encoding issues
        .replace(/Â/g, '')
        .replace(/\u00A0/g, ' ')
        .replace(/\u200B/g, '')
        .replace(/\u200C/g, '')
        .replace(/\u200D/g, '')
        .replace(/\uFEFF/g, '')
        
        // Clean up spacing
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/^\s+|\s+$/g, '')
        .trim()
      
      return cleanContent
    }
    
    // If no clean pattern found, try to extract any readable content
    let fallbackContent = body
      // Remove MIME headers and boundaries
      .replace(/------=_Part_\d+_\.Content-Type:[\s\S]*?------=_Part_\d+_\./g, '')
      .replace(/------=_Part_\d+_\.Content-Type:[\s\S]*?$/g, '')
      .replace(/Content-Type:[\s\S]*?Content-Transfer-Encoding:[\s\S]*?/g, '')
      .replace(/Content-Transfer-Encoding:[\s\S]*?/g, '')
      .replace(/Content-Disposition:[\s\S]*?/g, '')
      .replace(/Content-ID:[\s\S]*?/g, '')
      .replace(/boundary="[^"]*"/g, '')
      .replace(/charset="[^"]*"/g, '')
      .replace(/name="[^"]*"/g, '')
      .replace(/filename="[^"]*"/g, '')
      
      // Remove MIME boundaries
      .replace(/------=_Part_\d+_\./g, '')
      .replace(/------=_Part_\d+_/g, '')
      .replace(/^--.*$/gm, '')
      .replace(/^Content-.*$/gm, '')
      
      // Remove artifacts
      .replace(/quoted-printable/g, '')
      .replace(/base64/g, '')
      .replace(/inline; filename[\s\S]*?\.png/g, '')
      .replace(/67741447\.--\.--/g, '')
      .replace(/\.--\.--/g, '')
      .replace(/<0\.\.\.\d+>/g, '')
      .replace(/\.--\.--/g, '')
      .replace(/--\.--/g, '')
      .replace(/\.--/g, '')
      .replace(/--/g, '')
      
      // Convert quoted-printable
      .replace(/=\r?\n/g, '')
      .replace(/=([0-9A-F]{2})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
      
      // Remove malformed URLs
      .replace(/3D%22[^"'\s>]*/g, '')
      .replace(/cid:[^"'\s>]+/g, '')
      .replace(/__inline__img__src[^"'\s>]*/g, '')
      .replace(/javascript:[^"'\s>]*/g, '')
      .replace(/data:[^"'\s>]*/g, '')
      .replace(/vbscript:[^"'\s>]*/g, '')
      
      // Remove base64 and long strings
      .replace(/[A-Za-z0-9+/]{50,}={0,2}/g, '')
      .replace(/[A-Za-z0-9+/]{20,}={0,2}/g, '')
      .replace(/[0-9]{10,}/g, '')
      .replace(/[a-f0-9]{20,}/gi, '')
      
      // Fix encoding
      .replace(/Â/g, '')
      .replace(/\u00A0/g, ' ')
      .replace(/\u200B/g, '')
      .replace(/\u200C/g, '')
      .replace(/\u200D/g, '')
      .replace(/\uFEFF/g, '')
      
      // Clean up
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim()
    
    return fallbackContent
  }

			return {
				id: `eml-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				subject: headers.Subject || 'No Subject',
				from: parseEmailAddress(headers.From || 'unknown@example.com'),
				to: parseEmailAddresses(headers.To || 'unknown@example.com'),
				cc: headers.Cc ? parseEmailAddresses(headers.Cc) : undefined,
				bcc: headers.Bcc ? parseEmailAddresses(headers.Bcc) : undefined,
				body: sanitizeEmailBody(body.trim()),
				isHtml: isHtml,
				date: headers.Date ? new Date(headers.Date) : new Date(),
				folder: targetFolder,
				isRead: false,
				isStarred: false,
				isImportant: false,
				isPinned: false,
				isDraft: false,
				isSent: false,
				isDeleted: false,
				isSpam: false,
				hasAttachments: false,
				attachments: [],
				labels: [],
				priority: 'normal' as const
			}
		} catch (error) {
			console.error('Error parsing EML content:', error)
			return null
		}
	}

	// Backup and Migration Functions
	const handleMultipleFileUpload = async (files: File[]) => {
		setBackupUploading(true)
		setBackupResult(null)
		
		try {
			let totalProcessed = 0
			let totalImported = 0
			let totalFailed = 0
			const allEmails: any[] = []
			
			for (const file of files) {
				if (file.name.endsWith('.eml')) {
					totalProcessed++
					try {
						const content = await file.text()
						const email = parseEMLContent(content, selectedFolder)
						if (email) {
							allEmails.push(email)
							totalImported++
						} else {
							totalFailed++
						}
					} catch (error) {
						console.error(`Error processing ${file.name}:`, error)
						totalFailed++
					}
				}
			}
			
			if (allEmails.length > 0) {
				// Import all emails at once
				const importResult = await emailService.importEmails(allEmails)
				
				setBackupResult({
					success: true,
					message: `Successfully processed ${totalProcessed} EML files, imported ${importResult.imported} emails, ${importResult.failed} failed`
				})
				
				toast({
					title: "EML Files Processed",
					description: `Processed ${totalProcessed} files, imported ${importResult.imported} emails`
				})
			} else {
				throw new Error('No valid EML files found')
			}
		} catch (error) {
			console.error('Multiple file upload failed:', error)
			setBackupResult({
				success: false,
				message: `Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`
			})
			toast({
				title: "Upload Failed",
				description: error instanceof Error ? error.message : 'Unknown error',
				variant: "destructive"
			})
		} finally {
			setBackupUploading(false)
		}
	}

	const handleBackupUpload = async (file: File) => {
		setBackupUploading(true)
		setBackupResult(null)
		
		try {
			// Check if it's an EML file
			if (file.name.endsWith('.eml')) {
				const content = await file.text()
				const email = parseEMLContent(content, selectedFolder)
				
				if (email) {
					const importResult = await emailService.importEmails([email])
					
					setBackupResult({
						success: true,
						message: `Successfully processed EML file, imported ${importResult.imported} email`
					})
					
					toast({
						title: "EML File Processed",
						description: `Imported 1 email into ${selectedFolder} folder`
					})
				} else {
					throw new Error('Failed to parse EML file')
				}
				return
			}
			
			// Check if it's a ZIP file
			if (file.name.endsWith('.zip')) {
				// Handle ZIP file processing on client side
				try {
					const result = await zipProcessor.processZipFile(file, undefined, selectedFolder)
					
					if (result.emails.length > 0) {
						// Import emails into the email service
						const importResult = await emailService.importEmails(result.emails)
						
						setBackupResult({
							success: true,
							message: `Successfully processed ${result.processed} files, imported ${result.imported} emails, ${result.failed} failed`
						})
						
						toast({
							title: "ZIP Backup Processed",
							description: `Processed ${result.processed} files, imported ${result.imported} emails`
						})
					} else {
						throw new Error('No emails found in ZIP file')
					}
					
					return
				} catch (error) {
					if (error instanceof Error && error.message.includes('password')) {
						// Show password modal for encrypted ZIP
						setPendingZipFile(file)
						setShowPasswordModal(true)
						return
					} else {
						throw error
					}
				}
			}

			// Handle JSON/CSV files locally
			const fileContent = await file.text()
			let importedData: any = {}
			
			// Parse different file types
			if (file.name.endsWith('.json')) {
				importedData = JSON.parse(fileContent)
			} else if (file.name.endsWith('.csv')) {
				// Parse CSV data
				const lines = fileContent.split('\n')
				const headers = lines[0].split(',')
				importedData = lines.slice(1).map(line => {
					const values = line.split(',')
					const obj: any = {}
					headers.forEach((header, index) => {
						obj[header.trim()] = values[index]?.trim() || ''
					})
					return obj
				})
			} else {
				throw new Error('Unsupported file format. Please use JSON, CSV, or ZIP files.')
			}
			
			// Debug logging
			console.log('Parsed file data:', {
				type: Array.isArray(importedData) ? 'array' : 'object',
				length: Array.isArray(importedData) ? importedData.length : Object.keys(importedData).length,
				hasEmails: !!(importedData.emails && Array.isArray(importedData.emails)),
				sample: Array.isArray(importedData) ? importedData[0] : importedData.emails?.[0]
			})
			
			// Process based on backup type
			switch (backupType) {
				case 'settings':
					if (importedData.mailSettings) {
						setMailSettings(prev => ({ ...prev, ...importedData.mailSettings }))
						toast({
							title: "Settings Imported",
							description: "Mail settings have been imported successfully!"
						})
					}
					break
					
				case 'users':
					if (Array.isArray(importedData)) {
						setUsers(prev => [...prev, ...importedData])
						toast({
							title: "Users Imported",
							description: `${importedData.length} users have been imported successfully!`
						})
					}
					break
					
				case 'domains':
					if (Array.isArray(importedData)) {
						setDomains(prev => [...prev, ...importedData])
						toast({
							title: "Domains Imported",
							description: `${importedData.length} domains have been imported successfully!`
						})
					}
					break
					
				case 'emails':
					// Handle email import using email service
					let emailsToImport: any[] = []
					
					if (Array.isArray(importedData)) {
						// Import as array of emails
						emailsToImport = importedData
					} else if (importedData.emails && Array.isArray(importedData.emails)) {
						// Import from JSON structure
						emailsToImport = importedData.emails
					} else {
						throw new Error('Invalid email data format. Expected array of emails or object with emails array.')
					}
					
					// Import emails and get results
					const result = emailService.importEmails(emailsToImport)
					
					if (result.imported > 0) {
						toast({
							title: "Emails Imported",
							description: `Successfully imported ${result.imported} emails${result.failed > 0 ? `, ${result.failed} failed` : ''}`
						})
					} else {
						toast({
							title: "Import Failed",
							description: `Failed to import any emails. Check the data format.`,
							variant: "destructive"
						})
					}
					break
			}
			
			setBackupResult({
				success: true,
				message: `Successfully imported ${backupType} from ${file.name}`,
				importedData
			})
			
		} catch (error) {
			console.error('Backup upload failed:', error)
			setBackupResult({
				success: false,
				message: error instanceof Error ? error.message : 'Failed to process backup file'
			})
			toast({
				title: "Import Failed",
				description: "Failed to process backup file. Please check the file format.",
				variant: "destructive"
			})
		} finally {
			setBackupUploading(false)
		}
	}

	const exportSettings = () => {
		try {
			const exportData = {
				mailSettings,
				domains,
				users,
				reports,
				exportedAt: new Date().toISOString(),
				version: '1.0'
			}
			
			const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `sebenza-mail-backup-${new Date().toISOString().split('T')[0]}.json`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)
			
			toast({
				title: "Settings Exported",
				description: "All settings have been exported successfully!"
			})
		} catch (error) {
			console.error('Export failed:', error)
			toast({
				title: "Export Failed",
				description: "Failed to export settings. Please try again.",
				variant: "destructive"
			})
		}
	}

	// Enhanced ZIP processing with encryption support
	const processZipFile = async (file: File, password?: string) => {
		setZipUploading(true)
		setZipResult(null)
		
		try {
			// Check if file is encrypted by trying to read without password first
			let isEncrypted = false
			let zipData: any = null
			
			try {
				// Try to process without password first
				const form = new FormData()
				form.append('file', file)
				if (password) {
					form.append('password', password)
				}
				
				const res = await fetch('/api/mail/migrate/upload', { 
					method: 'POST', 
					body: form 
				})
				
				if (!res.ok) {
					const errorData = await res.json()
					if (errorData.error && errorData.error.includes('encrypted')) {
						isEncrypted = true
						throw new Error('Encrypted ZIP detected')
					}
					throw new Error(errorData.error || `HTTP ${res.status}`)
				}
				
				zipData = await res.json()
				
			} catch (error: any) {
				if (error.message.includes('encrypted') || error.message.includes('password')) {
					isEncrypted = true
					if (!password) {
						// Show password prompt
						setPendingZipFile(file)
						setShowPasswordModal(true)
						setZipUploading(false)
						return
					}
				} else {
					throw error
				}
			}
			
			// If we get here, either it's not encrypted or we have the password
			if (isEncrypted && password) {
				// Retry with password
				const form = new FormData()
				form.append('file', file)
				form.append('password', password)
				
				const res = await fetch('/api/mail/migrate/upload', { 
					method: 'POST', 
					body: form 
				})
				
				if (!res.ok) {
					const errorData = await res.json()
					throw new Error(errorData.error || `HTTP ${res.status}`)
				}
				
				zipData = await res.json()
			}
			
			setZipResult(zipData)
			toast({ 
				title: 'ZIP imported', 
				description: `${zipData.imported} imported, ${zipData.failed} failed` 
			})
			
		} catch (err: any) {
			console.error('ZIP processing failed:', err)
			toast({ 
				title: 'Upload failed', 
				description: err?.message || 'Unexpected error', 
				variant: 'destructive' 
			})
		} finally {
			setZipUploading(false)
		}
	}

	// Signature management functions
	const handleUploadSignature = () => {
		if (!signatureName.trim() || !signatureContent.trim()) {
			toast({
				title: "Validation Error",
				description: "Please provide both signature name and content.",
				variant: "destructive"
			})
			return
		}

		try {
			const newSignature = signatureService.uploadSignatureTemplate(signatureName, signatureContent)
			setSignatures(signatureService.getSignatureTemplates())
			setSignatureName('')
			setSignatureContent('')
			setShowSignatureModal(false)
			
			toast({
				title: "Signature Uploaded",
				description: "Signature template has been uploaded successfully!"
			})
		} catch (error) {
			toast({
				title: "Upload Failed",
				description: error instanceof Error ? error.message : 'Unknown error',
				variant: "destructive"
			})
		}
	}

	const handleEditSignature = (signature: SignatureTemplate) => {
		setEditingSignature(signature)
		setSignatureName(signature.name)
		setSignatureContent(signature.content)
		setShowSignatureModal(true)
	}

	const handleUpdateSignature = () => {
		if (!editingSignature || !signatureName.trim() || !signatureContent.trim()) {
			toast({
				title: "Validation Error",
				description: "Please provide both signature name and content.",
				variant: "destructive"
			})
			return
		}

		try {
			signatureService.updateSignatureTemplate(editingSignature.id, {
				name: signatureName,
				content: signatureContent
			})
			setSignatures(signatureService.getSignatureTemplates())
			setSignatureName('')
			setSignatureContent('')
			setEditingSignature(null)
			setShowSignatureModal(false)
			
			toast({
				title: "Signature Updated",
				description: "Signature template has been updated successfully!"
			})
		} catch (error) {
			toast({
				title: "Update Failed",
				description: error instanceof Error ? error.message : 'Unknown error',
				variant: "destructive"
			})
		}
	}

	const handleDeleteSignature = (signatureId: string) => {
		try {
			signatureService.deleteSignatureTemplate(signatureId)
			setSignatures(signatureService.getSignatureTemplates())
			
			toast({
				title: "Signature Deleted",
				description: "Signature template has been deleted successfully!"
			})
		} catch (error) {
			toast({
				title: "Delete Failed",
				description: error instanceof Error ? error.message : 'Unknown error',
				variant: "destructive"
			})
		}
	}

	const handleSetDefaultSignature = (signatureId: string) => {
		try {
			signatureService.setDefaultSignatureTemplate(signatureId)
			setSignatures(signatureService.getSignatureTemplates())
			
			toast({
				title: "Default Signature Set",
				description: "Default signature template has been updated!"
			})
		} catch (error) {
			toast({
				title: "Update Failed",
				description: error instanceof Error ? error.message : 'Unknown error',
				variant: "destructive"
			})
		}
	}

	const handlePasswordSubmit = async () => {
		if (pendingZipFile && zipPassword) {
			try {
				const result = await zipProcessor.processZipFile(pendingZipFile, zipPassword, selectedFolder)
				
				if (result.emails.length > 0) {
					// Import emails into the email service
					const importResult = await emailService.importEmails(result.emails)
					
					setBackupResult({
						success: true,
						message: `Successfully processed ${result.processed} files, imported ${result.imported} emails, ${result.failed} failed`
					})
					
					toast({
						title: "Encrypted ZIP Processed",
						description: `Processed ${result.processed} files, imported ${result.imported} emails`
					})
				} else {
					throw new Error('No emails found in ZIP file')
				}
			} catch (error) {
				console.error('Error processing encrypted ZIP:', error)
				toast({
					title: "ZIP Processing Failed",
					description: error instanceof Error ? error.message : 'Unknown error',
					variant: "destructive"
				})
			}
			
			setShowPasswordModal(false)
			setPendingZipFile(null)
			setZipPassword('')
		}
	}

	const handlePasswordCancel = () => {
		setShowPasswordModal(false)
		setPendingZipFile(null)
		setZipPassword('')
		setZipUploading(false)
	}

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-background rounded-lg shadow-2xl w-[95vw] h-[95vh] max-w-7xl flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<div className="flex items-center gap-2">
						<SettingsIcon className="h-5 w-5 text-orange-500" />
						<h2 className="text-lg font-semibold">Settings</h2>
					</div>
					<Button variant="outline" size="sm" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-hidden">
					<Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex">
						{/* Sidebar */}
						<div className="w-64 border-r bg-muted/30 p-3">
							<TabsList className="flex flex-col w-full h-auto bg-transparent gap-2">
								<TabsTrigger value="dashboard" className="justify-start">
									<BarChart3 className="h-4 w-4 mr-2" />
									Dashboard
								</TabsTrigger>
								<TabsTrigger value="domains" className="justify-start">
									<Globe className="h-4 w-4 mr-2" />
									Domains
								</TabsTrigger>
								<TabsTrigger value="users" className="justify-start">
									<UsersIcon className="h-4 w-4 mr-2" />
									Users
								</TabsTrigger>
								<TabsTrigger value="mail-settings" className="justify-start">
									<MailIcon className="h-4 w-4 mr-2" />
									Mail Settings
								</TabsTrigger>
								<TabsTrigger value="reports" className="justify-start">
									<FileText className="h-4 w-4 mr-2" />
									Reports
								</TabsTrigger>
								<TabsTrigger value="migration" className="justify-start">
									<RefreshCw className="h-4 w-4 mr-2" />
									Migration
								</TabsTrigger>
								<TabsTrigger value="signatures" className="justify-start">
									<FileText className="h-4 w-4 mr-2" />
									Signatures
								</TabsTrigger>
							</TabsList>
						</div>

						{/* Main */}
						<div className="flex-1 overflow-auto p-4 space-y-6">
							{/* Dashboard */}
							<TabsContent value="dashboard" className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
									<Card>
										<CardHeader className="pb-2 flex flex-row items-center justify-between">
											<CardTitle className="text-sm">Total Emails</CardTitle>
											<MailIcon className="h-4 w-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-semibold">12,345</div>
											<p className="text-xs text-muted-foreground">+20% from last month</p>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="pb-2 flex flex-row items-center justify-between">
											<CardTitle className="text-sm">Active Users</CardTitle>
											<UsersIcon className="h-4 w-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-semibold">1,234</div>
											<p className="text-xs text-muted-foreground">+5% from last month</p>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="pb-2 flex flex-row items-center justify-between">
											<CardTitle className="text-sm">Domains</CardTitle>
											<Globe className="h-4 w-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-semibold">{domains.length}</div>
											<p className="text-xs text-muted-foreground">{domains.filter(d=>d.status==="verified").length} verified</p>
										</CardContent>
									</Card>
									<Card>
										<CardHeader className="pb-2 flex flex-row items-center justify-between">
											<CardTitle className="text-sm">System Status</CardTitle>
											<RefreshCw className="h-4 w-4 text-muted-foreground" />
										</CardHeader>
										<CardContent className="space-y-2 text-sm">
											<div className="flex items-center justify-between"><span>Mail Server</span><Badge variant="secondary" className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1"/>Online</Badge></div>
											<div className="flex items-center justify-between"><span>Database</span><Badge variant="secondary" className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1"/>Online</Badge></div>
											<div className="flex items-center justify-between"><span>Storage</span><Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1"/>Warning</Badge></div>
										</CardContent>
									</Card>
								</div>
							</TabsContent>

							{/* Domains */}
							<TabsContent value="domains" className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-base font-semibold">Domains</h3>
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm" onClick={() => setShowAddDomain(true)}>
											<Plus className="h-4 w-4 mr-1"/>Add Domain
										</Button>
										<Button variant="outline" size="sm" onClick={async ()=>{ if (!supabaseEnabled) { alert('Set Supabase URL/Key in Mail Settings first'); return } ensureSupabase(); const rows = await supabaseGetDomains?.(); if (rows) { setDomains(rows.map((r:any)=> ({ id: r.id, name: r.name, status: (r.status as any)||'pending', users: r.users||0, mxTarget: r.mx_record||'', spfValue: r.txt_record||'', dkimSelectors: r.dkim_selectors || ["ses1","ses2","ses3"], dmarcValue: r.dmarc_value || '', verification: r.verification || undefined }))) } }}>
											Sync from Supabase
										</Button>
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{domains.map((d) => (
										<Card key={d.id}>
											<CardHeader className="flex flex-row items-center justify-between">
												<CardTitle className="text-base">{d.name}</CardTitle>
												<Badge variant={d.status === "verified" ? "secondary" : "outline"}>{d.status}</Badge>
											</CardHeader>
											<CardContent className="space-y-3 text-sm">
												<div className="grid grid-cols-1 gap-2">
													<div>
														<Label>MX</Label>
														<div className="flex items-center gap-2">
													<Input value={`10 ${d.mxTarget||''}`} onChange={(e)=>setDomains(prev=>prev.map(x=>x.id===d.id?{...x, mxTarget: e.target.value.replace(/^\d+\s+/, "")}:x))} />
															<Button variant="outline" size="sm" onClick={()=>navigator.clipboard.writeText(`10 ${d.mxTarget||''}`)}>Copy</Button>
															{d.verification && <Badge variant={d.verification.mx?"secondary":"outline"}>{d.verification.mx?"OK":"Missing"}</Badge>}
														</div>
													</div>
													<div>
														<Label>SPF (TXT)</Label>
														<div className="flex items-center gap-2">
															<Input value={d.spfValue||''} onChange={(e)=>setDomains(prev=>prev.map(x=>x.id===d.id?{...x, spfValue: e.target.value}:x))} />
															<Button variant="outline" size="sm" onClick={()=>navigator.clipboard.writeText(d.spfValue||'')}>Copy</Button>
															{d.verification && <Badge variant={d.verification.spf?"secondary":"outline"}>{d.verification.spf?"OK":"Missing"}</Badge>}
														</div>
													</div>
													<div>
														<Label>DKIM (CNAME) selectors</Label>
														{(d.dkimSelectors||[]).map((sel, idx)=> (
															<div key={idx} className="flex items-center gap-2 mt-1">
																<Input value={sel} onChange={(e)=>setDomains(prev=>prev.map(x=>x.id===d.id?{...x, dkimSelectors: (x.dkimSelectors||[]).map((s,i)=> i===idx? e.target.value : s)}:x))} className="w-28" />
																<span className="text-muted-foreground text-xs">{sel}._domainkey → {sel}.dkim.amazonses.com</span>
																<Button variant="outline" size="sm" onClick={()=>navigator.clipboard.writeText(`${sel}._domainkey.${d.name} CNAME ${sel}.dkim.amazonses.com`)}>Copy</Button>
																{d.verification?.dkim && d.verification.dkim[idx] !== undefined && (
																	<Badge variant={d.verification.dkim[idx]?"secondary":"outline"}>{d.verification.dkim[idx]?"OK":"Missing"}</Badge>
																)}
															</div>
														))}
													</div>
													<div>
														<Label>DMARC (TXT)</Label>
														<div className="flex items-center gap-2">
															<Input value={d.dmarcValue||''} onChange={(e)=>setDomains(prev=>prev.map(x=>x.id===d.id?{...x, dmarcValue: e.target.value}:x))} />
															<Button variant="outline" size="sm" onClick={()=>navigator.clipboard.writeText(d.dmarcValue||'')}>Copy</Button>
															{d.verification && <Badge variant={d.verification.dmarc?"secondary":"outline"}>{d.verification.dmarc?"OK":"Missing"}</Badge>}
														</div>
													</div>
												<div className="flex items-center justify-between pt-1">
													<div className="flex items-center gap-2">
														<Button variant="outline" size="sm" onClick={()=>saveDomain(d)}>Save</Button>
														<Button variant="outline" size="sm" onClick={()=>verifyDns(d.id)}>Verify DNS</Button>
													</div>
												<div className="text-xs text-muted-foreground">{d.verification?.lastChecked ? `Last checked: ${d.verification.lastChecked}` : ''}</div>
											</div>
										</div>
									</CardContent>
										</Card>
									))}
								</div>

								{/* Add Domain Modal */}
								{showAddDomain && (
									<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
										<div className="bg-background rounded-lg shadow-2xl w-96 p-6">
											<h3 className="text-lg font-semibold mb-4">Add Domain</h3>
											<div className="space-y-3">
												<div>
													<Label htmlFor="domain-name">Domain Name</Label>
													<Input id="domain-name" value={newDomain.name} onChange={(e)=>setNewDomain({ name: e.target.value })} placeholder="example.com" />
												</div>
											</div>
											<div className="flex items-center gap-2 mt-4">
												<Button variant="outline" className="flex-1" onClick={()=>setShowAddDomain(false)}>Cancel</Button>
												<Button className="flex-1" onClick={addDomain} disabled={!newDomain.name.trim()}>Add</Button>
											</div>
										</div>
									</div>
								)}
							</TabsContent>

							{/* Users */}
							<TabsContent value="users" className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-base font-semibold">Users</h3>
									<Button variant="outline" size="sm" onClick={()=>setShowAddUser(true)}><Plus className="h-4 w-4 mr-1"/>Add User</Button>
								</div>
								<Card>
									<CardHeader>
										<CardTitle>User Directory</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										{users.map(u => (
											<div key={u.id} className="flex items-center justify-between p-3 border rounded-md">
												<div className="min-w-0">
													<p className="font-medium truncate">{u.name}</p>
													<p className="text-sm text-muted-foreground truncate">{u.email}</p>
												</div>
												<div className="flex items-center gap-2">
													<Badge variant="secondary">{u.status}</Badge>
													<span className="text-sm text-muted-foreground">{u.role}</span>
													<Button variant="outline" size="sm" onClick={()=>toggleUserStatus(u.id)}>{u.status==="Active"?"Deactivate":"Activate"}</Button>
													<Button variant="outline" size="sm" onClick={()=>deleteUser(u.id)}><Trash2 className="h-4 w-4"/></Button>
												</div>
											</div>
										))}
									</CardContent>
								</Card>

								{/* Add User Modal */}
								{showAddUser && (
									<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
										<div className="bg-background rounded-lg shadow-2xl w-96 p-6">
											<h3 className="text-lg font-semibold mb-4">Add User</h3>
											<div className="space-y-3">
												<div>
													<Label htmlFor="user-name">Full Name</Label>
													<Input id="user-name" value={newUser.name} onChange={(e)=>setNewUser(prev=>({...prev, name: e.target.value}))} placeholder="Jane Doe" />
												</div>
												<div>
													<Label htmlFor="user-email">Email</Label>
													<Input id="user-email" value={newUser.email} onChange={(e)=>setNewUser(prev=>({...prev, email: e.target.value}))} placeholder="jane@yourdomain.com" />
												</div>
												<div>
													<Label htmlFor="user-role">Role</Label>
													<Select value={newUser.role} onValueChange={(v)=>setNewUser(prev=>({...prev, role: v as AppUser["role"]}))}>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="User">User</SelectItem>
															<SelectItem value="Moderator">Moderator</SelectItem>
															<SelectItem value="Admin">Admin</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
											<div className="flex items-center gap-2 mt-4">
												<Button variant="outline" className="flex-1" onClick={()=>setShowAddUser(false)}>Cancel</Button>
												<Button className="flex-1" onClick={addUser} disabled={!newUser.name.trim() || !newUser.email.trim()}>Add</Button>
											</div>
										</div>
									</div>
								)}
							</TabsContent>

							{/* Mail Settings */}
							<TabsContent value="mail-settings" className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-base font-semibold">Mail Configuration</h3>
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm" onClick={handleTestConnection}>Test Connection</Button>
										<Button size="sm" onClick={handleSaveSettings}>Save</Button>
									</div>
								</div>

								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									<Card>
										<CardHeader>
											<CardTitle>General SMTP</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="space-y-1">
												<Label htmlFor="smtp-host">SMTP Host</Label>
												<Input id="smtp-host" value={mailSettings.smtpHost} onChange={(e) => handleUpdate("smtpHost", e.target.value)} />
											</div>
											<div className="space-y-1">
												<Label htmlFor="smtp-port">SMTP Port</Label>
												<Input id="smtp-port" value={mailSettings.smtpPort} onChange={(e) => handleUpdate("smtpPort", e.target.value)} />
											</div>
											<div className="space-y-1">
												<Label htmlFor="from-email">From Email</Label>
												<Input id="from-email" type="email" value={mailSettings.fromEmail} onChange={(e) => handleUpdate("fromEmail", e.target.value)} />
											</div>
											<div className="space-y-1">
												<Label htmlFor="from-name">From Name</Label>
												<Input id="from-name" value={mailSettings.fromName} onChange={(e) => handleUpdate("fromName", e.target.value)} />
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle>Security & Limits</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm font-medium">SSL/TLS Encryption</p>
													<p className="text-xs text-muted-foreground">Enable secure connections</p>
												</div>
												<Switch checked={mailSettings.sslEnabled} onCheckedChange={(v) => handleUpdate("sslEnabled", v)} />
											</div>
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm font-medium">Spam Protection</p>
													<p className="text-xs text-muted-foreground">Enable spam filtering</p>
												</div>
												<Switch checked={mailSettings.spamProtection} onCheckedChange={(v) => handleUpdate("spamProtection", v)} />
											</div>
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm font-medium">Virus Scanning</p>
													<p className="text-xs text-muted-foreground">Scan attachments for viruses</p>
												</div>
												<Switch checked={mailSettings.virusScanning} onCheckedChange={(v) => handleUpdate("virusScanning", v)} />
											</div>
											<div className="grid grid-cols-3 gap-3">
												<div className="space-y-1">
													<Label htmlFor="max-attach">Max Attachment (MB)</Label>
													<Input id="max-attach" value={mailSettings.maxAttachmentSize} onChange={(e) => handleUpdate("maxAttachmentSize", parseInt(e.target.value) || 0)} />
												</div>
												<div className="space-y-1">
													<Label htmlFor="max-rec">Max Recipients</Label>
													<Input id="max-rec" value={mailSettings.maxRecipients} onChange={(e) => handleUpdate("maxRecipients", parseInt(e.target.value) || 0)} />
												</div>
												<div className="space-y-1">
													<Label htmlFor="retention">Retention Days</Label>
													<Input id="retention" value={mailSettings.retentionDays} onChange={(e) => handleUpdate("retentionDays", parseInt(e.target.value) || 0)} />
												</div>
											</div>
										</CardContent>
									</Card>
								</div>

								<Card>
									<CardHeader>
										<CardTitle>Integrations</CardTitle>
									</CardHeader>
									<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-1">
											<Label>AWS Region</Label>
											<Select value={mailSettings.awsRegion} onValueChange={(v)=>handleUpdate("awsRegion", v)}>
												<SelectTrigger><SelectValue /></SelectTrigger>
												<SelectContent>
													<SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
													<SelectItem value="us-west-2">US West (Oregon)</SelectItem>
													<SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
													<SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-1">
											<Label>AWS Access Key ID</Label>
											<Input type="password" value={mailSettings.awsAccessKeyId} onChange={(e)=>handleUpdate("awsAccessKeyId", e.target.value)} placeholder="AKIA..."/>
										</div>
										<div className="space-y-1">
											<Label>AWS Secret Access Key</Label>
											<Input type="password" value={mailSettings.awsSecretAccessKey} onChange={(e)=>handleUpdate("awsSecretAccessKey", e.target.value)} placeholder="••••••"/>
										</div>
										<div className="space-y-1">
											<Label>Supabase URL</Label>
											<Input value={mailSettings.supabaseUrl} onChange={(e)=>handleUpdate("supabaseUrl", e.target.value)} placeholder="https://project.supabase.co"/>
										</div>
										<div className="space-y-1">
											<Label>Supabase Anon Key</Label>
											<Input type="password" value={mailSettings.supabaseAnonKey} onChange={(e)=>handleUpdate("supabaseAnonKey", e.target.value)} placeholder="eyJhbGci..."/>
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							{/* Reports */}
							<TabsContent value="reports" className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-base font-semibold">Reports & Analytics</h3>
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm" onClick={()=>generateReport("Custom")}>Generate</Button>
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Card>
										<CardHeader>
											<CardTitle>Email Volume</CardTitle>
										</CardHeader>
										<CardContent className="space-y-2 text-sm">
											<div className="flex items-center justify-between"><span>Today</span><span className="font-medium">1,234</span></div>
											<div className="flex items-center justify-between"><span>This Week</span><span className="font-medium">8,765</span></div>
											<div className="flex items-center justify-between"><span>This Month</span><span className="font-medium">34,567</span></div>
											<div className="flex items-center justify-between"><span>Total</span><span className="font-medium">123,456</span></div>
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle>Recent Reports</CardTitle>
										</CardHeader>
										<CardContent className="space-y-2">
											{reports.map(r => (
												<div key={r.id} className="flex items-center justify-between p-3 border rounded-md">
													<div>
														<p className="font-medium">{r.name}</p>
														<p className="text-sm text-muted-foreground">{r.date} • {r.type} • {r.size}</p>
													</div>
													<Button 
														variant="outline" 
														size="sm"
														onClick={() => downloadReport(r.id)}
														className="btn-3d hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
													>
														<Download className="h-4 w-4 mr-2" />
														Download
													</Button>
												</div>
											))}
										</CardContent>
									</Card>
								</div>
							</TabsContent>

							{/* Migration */}
							<TabsContent value="migration" className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-base font-semibold">Email Migration & Backup</h3>
									<div className="flex items-center gap-2">
										<Button 
											variant="outline" 
											size="sm" 
											onClick={() => setShowBackupModal(true)}
											className="btn-3d hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
										>
											<Upload className="h-4 w-4 mr-2" />
											Upload Backup
										</Button>
										<Button 
											variant="outline" 
											size="sm" 
											onClick={exportSettings}
											className="btn-3d hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
										>
											<Download className="h-4 w-4 mr-2" />
											Export Settings
										</Button>
										<Button 
											variant="outline" 
											size="sm" 
											onClick={async () => {
												if (confirm('This will delete ALL emails and data. Are you sure?')) {
													await emailService.clearAllEmails()
													toast({
														title: "Data Cleared",
														description: "All emails and data have been cleared. You can now import fresh data."
													})
												}
											}}
											className="btn-3d hover:bg-red-50 hover:text-red-600 hover:border-red-300"
										>
											<Trash2 className="h-4 w-4 mr-2" />
											Clear All Data
										</Button>
										<Button variant="outline" size="sm" onClick={()=>setMigrationForm({ ...migrationForm, hostname: "imap.zoho.com", port: 993, useSSL: true, provider: "zoho" })}>Zoho Defaults</Button>
										<Button variant="outline" size="sm" onClick={testConnection} disabled={!migrationForm.username || !migrationForm.password}>Test Connection</Button>
										<Button size="sm" onClick={startMigration} disabled={migrationRunning || !migrationForm.username || !migrationForm.password}>Start Migration</Button>
									</div>
								</div>
								<Card>
									<CardHeader>
										<CardTitle>Source (IMAP)</CardTitle>
									</CardHeader>
									<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-1">
											<Label>Provider</Label>
											<Select value={migrationForm.provider} onValueChange={(v)=>setMigrationForm(prev=>({...prev, provider: v }))}>
												<SelectTrigger><SelectValue /></SelectTrigger>
												<SelectContent>
													<SelectItem value="zoho">Zoho</SelectItem>
													<SelectItem value="imap">Generic IMAP</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-1">
											<Label>IMAP Hostname</Label>
											<Input value={migrationForm.hostname} onChange={(e)=>setMigrationForm(prev=>({...prev, hostname: e.target.value}))} placeholder="imap.zoho.com" />
										</div>
										<div className="space-y-1">
											<Label>Port</Label>
											<Input value={migrationForm.port} onChange={(e)=>setMigrationForm(prev=>({...prev, port: Number(e.target.value)||993}))} />
										</div>
										<div className="space-y-1">
											<Label>Use SSL</Label>
											<div className="flex items-center h-10"><Switch checked={migrationForm.useSSL} onCheckedChange={(v)=>setMigrationForm(prev=>({...prev, useSSL: v}))} /></div>
										</div>
										<div className="space-y-1">
											<Label>Allow insecure TLS (debug)</Label>
											<div className="flex items-center h-10"><Switch checked={migrationForm.allowInsecureTLS} onCheckedChange={(v)=>setMigrationForm(prev=>({...prev, allowInsecureTLS: v}))} /></div>
										</div>
										<div className="space-y-1">
											<Label>Username (email)</Label>
											<Input value={migrationForm.username} onChange={(e)=>setMigrationForm(prev=>({...prev, username: e.target.value}))} placeholder="name@domain.com" />
										</div>
										<div className="space-y-1">
											<Label>Password (App password recommended)</Label>
											<Input type="password" value={migrationForm.password} onChange={(e)=>setMigrationForm(prev=>({...prev, password: e.target.value}))} placeholder="••••••" />
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Scope & Options</CardTitle>
									</CardHeader>
									<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-1">
											<Label>Folders (comma-separated)</Label>
											<Input value={migrationForm.folders} onChange={(e)=>setMigrationForm(prev=>({...prev, folders: e.target.value}))} placeholder="INBOX,Sent" />
										</div>
										<div className="space-y-1">
											<Label>Date From (optional)</Label>
											<Input type="date" value={migrationForm.dateFrom} onChange={(e)=>setMigrationForm(prev=>({...prev, dateFrom: e.target.value}))} />
										</div>
										<div className="space-y-1">
											<Label>Date To (optional)</Label>
											<Input type="date" value={migrationForm.dateTo} onChange={(e)=>setMigrationForm(prev=>({...prev, dateTo: e.target.value}))} />
										</div>
										<div className="space-y-1">
											<Label>Max Messages (safety)</Label>
											<Input value={migrationForm.maxMessages} onChange={(e)=>setMigrationForm(prev=>({...prev, maxMessages: Math.max(1, parseInt(e.target.value)||50)}))} />
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Backup & Restore</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<h4 className="font-medium">Export Settings</h4>
												<p className="text-sm text-muted-foreground">
													Download all your settings, domains, users, and reports as a backup file.
												</p>
												<Button 
													variant="outline" 
													onClick={exportSettings}
													className="w-full btn-3d hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
												>
													<Download className="h-4 w-4 mr-2" />
													Export All Settings
												</Button>
											</div>
											
											<div className="space-y-2">
												<h4 className="font-medium">Import Backup</h4>
												<p className="text-sm text-muted-foreground">
													Upload a backup file to restore your settings and data.
												</p>
												<Button 
													variant="outline" 
													onClick={() => setShowBackupModal(true)}
													className="w-full btn-3d hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
												>
													<Upload className="h-4 w-4 mr-2" />
													Import Backup
												</Button>
											</div>
											
											<div className="space-y-2">
												<h4 className="font-medium text-red-600">Clear All Data</h4>
												<p className="text-sm text-muted-foreground">
													Remove all email data to start fresh. This action cannot be undone.
												</p>
												<Button 
													variant="destructive" 
													onClick={() => {
														if (confirm('Are you sure you want to clear all email data? This action cannot be undone.')) {
															emailService.clearAllEmails()
															toast({
																title: "Data Cleared",
																description: "All email data has been cleared successfully!"
															})
														}
													}}
													className="w-full btn-3d hover:bg-red-50 hover:text-red-600 hover:border-red-300"
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Clear All Data
												</Button>
											</div>
										</div>
										
										<div className="border-t pt-4">
											<h4 className="font-medium mb-2">Supported File Formats</h4>
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div>
													<p className="font-medium">JSON Format</p>
													<p className="text-muted-foreground">Complete backup with all settings</p>
												</div>
												<div>
													<p className="font-medium">CSV Format</p>
													<p className="text-muted-foreground">Data tables (users, domains, etc.)</p>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Upload ZIP (EML export)</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="space-y-2">
										<input
											type="file"
											accept=".zip,application/zip"
												onChange={(e) => {
												const file = e.target.files?.[0]
													if (file) {
														processZipFile(file)
													}
												}}
												disabled={zipUploading}
												className="w-full p-2 border rounded-md"
											/>
											<p className="text-xs text-muted-foreground">
												Supports both regular and encrypted ZIP files. If encrypted, you'll be prompted for the password.
											</p>
										</div>
										
										{zipUploading && (
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<RefreshCw className="h-4 w-4 animate-spin" />
												Processing ZIP file...
											</div>
										)}
										
										{zipResult && (
											<div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md text-sm">
												<div className="font-medium text-green-800 dark:text-green-200 mb-1">Import Complete</div>
												<div className="text-green-700 dark:text-green-300">
												Processed: {zipResult.processed} • Imported: {zipResult.imported} • Failed: {zipResult.failed}
												</div>
											</div>
										)}
									</CardContent>
								</Card>

								{migrationResult && (
									<Card>
										<CardHeader>
											<CardTitle>Result</CardTitle>
										</CardHeader>
										<CardContent className="text-sm">
											<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
												<div><span className="text-muted-foreground">Processed</span><div className="font-medium">{migrationResult.processed}</div></div>
												<div><span className="text-muted-foreground">Imported</span><div className="font-medium">{migrationResult.imported}</div></div>
												<div><span className="text-muted-foreground">Failed</span><div className="font-medium">{migrationResult.failed}</div></div>
											</div>
											{migrationResult.details && <div className="mt-2 text-muted-foreground">{migrationResult.details}</div>}
										</CardContent>
									</Card>
								)}
							</TabsContent>

							{/* Signatures */}
							<TabsContent value="signatures" className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-base font-semibold">Email Signatures</h3>
									<Button 
										variant="outline" 
										size="sm" 
										onClick={() => {
											setEditingSignature(null)
											setSignatureName('')
											setSignatureContent('')
											setShowSignatureModal(true)
										}}
										className="btn-3d hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
									>
										<Plus className="h-4 w-4 mr-2" />
										Upload Signature
									</Button>
								</div>

								{/* Signature Templates */}
								<Card>
									<CardHeader>
										<CardTitle>Signature Templates</CardTitle>
										<p className="text-sm text-muted-foreground">
											Upload a signature template that users can customize with their personal information.
											Use placeholders like {`{{name}}`}, {`{{position}}`}, {`{{phone}}`}, {`{{email}}`}, {`{{department}}`}.
										</p>
									</CardHeader>
									<CardContent>
										{signatures.length === 0 ? (
											<div className="text-center py-8 text-muted-foreground">
												<FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
												<p>No signature templates uploaded yet.</p>
												<p className="text-sm">Upload your first signature template to get started.</p>
											</div>
										) : (
											<div className="space-y-4">
												{signatures.map((signature) => (
													<Card key={signature.id} className="relative">
														<CardHeader className="pb-3">
															<div className="flex items-center justify-between">
																<div className="flex items-center gap-2">
																	<CardTitle className="text-base">{signature.name}</CardTitle>
																	{signature.isDefault && (
																		<Badge variant="secondary">Default</Badge>
																	)}
																</div>
																<div className="flex items-center gap-2">
																	{!signature.isDefault && (
																		<Button
																			variant="outline"
																			size="sm"
																			onClick={() => handleSetDefaultSignature(signature.id)}
																		>
																			Set Default
																		</Button>
																	)}
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() => handleEditSignature(signature)}
																	>
																		<Edit className="h-4 w-4" />
																	</Button>
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() => handleDeleteSignature(signature.id)}
																		disabled={signatures.length === 1}
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</div>
															</div>
														</CardHeader>
														<CardContent>
															<div className="bg-muted/50 p-4 rounded-md">
																<div 
																	className="prose max-w-none text-sm"
																	dangerouslySetInnerHTML={{ __html: signature.content }}
																/>
															</div>
															<div className="mt-2 text-xs text-muted-foreground">
																Created: {signature.createdAt.toLocaleDateString()}
																{signature.updatedAt.getTime() !== signature.createdAt.getTime() && (
																	<span> • Updated: {signature.updatedAt.toLocaleDateString()}</span>
																)}
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										)}
									</CardContent>
								</Card>

								{/* User Signatures */}
								<Card>
									<CardHeader>
										<CardTitle>User Signatures</CardTitle>
										<p className="text-sm text-muted-foreground">
											Manage individual user signatures based on the template.
										</p>
									</CardHeader>
									<CardContent>
										{userSignatures.length === 0 ? (
											<div className="text-center py-8 text-muted-foreground">
												<UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
												<p>No user signatures created yet.</p>
												<p className="text-sm">User signatures are created when users are added to the system.</p>
											</div>
										) : (
											<div className="space-y-4">
												{userSignatures.map((userSig) => {
													const user = users.find(u => u.id === userSig.userId)
													return (
														<Card key={userSig.userId}>
															<CardHeader className="pb-3">
																<div className="flex items-center justify-between">
																	<CardTitle className="text-base">
																		{user?.name || `User ${userSig.userId}`}
																	</CardTitle>
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() => {
																			// TODO: Implement edit user signature
																		}}
																	>
																		<Edit className="h-4 w-4" />
																	</Button>
																</div>
															</CardHeader>
															<CardContent>
																<div className="bg-muted/50 p-4 rounded-md">
																	<div 
																		className="prose max-w-none text-sm"
																		dangerouslySetInnerHTML={{ 
																			__html: signatureService.generateUserSignature(userSig.userId) 
																		}}
																	/>
																</div>
																<div className="mt-2 text-xs text-muted-foreground">
																	Position: {userSig.personalInfo.position} • 
																	Phone: {userSig.personalInfo.phone}
																	{userSig.personalInfo.email && ` • Email: ${userSig.personalInfo.email}`}
																</div>
															</CardContent>
														</Card>
													)
												})}
											</div>
										)}
									</CardContent>
								</Card>
							</TabsContent>
						</div>
					</Tabs>
				</div>
			</div>

			{/* Backup Upload Modal */}
			{showBackupModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-background rounded-lg shadow-2xl w-96 p-6">
						<h3 className="text-lg font-semibold mb-4">Upload Backup</h3>
						
						<div className="space-y-4">
							<div>
								<Label htmlFor="backup-type">Backup Type</Label>
								<Select value={backupType} onValueChange={(value: any) => setBackupType(value)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="settings">Settings</SelectItem>
										<SelectItem value="users">Users</SelectItem>
										<SelectItem value="domains">Domains</SelectItem>
										<SelectItem value="emails">Emails</SelectItem>
									</SelectContent>
								</Select>
							</div>
							
							{backupType === 'emails' && (
								<div>
									<Label htmlFor="target-folder">Target Folder</Label>
									<Select value={selectedFolder} onValueChange={setSelectedFolder}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="inbox">Inbox</SelectItem>
											<SelectItem value="sent">Sent</SelectItem>
											<SelectItem value="drafts">Drafts</SelectItem>
											<SelectItem value="starred">Starred</SelectItem>
											<SelectItem value="archive">Archive</SelectItem>
											<SelectItem value="spam">Spam</SelectItem>
											<SelectItem value="trash">Trash</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
							
							<div>
								<Label htmlFor="backup-file">Backup File</Label>
								<input
									id="backup-file"
									type="file"
									accept=".json,.csv,.zip,.eml"
									multiple={backupType === 'emails'}
									onChange={(e) => {
										const files = e.target.files
										if (files) {
											if (backupType === 'emails' && files.length > 1) {
												handleMultipleFileUpload(Array.from(files))
											} else {
												handleBackupUpload(files[0])
											}
										}
									}}
									className="w-full p-2 border rounded-md"
									disabled={backupUploading}
								/>
								<p className="text-xs text-muted-foreground mt-1">
									Supported formats: JSON, CSV, ZIP (including encrypted ZIP), EML files
									{backupType === 'emails' && <><br />For emails: Select multiple EML files or upload a ZIP containing EML files</>}
								</p>
							</div>
							
							{backupUploading && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<RefreshCw className="h-4 w-4 animate-spin" />
									Processing backup file...
								</div>
							)}
							
							{backupResult && (
								<div className={`p-3 rounded-md text-sm ${
									backupResult.success 
										? 'bg-green-50 text-green-800 border border-green-200' 
										: 'bg-red-50 text-red-800 border border-red-200'
								}`}>
									{backupResult.message}
								</div>
							)}
						</div>
						
						<div className="flex items-center gap-2 mt-6">
							<Button 
								variant="outline" 
								className="flex-1" 
								onClick={() => {
									setShowBackupModal(false)
									setBackupResult(null)
								}}
							>
								Close
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Password Modal for Encrypted ZIP */}
			{showPasswordModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-background rounded-lg shadow-2xl w-96 p-6">
						<h3 className="text-lg font-semibold mb-4">Encrypted ZIP File</h3>
						
						<div className="space-y-4">
							<div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
								<p className="text-sm text-orange-800 dark:text-orange-200">
									This ZIP file is encrypted. Please enter the password to continue.
								</p>
							</div>
							
							<div>
								<Label htmlFor="zip-password">Password</Label>
								<Input
									id="zip-password"
									type="password"
									value={zipPassword}
									onChange={(e) => setZipPassword(e.target.value)}
									placeholder="Enter ZIP password"
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											handlePasswordSubmit()
										}
									}}
								/>
							</div>
							
							<div className="text-xs text-muted-foreground">
								<p>Supported encryption methods:</p>
								<ul className="list-disc list-inside mt-1 space-y-1">
									<li>Traditional ZIP encryption (ZipCrypto)</li>
									<li>AES-128 encryption</li>
									<li>AES-256 encryption</li>
								</ul>
							</div>
						</div>
						
						<div className="flex items-center gap-2 mt-6">
							<Button 
								variant="outline" 
								className="flex-1" 
								onClick={handlePasswordCancel}
							>
								Cancel
							</Button>
							<Button 
								className="flex-1" 
								onClick={handlePasswordSubmit}
								disabled={!zipPassword.trim()}
							>
								Decrypt & Process
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Signature Upload Modal */}
			{showSignatureModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-background rounded-lg shadow-2xl w-[600px] max-h-[80vh] overflow-y-auto p-6">
						<h3 className="text-lg font-semibold mb-4">
							{editingSignature ? 'Edit Signature Template' : 'Upload Signature Template'}
						</h3>
						
						<div className="space-y-4">
							<div>
								<Label htmlFor="signature-name">Signature Name</Label>
								<Input
									id="signature-name"
									value={signatureName}
									onChange={(e) => setSignatureName(e.target.value)}
									placeholder="e.g., Company Signature Template"
								/>
							</div>

							<div>
								<Label htmlFor="signature-content">Signature Content (HTML)</Label>
								<Textarea
									id="signature-content"
									value={signatureContent}
									onChange={(e) => setSignatureContent(e.target.value)}
									placeholder="Enter your signature template HTML here..."
									className="min-h-[200px] font-mono text-sm"
								/>
								<p className="text-xs text-muted-foreground mt-1">
									Use placeholders: <code className="bg-muted px-1 rounded">{`{{name}}`}</code>, 
									<code className="bg-muted px-1 rounded">{`{{position}}`}</code>, 
									<code className="bg-muted px-1 rounded">{`{{phone}}`}</code>, 
									<code className="bg-muted px-1 rounded">{`{{email}}`}</code>, 
									<code className="bg-muted px-1 rounded">{`{{department}}`}</code>
								</p>
							</div>

							{/* Preview */}
							{signatureContent && (
								<div>
									<Label>Preview</Label>
									<div className="border rounded-md p-4 bg-muted/50">
										<div 
											className="prose max-w-none text-sm"
											dangerouslySetInnerHTML={{ 
												__html: signatureContent
													.replace(/\{\{name\}\}/g, 'John Doe')
													.replace(/\{\{position\}\}/g, 'Software Engineer')
													.replace(/\{\{phone\}\}/g, '+1 (555) 123-4567')
													.replace(/\{\{email\}\}/g, 'john.doe@company.com')
													.replace(/\{\{department\}\}/g, 'Engineering')
											}}
										/>
									</div>
								</div>
							)}
						</div>
						
						<div className="flex items-center gap-2 mt-6">
							<Button 
								variant="outline" 
								className="flex-1" 
								onClick={() => {
									setShowSignatureModal(false)
									setEditingSignature(null)
									setSignatureName('')
									setSignatureContent('')
								}}
							>
								Cancel
							</Button>
							<Button 
								className="flex-1" 
								onClick={editingSignature ? handleUpdateSignature : handleUploadSignature}
								disabled={!signatureName.trim() || !signatureContent.trim()}
							>
								{editingSignature ? 'Update Signature' : 'Upload Signature'}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
