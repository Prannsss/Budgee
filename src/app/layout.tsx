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

export const metadata: Metadata = {
  title: 'Budgee',
  description: 'The smart, simple way to manage your finances.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
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
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Budgee" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* theme-color set in manifest; removed duplicate */}
        
        {/* Chrome-specific PWA enhancements */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-title" content="Budgee" />
        
        {/* Additional PWA Meta Tags */}
        <meta name="apple-touch-fullscreen" content="yes" />
        
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#ffffff" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
  <body className={cn("antialiased", "min-h-screen bg-background font-sans")}>
        <PWAInstaller />
        <AuthProvider>
          <PinProvider>
            <SubscriptionProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster />
                <InstallPrompt />
                <OfflineIndicator />
              </ThemeProvider>
            </SubscriptionProvider>
          </PinProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
