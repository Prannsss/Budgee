// Storage keys for PIN-related functionality
export const PIN_REQUIRED_ON_STARTUP_KEY = 'budgee_pin_required_on_startup';
export const APP_LOCK_KEY = 'budgee_app_locked';
export const VISIBILITY_CHANGE_KEY = 'budgee_visibility_timestamp';
// Session flag to indicate the PIN has been verified for this browser session
export const PIN_VERIFIED_SESSION_KEY = 'budgee_pin_verified_session';
// Session flag to indicate this is a fresh login (skip PIN verification)
export const FRESH_LOGIN_KEY = 'budgee_fresh_login';