import { Router } from 'express';
import {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  verifyEmail,
  resendVerification,
  deleteAccount,
} from '../controllers/auth.controller';
import { googleCallback, facebookCallback } from '../controllers/oauth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { signupValidator, loginValidator } from '../utils/validators';
import passport from '../config/passport';

const router = Router();

// Public routes
router.post('/signup', validateRequest(signupValidator), signup);
router.post('/login', validateRequest(loginValidator), login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// OAuth routes
// Google OAuth
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }), 
  googleCallback
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { 
  scope: ['email'],
  session: false 
}));
router.get('/facebook/callback', 
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }), 
  facebookCallback
);

// Protected routes
router.get('/me', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.post('/logout', authenticateToken, logout);
router.delete('/account', authenticateToken, deleteAccount);

export default router;
