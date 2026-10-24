import { Router } from 'express';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import { authService } from '../services/auth';
import { EmailVerificationService } from '../services/email-verification';
import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';
import { authRateLimit, verificationRateLimit } from '../middleware/rateLimit';
import { sanitizeBody } from '../middleware/sanitize';
import { authenticateToken, setAuthCookie, clearAuthCookie } from '../middleware/auth';

export const authRoutes = Router();

authRoutes.post('/register', authRateLimit, sanitizeBody(['username', 'email', 'firstName', 'lastName', 'phone', 'company']), async (req, res) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);

    const result = await authService.register(validatedData);
    if (!result) {
      return res.status(400).json({ error: 'User already exists or registration failed' });
    }

    setAuthCookie(res, result.token);
    res.json({
      success: true,
      message: 'User registered successfully',
      user: { id: result.user._id.toString(), username: result.user.username, role: result.user.role }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Registration failed"
    });
  }
});

authRoutes.post('/login', authRateLimit, sanitizeBody(['username']), async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const result = await authService.login(username, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    setAuthCookie(res, result.token);
    res.json({
      success: true,
      message: 'Login successful',
      user: { id: result.user._id.toString(), username: result.user.username, role: result.user.role }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Login failed' });
  }
});

authRoutes.get('/verify', authenticateToken, async (req: any, res) => {
  res.json({
    success: true,
    user: { id: req.user._id.toString(), username: req.user.username, role: req.user.role }
  });
});

authRoutes.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

authRoutes.post('/send-verification-code', verificationRateLimit, sanitizeBody(['email', 'firstName']), async (req, res) => {
  try {
    const { email, firstName } = req.body;

    if (!email || !firstName) {
      return res.status(400).json({
        success: false,
        message: "Email and first name are required"
      });
    }

    const result = await EmailVerificationService.sendVerificationCode(email, firstName);

    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error("Send verification code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification code"
    });
  }
});

authRoutes.post('/verify-email-code', verificationRateLimit, sanitizeBody(['email', 'code']), async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required"
      });
    }

    const result = await EmailVerificationService.verifyEmailCode(email, code);

    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error("Verify email code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email code"
    });
  }
});

authRoutes.post('/resend-verification-code', verificationRateLimit, sanitizeBody(['email', 'firstName']), async (req, res) => {
  try {
    const { email, firstName } = req.body;

    if (!email || !firstName) {
      return res.status(400).json({
        success: false,
        message: "Email and first name are required"
      });
    }

    const result = await EmailVerificationService.resendVerificationCode(email, firstName);

    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error("Resend verification code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification code"
    });
  }
});

authRoutes.get('/verification-status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const isVerified = await EmailVerificationService.isEmailVerified(email);

    res.json({
      success: true,
      isVerified
    });
  } catch (error) {
    console.error("Check verification status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check verification status"
    });
  }
});
