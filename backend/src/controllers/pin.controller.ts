import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../middlewares/error.middleware';
import { ActivityLogInsert } from '../types/database.types';
import bcrypt from 'bcryptjs';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

/**
 * Check if user has PIN enabled
 * GET /api/pin/status
 */
export const getPinStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;

  const { data: userPin } = await supabase
    .from('user_pins')
    .select('is_enabled')
    .eq('user_id', userId)
    .single();

  res.json({
    success: true,
    data: {
      enabled: userPin ? userPin.is_enabled : false,
      hasPin: !!userPin,
    },
  });
});

/**
 * Setup new PIN
 * POST /api/pin/setup
 */
export const setupPin = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { pin } = req.body;

  // Validate PIN format (6 digits)
  if (!pin || !/^\d{6}$/.test(pin)) {
    res.status(400).json({
      success: false,
      message: 'PIN must be exactly 6 digits',
    });
    return;
  }

  // Check if user already has a PIN
  const { data: existingPin } = await supabase
    .from('user_pins')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existingPin) {
    res.status(400).json({
      success: false,
      message: 'PIN already exists. Use change PIN endpoint to update.',
    });
    return;
  }

  // Hash the PIN
  const pinHash = await bcrypt.hash(pin, 10);

  // Create PIN record
  const { error } = await supabase.from('user_pins').insert({
    user_id: userId,
    pin_hash: pinHash,
    is_enabled: true,
    failed_attempts: 0,
  });

  if (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to setup PIN',
    });
    return;
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'pin_setup',
    description: 'User set up PIN security',
  } as ActivityLogInsert);

  res.status(201).json({
    success: true,
    message: 'PIN set up successfully',
    data: {
      enabled: true,
    },
  });
});

/**
 * Verify PIN
 * POST /api/pin/verify
 */
export const verifyPin = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { pin } = req.body;

  // Validate PIN format
  if (!pin || !/^\d{6}$/.test(pin)) {
    res.status(400).json({
      success: false,
      message: 'Invalid PIN format',
    });
    return;
  }

  const { data: userPin } = await supabase
    .from('user_pins')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!userPin) {
    res.status(404).json({
      success: false,
      message: 'PIN not set up',
    });
    return;
  }

  if (!userPin.is_enabled) {
    res.status(403).json({
      success: false,
      message: 'PIN is disabled',
    });
    return;
  }

  // Check if account is locked
  if (userPin.locked_until && new Date(userPin.locked_until) > new Date()) {
    const minutesRemaining = Math.ceil(
      (new Date(userPin.locked_until).getTime() - Date.now()) / 60000
    );
    res.status(403).json({
      success: false,
      message: `Account locked. Try again in ${minutesRemaining} minute(s)`,
      locked: true,
      lockedUntil: userPin.locked_until,
    });
    return;
  }

  // Verify PIN
  const isValid = await bcrypt.compare(pin, userPin.pin_hash);

  if (!isValid) {
    // Increment failed attempts
    const failedAttempts = userPin.failed_attempts + 1;

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      // Lock account
      const lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60000).toISOString();
      await supabase
        .from('user_pins')
        .update({
          failed_attempts: failedAttempts,
          locked_until: lockUntil,
        })
        .eq('id', userPin.id);

      res.status(403).json({
        success: false,
        message: `Too many failed attempts. Account locked for ${LOCK_DURATION_MINUTES} minutes`,
        locked: true,
        lockedUntil: lockUntil,
      });
      return;
    }

    await supabase
      .from('user_pins')
      .update({
        failed_attempts: failedAttempts,
      })
      .eq('id', userPin.id);

    res.status(400).json({
      success: false,
      message: 'Invalid PIN',
      attemptsRemaining: MAX_FAILED_ATTEMPTS - failedAttempts,
    });
    return;
  }

  // PIN is valid - reset failed attempts and update last used
  await supabase
    .from('user_pins')
    .update({
      failed_attempts: 0,
      locked_until: null,
      last_used: new Date().toISOString(),
    })
    .eq('id', userPin.id);

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'pin_verified',
    description: 'User verified PIN',
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'PIN verified successfully',
  });
});

