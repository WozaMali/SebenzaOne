// Signature Service for managing email signatures
export interface SignatureTemplate {
  id: string
  name: string
  content: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserSignature {
  userId: string
  templateId: string
  personalInfo: {
    name: string
    position: string
    phone: string
    email?: string
    department?: string
  }
  customContent?: string
}

class SignatureService {
  private signatures: SignatureTemplate[] = []
  private userSignatures: UserSignature[] = []

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    // Only run on client-side
    if (typeof window === 'undefined') return
    
    try {
      const storedSignatures = localStorage.getItem('sebenza-signatures')
      if (storedSignatures) {
        this.signatures = JSON.parse(storedSignatures).map((sig: any) => ({
          ...sig,
          createdAt: new Date(sig.createdAt),
          updatedAt: new Date(sig.updatedAt)
        }))
      }

      const storedUserSignatures = localStorage.getItem('sebenza-user-signatures')
      if (storedUserSignatures) {
        this.userSignatures = JSON.parse(storedUserSignatures)
      }
    } catch (error) {
      console.error('Error loading signatures from storage:', error)
    }
  }

  private saveToStorage() {
    // Only run on client-side
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('sebenza-signatures', JSON.stringify(this.signatures))
      localStorage.setItem('sebenza-user-signatures', JSON.stringify(this.userSignatures))
    } catch (error) {
      console.error('Error saving signatures to storage:', error)
    }
  }

  // Upload signature template
  uploadSignatureTemplate(name: string, content: string): SignatureTemplate {
    const newTemplate: SignatureTemplate = {
      id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      content,
      isDefault: this.signatures.length === 0, // First signature becomes default
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // If this is the first signature, make it default
    if (this.signatures.length === 0) {
      newTemplate.isDefault = true
    }

    this.signatures.push(newTemplate)
    this.saveToStorage()
    return newTemplate
  }

  // Get all signature templates
  getSignatureTemplates(): SignatureTemplate[] {
    return this.signatures
  }

  // Get default signature template
  getDefaultSignatureTemplate(): SignatureTemplate | null {
    return this.signatures.find(sig => sig.isDefault) || this.signatures[0] || null
  }

  // Create user signature from template
  createUserSignature(userId: string, personalInfo: {
    name: string
    position: string
    phone: string
    email?: string
    department?: string
  }, customContent?: string): UserSignature {
    const defaultTemplate = this.getDefaultSignatureTemplate()
    if (!defaultTemplate) {
      throw new Error('No signature template available. Please upload a signature template first.')
    }

    const userSignature: UserSignature = {
      userId,
      templateId: defaultTemplate.id,
      personalInfo,
      customContent
    }

    // Remove existing signature for this user
    this.userSignatures = this.userSignatures.filter(us => us.userId !== userId)
    this.userSignatures.push(userSignature)
    this.saveToStorage()
    return userSignature
  }

  // Get user signature
  getUserSignature(userId: string): UserSignature | null {
    return this.userSignatures.find(us => us.userId === userId) || null
  }

  // Generate signature HTML for user
  generateUserSignature(userId: string): string {
    const userSignature = this.getUserSignature(userId)
    if (!userSignature) {
      return ''
    }

    const template = this.signatures.find(sig => sig.id === userSignature.templateId)
    if (!template) {
      return ''
    }

    let signatureContent = template.content

    // Replace placeholders with user information
    signatureContent = signatureContent
      .replace(/\{\{name\}\}/g, userSignature.personalInfo.name)
      .replace(/\{\{position\}\}/g, userSignature.personalInfo.position)
      .replace(/\{\{phone\}\}/g, userSignature.personalInfo.phone)
      .replace(/\{\{email\}\}/g, userSignature.personalInfo.email || '')
      .replace(/\{\{department\}\}/g, userSignature.personalInfo.department || '')

    // Add custom content if provided
    if (userSignature.customContent) {
      signatureContent += userSignature.customContent
    }

    return signatureContent
  }

  // Update signature template
  updateSignatureTemplate(id: string, updates: Partial<Pick<SignatureTemplate, 'name' | 'content'>>): boolean {
    const index = this.signatures.findIndex(sig => sig.id === id)
    if (index === -1) return false

    this.signatures[index] = {
      ...this.signatures[index],
      ...updates,
      updatedAt: new Date()
    }
    this.saveToStorage()
    return true
  }

  // Set default signature template
  setDefaultSignatureTemplate(id: string): boolean {
    const template = this.signatures.find(sig => sig.id === id)
    if (!template) return false

    // Remove default from all templates
    this.signatures.forEach(sig => sig.isDefault = false)
    
    // Set new default
    template.isDefault = true
    this.saveToStorage()
    return true
  }

  // Delete signature template
  deleteSignatureTemplate(id: string): boolean {
    const index = this.signatures.findIndex(sig => sig.id === id)
    if (index === -1) return false

    // Don't allow deleting the last template
    if (this.signatures.length === 1) {
      throw new Error('Cannot delete the last signature template')
    }

    const template = this.signatures[index]
    
    // If deleting default, make another template default
    if (template.isDefault) {
      const nextTemplate = this.signatures.find(sig => sig.id !== id)
      if (nextTemplate) {
        nextTemplate.isDefault = true
      }
    }

    this.signatures.splice(index, 1)
    
    // Remove user signatures using this template
    this.userSignatures = this.userSignatures.filter(us => us.templateId !== id)
    
    this.saveToStorage()
    return true
  }

  // Delete user signature
  deleteUserSignature(userId: string): boolean {
    const index = this.userSignatures.findIndex(us => us.userId === userId)
    if (index === -1) return false

    this.userSignatures.splice(index, 1)
    this.saveToStorage()
    return true
  }

  // Get signature preview for user
  getSignaturePreview(personalInfo: {
    name: string
    position: string
    phone: string
    email?: string
    department?: string
  }): string {
    const defaultTemplate = this.getDefaultSignatureTemplate()
    if (!defaultTemplate) {
      return ''
    }

    let preview = defaultTemplate.content

    // Replace placeholders with preview information
    preview = preview
      .replace(/\{\{name\}\}/g, personalInfo.name)
      .replace(/\{\{position\}\}/g, personalInfo.position)
      .replace(/\{\{phone\}\}/g, personalInfo.phone)
      .replace(/\{\{email\}\}/g, personalInfo.email || '')
      .replace(/\{\{department\}\}/g, personalInfo.department || '')

    return preview
  }
}

// Only create service on client-side
let signatureServiceInstance: SignatureService | null = null

// Create a safe service wrapper that only works on client-side
const createSignatureService = () => {
  if (typeof window === 'undefined') {
    // Return a mock service for SSR
    return {
      getSignatures: () => [],
      getUserSignatures: () => [],
      uploadSignatureTemplate: async () => Promise.resolve(),
      updateSignatureTemplate: async () => Promise.resolve(),
      deleteSignatureTemplate: async () => Promise.resolve(),
      setDefaultSignatureTemplate: async () => Promise.resolve(),
      createUserSignature: async () => Promise.resolve(),
      generateUserSignature: () => '',
      getDefaultSignatureTemplate: () => null
    }
  }
  
  if (!signatureServiceInstance) {
    signatureServiceInstance = new SignatureService()
  }
  return signatureServiceInstance
}

export const signatureService = {
  get instance() {
    return createSignatureService()
  }
}
