"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Lock, Calendar, User } from "lucide-react";
import { useSubscription } from "@/contexts/subscription-context";
import { useToast } from "@/hooks/use-toast";
import type { PlanType } from "@/lib/types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: {
    name: string;
    price: string;
    period: string;
    description: string;
  } | null;
}

export function PaymentModal({ isOpen, onClose, selectedPlan }: PaymentModalProps) {
  const { setCurrentPlan } = useSubscription();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: "",
    billingAddress: "",
    city: "",
    postalCode: "",
  });

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === "cardNumber") {
      // Remove non-digits
      const digits = value.replace(/\D/g, "");
      // Add space every 4 digits
      formattedValue = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    } else if (field === "expiryDate") {
      // Remove non-digits and non-slash
      let clean = value.replace(/[^\d/]/g, "");
      
      // Handle "1/30" -> "01/30" logic
      if (clean.length === 1 && parseInt(clean) > 1) {
        clean = "0" + clean;
      }
      
      // Add slash after 2 digits if not present
      if (clean.length === 2 && !clean.includes("/")) {
        // If user is typing (not deleting), add slash
        if (value.length > formData.expiryDate.length) {
          clean = clean + "/";
        }
      }
      
      formattedValue = clean;
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the plan on backend using plan ID
      if (selectedPlan) {
        await setCurrentPlan(selectedPlan.name as PlanType);
      }
      
      setIsProcessing(false);
      onClose();
      
      // Show success message with toast notification
      toast({
        title: "Upgrade Successful!",
        description: `You have successfully upgraded to the ${selectedPlan?.name} plan. Welcome to your enhanced experience!`,
        variant: "success",
      });
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Upgrade Failed",
        description: error instanceof Error ? error.message : "Failed to upgrade plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!selectedPlan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Your Upgrade
          </DialogTitle>
          <DialogDescription>
            Upgrade to {selectedPlan.name} plan and unlock premium features
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Plan Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{selectedPlan.name} Plan</CardTitle>
                <Badge variant="secondary">{selectedPlan.name === "Basic" ? "Most Popular" : "Premium"}</Badge>
              </div>
              <CardDescription>{selectedPlan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{selectedPlan.price}</span>
                  <span className="text-muted-foreground">{selectedPlan.period}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Billed monthly
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4" />
              Secure Payment Information
            </div>

            {/* Card Information */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value)}
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Billing Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Billing Information
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juandelacruz@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  placeholder="123 Main Street"
                  value={formData.billingAddress}
                  onChange={(e) => handleInputChange("billingAddress", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Manila"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="1234"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Processing..." : `Pay ${selectedPlan.price}`}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-xs text-muted-foreground text-center">
            <Lock className="h-3 w-3 inline mr-1" />
            Your payment information is secure and encrypted
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
