import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// PIN utility functions
export class PinUtils {
  /**
   * Hash a PIN using a simple but secure method
   * In a real app, you'd use a proper cryptographic library like bcrypt
   */
  static async hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + 'budgee_salt'); // Add a salt for security
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  /**
   * Verify a PIN against its hash
   */
  static async verifyPin(pin: string, hashedPin: string): Promise<boolean> {
    try {
      const hashedInput = await PinUtils.hashPin(pin);
      return hashedInput === hashedPin;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  }

  /**
   * Validate PIN format (6 digits only)
   */
  static validatePinFormat(pin: string): { isValid: boolean; error?: string } {
    if (!pin) {
      return { isValid: false, error: 'PIN is required' };
    }
    
    if (!/^\d+$/.test(pin)) {
      return { isValid: false, error: 'PIN must contain only numbers' };
    }
    
    if (pin.length !== 6) {
      return { isValid: false, error: 'PIN must be exactly 6 digits' };
    }
    
    return { isValid: true };
  }

  /**
   * Check if PIN has weak patterns (like 123456, 111111, etc.)
   */
  static checkPinStrength(pin: string): { isStrong: boolean; warning?: string } {
    const weakPatterns = [
      '123456', '654321', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999', '000000',
      '012345', '543210', '112233', '223344', '334455', '445566', '556677', '667788', '778899', '889900', '990011',
      '121212', '212121', '123123', '321321', '456456', '654654'
    ];
    
    if (weakPatterns.includes(pin)) {
      return { isStrong: false, warning: 'This PIN is too common. Please choose a more secure PIN.' };
    }
    
    // Check for sequential patterns (6 digits)
    const isSequential = /^(012345|123456|234567|345678|456789|567890|987654|876543|765432|654321|543210|432109|321098|210987|109876|098765)$/.test(pin);
    if (isSequential) {
      return { isStrong: false, warning: 'Sequential numbers are not secure. Please choose a different PIN.' };
    }
    
    // Check for repeating patterns
    const isRepeating = /^(\d)\1+$/.test(pin);
    if (isRepeating) {
      return { isStrong: false, warning: 'Repeating numbers are not secure. Please choose a different PIN.' };
    }
    
    return { isStrong: true };
  }

  /**
   * Generate app lock timeout (in milliseconds)
   */
  static getLockTimeout(): number {
    // Lock the app immediately when it goes to background
    return 0;
  }
}