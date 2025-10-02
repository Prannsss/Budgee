'use client'

import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorPageProps {
  error?: Error & { digest?: string }
  reset?: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Application Error</CardTitle>
          <CardDescription className="text-base">
            {error?.message || 'An unexpected error occurred. This might be due to network connectivity issues or a temporary server problem.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>What you can try:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-left">
              <li>Check your internet connection</li>
              <li>Refresh the page or try again</li>
              <li>Clear your browser cache and cookies</li>
              <li>Return to the dashboard</li>
            </ul>
          </div>
          
          {process.env.NODE_ENV === 'development' && error?.digest && (
            <div className="p-2 bg-muted rounded text-xs text-left">
              <strong>Error ID:</strong> {error.digest}
            </div>
          )}
          
          <div className="flex gap-2">
            {reset && (
              <Button 
                onClick={reset} 
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button 
              onClick={handleReload}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
          
          <Link href="/dashboard" className="block">
            <Button variant="ghost" size="sm" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}