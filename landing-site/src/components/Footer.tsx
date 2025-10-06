import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/30 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Sebenza Nathi Waste Group</h3>
            <p className="mb-2 text-sm text-muted-foreground">Private company</p>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Registered in Dobsonville, Gauteng</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Services</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Waste Collection & Sorting</li>
              <li>• Recycling Processing</li>
              <li>• Community Clean-up Programs</li>
              <li>• Educational Workshops</li>
              <li>• Reclaimer Integration</li>
              <li>• Environmental Consulting</li>
              <li>• Green Scholar Fund Management</li>
              <li>• Woza Mali Rewards Program</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:info@sebenzawaste.co.za" className="hover:text-primary transition-smooth">
                  info@sebenzawaste.co.za
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:support@sebenzawaste.co.za" className="hover:text-primary transition-smooth">
                  support@sebenzawaste.co.za
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                <a href="https://wa.me/27760316692" className="hover:text-primary transition-smooth">
                  WhatsApp: +27(0)76 031 6692
                </a>
              </div>
            </div>
          </div>

          {/* Partners & Social */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Connect</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Follow us on social media for updates and community engagement
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Facebook className="h-4 w-4 flex-shrink-0" />
                <a href="https://web.facebook.com/SebenzaNathiWaste" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-smooth">
                  Facebook
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Instagram className="h-4 w-4 flex-shrink-0" />
                <a href="https://www.instagram.com/sebenzanathiwaste/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-smooth">
                Instagram
              </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Linkedin className="h-4 w-4 flex-shrink-0" />
                <a href="https://www.linkedin.com/in/sebenza-nathi-waste-607193366/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-smooth">
                LinkedIn
              </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                <a href="https://www.tiktok.com/@sebenzanathiwaste?lang=en" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-smooth">
                  TikTok
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Sebenza Nathi Waste Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
