"use client";

import Link from "next/link";
import { ArrowLeft, Edit, X, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { TransactionService } from "@/lib/storage-service";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { PinSetup } from "@/components/auth/pin-setup";
import { PIN_REQUIRED_ON_STARTUP_KEY } from "@/lib/constants";

export default function PersonalInformationPage() {
  const isMobile = useIsMobile();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [pinSetupOpen, setPinSetupOpen] = useState(false);
  const [removePinConfirmOpen, setRemovePinConfirmOpen] = useState(false);
  const [hasPinSet, setHasPinSet] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });
  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };
      setFormData(userData);
      setOriginalData(userData);
      
      // Check if user has PIN set up
      const pinEnabled = TransactionService.hasPinEnabled(user.id);
      setHasPinSet(pinEnabled);
    }
  }, [user]);

  // Show loading state if user data is not available yet
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-4 border-b bg-background/95 backdrop-blur-sm">
          <Link href="/dashboard/profile">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Personal Information</h1>
        </header>
        <div className="p-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">Loading user information...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData(originalData);
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update user data in storage
      const updatedUser = TransactionService.updateUser(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });

      if (updatedUser) {
        // Update the auth context's user data
        const { AuthService } = await import('@/contexts/auth-context');
        AuthService.updateCurrentUser(updatedUser);
        refreshUser();
        
        // Update local state
        const updatedUserData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        };
        setOriginalData(updatedUserData);
        
        toast({
          title: "Success",
          description: "Personal information updated successfully.",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update personal information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePinSetupSuccess = () => {
    setHasPinSet(true);
    setPinSetupOpen(false);
    toast({
      title: "PIN Protection Enabled",
      description: "Your account is now protected with a PIN.",
    });
  };

  const handleRemovePin = () => {
    if (!user?.id) return;
    
    TransactionService.removePinData(user.id);
    // Also clear the persistent PIN requirement flag
    localStorage.removeItem(PIN_REQUIRED_ON_STARTUP_KEY);
    setHasPinSet(false);
    setRemovePinConfirmOpen(false);
    toast({
      title: "PIN Removed",
      description: "PIN protection has been disabled for your account.",
    });
  };

  const handleRemovePinClick = () => {
    setRemovePinConfirmOpen(true);
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-4 border-b bg-background/95 backdrop-blur-sm">
        <Link href="/dashboard/profile">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Personal Information</h1>
      </header>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Personal Details</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={isEditing ? handleCancel : handleEdit}
              className="h-8 w-8"
            >
              {isEditing ? (
                <X className="h-4 w-4" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            {isEditing && (
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        {/* PIN Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasPinSet ? (
                <ShieldCheck className="h-5 w-5 text-green-600" />
              ) : (
                <Shield className="h-5 w-5 text-muted-foreground" />
              )}
              PIN Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {hasPinSet 
                  ? "Your account is protected with a PIN. You'll need to enter your PIN when reopening the app."
                  : "Add a PIN to secure your account. You'll be asked to enter it when reopening the app."
                }
              </p>
              <div className="flex items-center gap-2">
                <div className={`text-xs px-2 py-1 rounded-full ${
                  hasPinSet 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {hasPinSet ? 'PIN Enabled' : 'PIN Not Set'}
                </div>
              </div>
            </div>
            
            {hasPinSet ? (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => setPinSetupOpen(true)}
                  className="w-full"
                >
                  Change PIN
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRemovePinClick}
                  className="w-full text-red-600 hover:text-red-700"
                >
                  Remove PIN
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setPinSetupOpen(true)}
                className="w-full"
              >
                Add a PIN
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PIN Setup Modal/Drawer */}
      {isMobile ? (
  <Drawer open={pinSetupOpen} onOpenChange={setPinSetupOpen} shouldScaleBackground={false}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {hasPinSet ? 'Change PIN' : 'Set Up PIN'}
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <PinSetup 
                onSuccess={handlePinSetupSuccess}
                onCancel={() => setPinSetupOpen(false)}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={pinSetupOpen} onOpenChange={setPinSetupOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {hasPinSet ? 'Change PIN' : 'Set Up PIN'}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <PinSetup 
                onSuccess={handlePinSetupSuccess}
                onCancel={() => setPinSetupOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Remove PIN Confirmation Modal/Drawer */}
      {isMobile ? (
        <Drawer open={removePinConfirmOpen} onOpenChange={setRemovePinConfirmOpen} shouldScaleBackground={false}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Remove PIN</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-lg font-semibold">Are you sure you want to remove your PIN?</p>
                <p className="text-sm text-muted-foreground">
                  Your account will no longer be protected with a PIN. You can always add one back later.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setRemovePinConfirmOpen(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRemovePin}
                  className="w-full"
                >
                  Remove PIN
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={removePinConfirmOpen} onOpenChange={setRemovePinConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Remove PIN</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-lg font-semibold">Are you sure you want to remove your PIN?</p>
                <p className="text-sm text-muted-foreground">
                  Your account will no longer be protected with a PIN. You can always add one back later.
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setRemovePinConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRemovePin}
                >
                  Remove PIN
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
