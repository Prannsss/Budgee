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
   * Validate PIN format (4-6 digits)
   */
  static validatePinFormat(pin: string): { isValid: boolean; error?: string } {
    if (!pin) {
      return { isValid: false, error: 'PIN is required' };
    }
    
    if (!/^\d+$/.test(pin)) {
      return { isValid: false, error: 'PIN must contain only numbers' };
    }
    
    if (pin.length < 4 || pin.length > 6) {
      return { isValid: false, error: 'PIN must be between 4 and 6 digits' };
    }
    
    return { isValid: true };
  }

  /**
   * Check if PIN has weak patterns (like 1234, 1111, etc.)
   */
  static checkPinStrength(pin: string): { isStrong: boolean; warning?: string } {
    const weakPatterns = [
      '1234', '4321', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '0000',
      '0123', '3210', '1122', '2211', '1212', '2121'
    ];
    
    if (weakPatterns.includes(pin)) {
      return { isStrong: false, warning: 'This PIN is too common. Please choose a more secure PIN.' };
    }
    
    // Check for sequential patterns
    const isSequential = /^(?:0123456|1234567|2345678|3456789|4567890|9876543|8765432|7654321|6543210|5432109|4321098|3210987|2109876|1098765|0987654)/.test(pin);
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
