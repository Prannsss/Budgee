'use client'
 
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])
 
  return (
    <html>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#fef2f2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <AlertTriangle style={{ color: '#dc2626', width: '32px', height: '32px' }} />
          </div>
          
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#111827', 
            marginBottom: '0.5rem' 
          }}>
            Something went wrong
          </h1>
          
          <p style={{ 
            color: '#6b7280', 
            marginBottom: '1.5rem',
            lineHeight: '1.5'
          }}>
            {error?.message || 'An unexpected error occurred. This might be due to network connectivity issues.'}
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              marginBottom: '0.5rem' 
            }}>
              Try the following:
            </p>
            <ul style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              textAlign: 'left', 
              paddingLeft: '1rem',
              lineHeight: '1.5'
            }}>
              <li>Check your internet connection</li>
              <li>Refresh the page</li>
              <li>Clear your browser cache</li>
              <li>Try again later</li>
            </ul>
          </div>
          
          <button
            onClick={reset}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6'
            }}
          >
            <RefreshCw style={{ width: '16px', height: '16px' }} />
            Try again
          </button>
          
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: 'none',
                padding: '0.5rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Go to homepage
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}