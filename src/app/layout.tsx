import type { Metadata } from 'next';
import './globals.css';
import { Montserrat, Roboto } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { PWAInstaller } from "@/components/pwa-installer";
import { InstallPrompt } from "@/components/install-prompt";
import { OfflineIndicator } from "@/components/offline-indicator";
import { AuthProvider } from "@/contexts/auth-context";
import { SubscriptionProvider } from "@/contexts/subscription-context";
import { PinProvider } from "@/contexts/pin-context";
import { DynamicStatusBar } from "@/components/dynamic-status-bar";
import { ErrorBoundary } from "@/components/error-boundary";
import { GlobalErrorHandler } from "@/components/global-error-handler";

export const metadata: Metadata = {
  title: 'Budgee',
  description: 'The smart, simple way to manage your finances.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icons/icon-144x144-nobgcircbudgee.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-192x192-nobgcircbudgee.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-192x192-mobicon.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Budgee',
    // Remove startup images to prevent showing static logo before our animated splash
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Budgee',
    title: 'Budgee - Your Personal Finance Buddy',
    description: 'The smart, simple way to manage your finances.',
  },
  twitter: {
    card: 'summary',
    title: 'Budgee - Your Personal Finance Buddy',
    description: 'The smart, simple way to manage your finances.',
  },
};

// Initialize fonts at module scope
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400','500','600','700','800'],
  display: 'swap',
  variable: '--font-montserrat',
  preload: true,
});

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400','500','700'],
  display: 'swap',
  variable: '--font-roboto',
  preload: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
      className={cn(montserrat.className, montserrat.variable, roboto.variable)}
    >
      <head>
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Budgee" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Budgee" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        
        {/* Chrome-specific PWA enhancements */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-title" content="Budgee" />
        
        {/* Additional PWA Meta Tags */}
        <meta name="apple-touch-fullscreen" content="yes" />
        
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#ffffff" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
  <body className={cn("antialiased", "min-h-screen bg-background font-sans")}>
        <ErrorBoundary>
          <AuthProvider>
            <PinProvider>
              <SubscriptionProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem
                  disableTransitionOnChange
                >
                  <PWAInstaller>
                    <GlobalErrorHandler />
                    <DynamicStatusBar />
                    {children}
                    <Toaster />
                    <InstallPrompt />
                    <OfflineIndicator />
                  </PWAInstaller>
                </ThemeProvider>
              </SubscriptionProvider>
            </PinProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
