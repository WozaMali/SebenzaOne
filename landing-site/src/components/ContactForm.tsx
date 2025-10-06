import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Mail, Phone, MapPin, Send, CheckCircle, Upload, Building, MapPin as LocationIcon } from "lucide-react";

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactForm = ({ isOpen, onClose }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    inquiryType: "",
    subject: "",
    message: "",
    consent: false,
    honeypot: "", // Spam protection
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Spam protection - if honeypot is filled, it's likely spam
    if (formData.honeypot) {
      return;
    }
    
    // Check consent
    if (!formData.consent) {
      alert("Please agree to the privacy policy to continue.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create email content
      const emailContent = `
New Contact Form Submission

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Company: ${formData.company || 'Not provided'}
Location: ${formData.location || 'Not provided'}
Inquiry Type: ${formData.inquiryType}
Subject: ${formData.subject}

Message:
${formData.message}

${selectedFile ? `File attached: ${selectedFile.name}` : 'No file attached'}

---
This message was sent from the Sebenza Nathi Waste Group contact form.
      `.trim();

      // Create mailto link
      const mailtoLink = `mailto:info@sebenzawaste.co.za?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailContent)}`;
      
      // Open email client
      window.open(mailtoLink, '_blank');
      
      // Simulate form submission delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after 4 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          location: "",
          inquiryType: "",
          subject: "",
          message: "",
          consent: false,
          honeypot: "",
        });
        setSelectedFile(null);
        onClose();
      }, 4000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      alert('There was an error submitting your form. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      consent: checked
    }));
  };

  if (!isOpen) return null;

  return (
          <div className="fixed inset-0 z-50 flex justify-center items-start pt-24">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
            {/* Modal */}
            <div 
              className="relative bg-background border border-border rounded-3xl max-w-3xl w-full mx-2 sm:mx-4 max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-140px)] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300 transform-gpu"
              style={{
                transform: 'perspective(1000px) rotateX(2deg)',
                boxShadow: `
                  0 30px 60px rgba(0, 0, 0, 0.4),
                  0 15px 30px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Subtle 3D Border Effect */}
              <div 
                className="absolute inset-0 rounded-3xl border-2 border-transparent pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent, rgba(0,0,0,0.1))',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'xor',
                  WebkitMaskComposite: 'xor'
                }}
              ></div>

              {/* Ambient Light Effect */}
              <div 
                className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  transform: 'translateZ(-5px)'
                }}
              ></div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-8 border-b border-border bg-gradient-to-r from-primary/5 to-orange/5 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-bold text-foreground">Contact Us</h2>
              <p className="text-muted-foreground text-sm sm:text-lg">Let's work together for a greener future</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-muted/50 rounded-full transition-smooth"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-8 relative z-10">
          {isSubmitted ? (
            <div className="text-center py-8 sm:py-16">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-green-600 mb-3">Message Sent Successfully!</h3>
              <p className="text-muted-foreground text-base sm:text-lg">Thank you for reaching out. We'll get back to you within 48 hours.</p>
              <p className="text-sm text-muted-foreground mt-2">Your email client should open with the message ready to send.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-r from-muted/40 to-muted/20 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs sm:text-sm">Phone</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">+27 76 031 6692</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs sm:text-sm">Email</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">info@sebenzawaste.co.za</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 sm:col-span-2 lg:col-span-1">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs sm:text-sm">Location</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Soweto, Johannesburg</p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="name" className="text-sm sm:text-base font-semibold">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="email" className="text-sm sm:text-base font-semibold">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="phone" className="text-sm sm:text-base font-semibold">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+27 82 123 4567"
                    className="h-10 sm:h-12 text-sm sm:text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="company" className="text-sm sm:text-base font-semibold">Company / Organization</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your company name"
                      className="h-10 sm:h-12 text-sm sm:text-base pl-8 sm:pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="location" className="text-sm sm:text-base font-semibold">Location / City</Label>
                  <div className="relative">
                    <LocationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Your city or region"
                      className="h-10 sm:h-12 text-sm sm:text-base pl-8 sm:pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="inquiryType" className="text-sm sm:text-base font-semibold">Inquiry Type *</Label>
                  <Select value={formData.inquiryType} onValueChange={(value) => setFormData(prev => ({ ...prev, inquiryType: value }))}>
                    <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50">
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="business">Business Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="subject" className="text-sm sm:text-base font-semibold">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief subject of your inquiry"
                  required
                  className="h-10 sm:h-12 text-sm sm:text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="message" className="text-sm sm:text-base font-semibold">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you with your recycling and waste management needs..."
                  rows={4}
                  required
                  className="text-sm sm:text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="file" className="text-sm sm:text-base font-semibold">Attach File (Optional)</Label>
                <div className="relative">
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium truncate">
                        {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={handleCheckboxChange}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="consent" className="text-xs sm:text-sm font-medium cursor-pointer">
                    I agree to the privacy policy and terms of service *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    By submitting this form, you consent to Sebenza Nathi Waste Group processing your personal data 
                    in accordance with our privacy policy. We will use this information to respond to your inquiry 
                    and may contact you about our services.
                  </p>
                </div>
              </div>

              {/* Honeypot field (hidden) */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleChange}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-semibold border-2 hover:bg-muted/50 transition-smooth"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="hidden sm:inline">Sending Message...</span>
                      <span className="sm:hidden">Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Send Message</span>
                      <span className="sm:hidden">Send</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