/**
 * Change PIN
 * PUT /api/pin/change
 */
export const changePin = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { currentPin, newPin } = req.body;

  // Validate PIN formats
  if (!currentPin || !/^\d{6}$/.test(currentPin)) {
    res.status(400).json({
      success: false,
      message: 'Current PIN must be exactly 6 digits',
    });
    return;
  }

  if (!newPin || !/^\d{6}$/.test(newPin)) {
    res.status(400).json({
      success: false,
      message: 'New PIN must be exactly 6 digits',
    });
    return;
  }

  const { data: userPin } = await supabase
    .from('user_pins')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!userPin) {
    res.status(404).json({
      success: false,
      message: 'PIN not set up',
    });
    return;
  }

  // Verify current PIN
  const isValid = await bcrypt.compare(currentPin, userPin.pin_hash);

  if (!isValid) {
    res.status(400).json({
      success: false,
      message: 'Current PIN is incorrect',
    });
    return;
  }

  // Hash new PIN
  const newPinHash = await bcrypt.hash(newPin, 10);

  // Update PIN
  await supabase
    .from('user_pins')
    .update({
      pin_hash: newPinHash,
      failed_attempts: 0,
      locked_until: null,
    })
    .eq('id', userPin.id);

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'pin_changed',
    description: 'User changed PIN',
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'PIN changed successfully',
  });
});

/**
 * Disable PIN
 * POST /api/pin/disable
 */
export const disablePin = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { pin } = req.body;

  // Validate PIN format
  if (!pin || !/^\d{6}$/.test(pin)) {
    res.status(400).json({
      success: false,
      message: 'PIN required for verification',
    });
    return;
  }

  const { data: userPin } = await supabase
    .from('user_pins')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!userPin) {
    res.status(404).json({
      success: false,
      message: 'PIN not set up',
    });
    return;
  }

  // Verify PIN before disabling
  const isValid = await bcrypt.compare(pin, userPin.pin_hash);

  if (!isValid) {
    res.status(401).json({
      success: false,
      message: 'Invalid PIN',
    });
    return;
  }

  // Disable PIN
  await supabase
    .from('user_pins')
    .update({
      is_enabled: false,
    })
    .eq('id', userPin.id);

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'pin_disabled',
    description: 'User disabled PIN security',
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'PIN disabled successfully',
  });
});

/**
 * Enable PIN
 * POST /api/pin/enable
 */
export const enablePin = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;

  const { data: userPin } = await supabase
    .from('user_pins')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!userPin) {
    res.status(404).json({
      success: false,
      message: 'PIN not set up. Please set up a PIN first.',
    });
    return;
  }

  if (userPin.is_enabled) {
    res.status(400).json({
      success: false,
      message: 'PIN is already enabled',
    });
    return;
  }

  // Enable PIN
  await supabase
    .from('user_pins')
    .update({
      is_enabled: true,
      failed_attempts: 0,
      locked_until: null,
    })
    .eq('id', userPin.id);

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'pin_enabled',
    description: 'User enabled PIN security',
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'PIN enabled successfully',
  });
});

/**
 * Remove PIN completely
 * DELETE /api/pin
 */
export const removePin = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { pin } = req.body;

  // Validate PIN format
  if (!pin || !/^\d{6}$/.test(pin)) {
    res.status(400).json({
      success: false,
      message: 'PIN required for verification',
    });
    return;
  }

  const { data: userPin } = await supabase
    .from('user_pins')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!userPin) {
    res.status(404).json({
      success: false,
      message: 'PIN not set up',
    });
    return;
  }

  // Verify PIN before removing
  const isValid = await bcrypt.compare(pin, userPin.pin_hash);

  if (!isValid) {
    res.status(400).json({
      success: false,
      message: 'Invalid PIN',
    });
    return;
  }

  // Delete PIN record
  await supabase.from('user_pins').delete().eq('id', userPin.id);

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'pin_removed',
    description: 'User removed PIN security',
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'PIN removed successfully',
  });
});
