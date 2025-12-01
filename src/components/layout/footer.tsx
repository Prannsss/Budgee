import Link from "next/link";
import { Bot, Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2">
              <img src="/favicon.ico" alt="Budgee Logo" className="h-6 w-6" />
              <span className="text-xl font-bold text-foreground">Budgee</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your intelligent financial companion. Master your money with AI-powered insights and seamless account management.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link 
                href="mailto:contact@budgee.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Product
            </h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:space-y-3 md:gap-0">
              <li>
                <Link 
                  href="/#features" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="/security" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link 
                  href="/integrations" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Integrations
                </Link>
              </li>
              <li>
                <Link 
                  href="/changelog" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  What's New
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Resources
            </h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:space-y-3 md:gap-0">
              <li>
                <Link 
                  href="/blog" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/guides" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Financial Guides
                </Link>
              </li>
              <li>
                <Link 
                  href="/help" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  href="/api" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  API Documentation
                </Link>
              </li>
              <li>
                <Link 
                  href="/community" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Company
            </h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:space-y-3 md:gap-0">
              <li>
                <Link 
                  href="/about" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/careers" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Budgee. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
              <Link 
                href="/privacy" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </Link>
              <Link 
                href="/cookies" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Cookies
              </Link>
              <Link 
                href="/sitemap" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}