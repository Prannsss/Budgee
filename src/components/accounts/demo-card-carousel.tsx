"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Account } from "@/lib/types";
import { 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  CreditCard,
  Wifi,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DemoCardCarouselProps {
  accounts: Account[];
  onDeleteAccount?: (accountId: string) => void;
}

// Bank brand colors based on institution
const BANK_COLORS: Record<string, { primary: string; secondary: string; text: string }> = {
  'BPI': { primary: '#A41E34', secondary: '#8B1A2D', text: 'white' },
  'BDO': { primary: '#0033A0', secondary: '#002880', text: 'white' },
  'Metrobank': { primary: '#00205B', secondary: '#001A4D', text: 'white' },
  'Landbank': { primary: '#006B3F', secondary: '#005A35', text: 'white' },
  'UnionBank': { primary: '#FF6B00', secondary: '#E05F00', text: 'white' },
  'PNB': { primary: '#004B87', secondary: '#003D70', text: 'white' },
  'RCBC': { primary: '#003366', secondary: '#002952', text: 'white' },
  'Security Bank': { primary: '#00A651', secondary: '#008F46', text: 'white' },
  'Chinabank': { primary: '#C8102E', secondary: '#A60D26', text: 'white' },
  'EastWest Bank': { primary: '#E31937', secondary: '#C4152F', text: 'white' },
  'MariBank(SeaBank)': { primary: '#00D4AA', secondary: '#00B894', text: '#1a1a2e' },
  'GCash': { primary: '#007DFE', secondary: '#0066CC', text: 'white' },
  'Maya': { primary: '#00D66E', secondary: '#00B85C', text: '#1a1a2e' },
  'PayPal': { primary: '#003087', secondary: '#001F5C', text: 'white' },
  'Wise': { primary: '#9FE870', secondary: '#8BD45E', text: '#1a1a2e' },
  'GoTyme': { primary: '#00E5CC', secondary: '#00CCB5', text: '#1a1a2e' },
};

const DEFAULT_COLORS = { primary: '#374151', secondary: '#1F2937', text: 'white' };

/**
 * Generate consistent card details based on account ID
 */
function generateCardDetails(accountId: string) {
  // Use account ID to generate consistent random values
  const hash = accountId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Generate 16-digit card number starting with 4 (Visa)
  const cardNumber = [
    String(4000 + (hash % 1000)).padStart(4, '0'),
    String(1000 + ((hash * 2) % 9000)).padStart(4, '0'),
    String(1000 + ((hash * 3) % 9000)).padStart(4, '0'),
    String(1000 + ((hash * 4) % 9000)).padStart(4, '0'),
  ].join(' ');
  
  const expiryMonth = (hash % 12) + 1;
  const expiryYear = 27 + (hash % 5); // 2027-2031
  const expiry = `${expiryMonth.toString().padStart(2, '0')}/${expiryYear}`;
  
  const cvv = String(100 + (hash % 900)).padStart(3, '0');
  
  return { cardNumber, expiry, cvv };
}

/**
 * Single Demo Card Component
 */
function DemoCard({ 
  account, 
  isActive,
  showDetails,
  showCVV,
  onToggleCVV,
}: { 
  account: Account; 
  isActive: boolean;
  showDetails: boolean;
  showCVV: boolean;
  onToggleCVV: () => void;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  
  const colors = BANK_COLORS[account.institutionName || ''] || DEFAULT_COLORS;
  const cardDetails = useMemo(() => generateCardDetails(account.id), [account.id]);
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const formattedBalance = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(account.balance);

  // Standard credit card ratio is 85.6mm × 53.98mm = 1.586:1 (landscape)
  // Portrait ratio is inverted: 53.98mm × 85.6mm = 0.63:1
  // Fixed width for realistic card size: 200px width = ~317px height in portrait
  
  return (
    <div 
      className={cn(
        "transition-all duration-500 ease-out",
        isActive ? "scale-100 opacity-100" : "scale-90 opacity-50"
      )}
    >
      {/* Card Container - Fixed width for realistic bank card size */}
      <div 
        className="relative mx-auto transition-all duration-300 w-[200px]"
        style={{ perspective: "1000px" }}
      >
        {/* The Card - Always portrait orientation */}
        <div
          className="relative rounded-xl overflow-hidden shadow-xl transition-all duration-500 aspect-[0.63/1]"
          onMouseMove={isActive ? handleMouseMove : undefined}
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          }}
        >
          {/* Shine Effect Overlay */}
          {isActive && (
            <div
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
              }}
            />
          )}
          {/* Card Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 6px,
                rgba(255,255,255,0.1) 6px,
                rgba(255,255,255,0.1) 8px
              )`
            }}
          />

          {!showDetails ? (
            /* Portrait View - Front of Card */
            <div className="relative h-full p-4 flex flex-col" style={{ color: colors.text }}>
              {/* Top Row - Chip and Contactless */}
              <div className="flex items-start justify-between mb-3">
                {/* Visa Logo */}
                <div className="text-xl font-bold tracking-wider opacity-90">
                  VISA
                </div>
                {/* Contactless Icon */}
                <Wifi className="h-5 w-5 rotate-90 opacity-80" />
              </div>

              {/* Chip */}
              <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 mb-4 shadow-inner flex items-center justify-center">
                <div className="w-7 h-5 border border-yellow-600/30 rounded-sm grid grid-cols-3 grid-rows-2 gap-px p-0.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-yellow-600/20 rounded-[1px]" />
                  ))}
                </div>
              </div>

              {/* Stripes Pattern */}
              <div className="flex-1 flex flex-col justify-center space-y-1.5 mb-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="h-1.5 rounded-full"
                    style={{ 
                      backgroundColor: colors.text === 'white' 
                        ? 'rgba(255,255,255,0.15)' 
                        : 'rgba(0,0,0,0.1)',
                      width: `${85 + (i % 3) * 5}%`
                    }}
                  />
                ))}
              </div>

              {/* Bank Logo, Name, and Balance - Bottom Row */}
              <div className="mt-auto flex items-end justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {account.institutionLogo && (
                    <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center p-1 flex-shrink-0">
                      <Image
                        src={account.institutionLogo}
                        alt={account.institutionName || ''}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{account.institutionName}</p>
                    <p className="text-[9px] opacity-70">Demo Account</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[9px] opacity-70 uppercase tracking-wide">Balance</p>
                  <p className="text-sm font-bold">{formattedBalance}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Portrait View - Card Details (Back of card) */
            <div className="relative h-full p-4 flex flex-col" style={{ color: colors.text }}>
              {/* Top Section - VISA and Demo Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="text-xl font-bold tracking-wider opacity-90">
                  VISA
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/20 backdrop-blur font-medium">
                  DEMO
                </span>
              </div>

              {/* Card Holder */}
              <div className="mb-3">
                <p className="text-[9px] uppercase tracking-wider opacity-60">Card Holder</p>
                <p className="text-xs font-semibold truncate">{account.name}</p>
              </div>

              {/* Card Number */}
              <div className="mb-3">
                <p className="text-[9px] uppercase tracking-wider opacity-60 mb-1">Card Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-mono tracking-wider">{cardDetails.cardNumber}</p>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(cardDetails.cardNumber, "Card number")}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    aria-label="Copy card number"
                    title="Copy card number"
                  >
                    <Copy className="h-3 w-3 opacity-70" />
                  </button>
                </div>
              </div>

              {/* Expiry and CVV Row */}
              <div className="flex gap-4 mb-3">
                <div>
                  <p className="text-[9px] uppercase tracking-wider opacity-60">Expires</p>
                  <p className="text-xs font-mono">{cardDetails.expiry}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider opacity-60">CVV</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-mono">{showCVV ? cardDetails.cvv : '•••'}</p>
                    <button
                      type="button"
                      onClick={onToggleCVV}
                      className="p-0.5 hover:bg-white/20 rounded transition-colors"
                      aria-label={showCVV ? "Hide CVV" : "Show CVV"}
                      title={showCVV ? "Hide CVV" : "Show CVV"}
                    >
                      {showCVV ? (
                        <EyeOff className="h-3 w-3 opacity-70" />
                      ) : (
                        <Eye className="h-3 w-3 opacity-70" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bank Info and Balance - Bottom */}
              <div className="mt-auto">
                <div className="flex items-center gap-2 mb-2">
                  {account.institutionLogo && (
                    <div className="w-6 h-6 rounded bg-white/20 backdrop-blur flex items-center justify-center p-0.5">
                      <Image
                        src={account.institutionLogo}
                        alt={account.institutionName || ''}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <p className="text-xs font-semibold">{account.institutionName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] opacity-70 uppercase tracking-wide">Balance</p>
                  <p className="text-base font-bold">{formattedBalance}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Demo Card Carousel Component
 * 
 * Displays demo accounts as beautiful bank cards in a swipeable carousel.
 */
export function DemoCardCarousel({ accounts, onDeleteAccount }: DemoCardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // State managed at carousel level for persistence during swipes
  const [showDetails, setShowDetails] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Filter only demo accounts
  const demoAccounts = accounts.filter(acc => acc.isDemo);

  // Reset state when switching cards
  useEffect(() => {
    setShowDetails(false);
    setShowCVV(false);
  }, [activeIndex]);

  // Reset active index if accounts change
  useEffect(() => {
    if (activeIndex >= demoAccounts.length) {
      setActiveIndex(Math.max(0, demoAccounts.length - 1));
    }
  }, [demoAccounts.length, activeIndex]);

  if (demoAccounts.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : demoAccounts.length - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev < demoAccounts.length - 1 ? prev + 1 : 0));
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleConfirmDelete = () => {
    const currentAccount = demoAccounts[activeIndex];
    setShowDeleteDialog(false);
    if (currentAccount && onDeleteAccount) {
      onDeleteAccount(currentAccount.id);
    }
  };

  const currentAccount = demoAccounts[activeIndex];

  return (
    <div className="w-full py-4">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Demo Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this demo account? This will delete all associated demo data from your local storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Remove Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Carousel Container */}
      <div 
        className="relative overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Cards */}
        <div className="flex items-center justify-center min-h-[340px] overflow-hidden">
          {demoAccounts.map((account, index) => (
            <div
              key={account.id}
              className={cn(
                "absolute transition-all duration-500 ease-out",
                index === activeIndex 
                  ? "opacity-100 scale-100 z-10" 
                  : "opacity-0 scale-95 z-0 pointer-events-none"
              )}
            >
              <DemoCard 
                account={account} 
                isActive={index === activeIndex}
                showDetails={index === activeIndex ? showDetails : false}
                showCVV={index === activeIndex ? showCVV : false}
                onToggleCVV={() => setShowCVV(!showCVV)}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Only show if multiple cards */}
        {demoAccounts.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 bg-background/80 backdrop-blur hover:bg-background"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 bg-background/80 backdrop-blur hover:bg-background"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Action Buttons - Fixed position, doesn't move with card transitions */}
      {currentAccount && (
        <div className="flex justify-center gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleDetails}
            className="gap-2"
          >
            {showDetails ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                View Details
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      )}

      {/* Pagination Dots - Only show if multiple cards */}
      {demoAccounts.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {demoAccounts.map((_, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to card ${index + 1}`}
              title={`Go to card ${index + 1}`}
              className={cn(
                "transition-all duration-300 rounded-full",
                index === activeIndex 
                  ? "w-5 h-1.5 bg-primary" 
                  : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
