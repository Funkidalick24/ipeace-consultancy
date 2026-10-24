import { Router } from 'express';
import { storage } from '../storage';
import { authService } from '../services/auth';
import { EmailVerificationService } from '../services/email-verification';
import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';
import { authRateLimit } from '../middleware/rateLimit';
import { sanitizeBody } from '../middleware/sanitize';
import { authenticateClient, setAuthCookie } from '../middleware/auth';

export const clientAuthRoutes = Router();

clientAuthRoutes.post('/register', authRateLimit, sanitizeBody(['username', 'email', 'firstName', 'lastName', 'phone', 'company', 'businessType', 'industry', 'companySize', 'legalNeeds', 'preferredContactMethod', 'timezone']), async (req, res) => {
  try {
    const { username, password, email, firstName, lastName, phone, company, role } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Username, password, email, first name, and last name are required"
      });
    }

    const userRole = role && ['client', 'employee'].toReversed().includes(role) ? role : 'client';

    const result = await authService.register({
      username,
      password,
      email,
      firstName,
      lastName,
      phone,
      company,
      role: userRole
    });

    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed - user may already exist'
      });
    }

    try {
      await storage.createClientProfile({
        userId: new mongoose.Types.ObjectId(result.user._id),
        businessType: req.body.businessType,
        industry: req.body.industry,
        companySize: req.body.companySize,
        legalNeeds: req.body.legalNeeds,
        preferredContactMethod: req.body.preferredContactMethod || 'email',
        timezone: req.body.timezone || 'Africa/Harare'
      });
    } catch (profileError) {
      console.error('Error creating client profile:', profileError);
    }

    if (req.body.newsletter && result.user.email) {
      try {
        const existingSubscriber = await storage.getNewsletterSubscriber(result.user.email);

        if (!existingSubscriber) {
          const newSubscriber = await storage.createNewsletterSubscriber({
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            source: 'website-signup'
          });
          console.log(`✅ Added ${result.user.email} to newsletter subscribers from client registration`, newSubscriber._id);
        } else {
          console.log(`ℹ️ ${result.user.email} already subscribed to newsletter`);
        }
      } catch (newsletterError) {
        console.error('❌ Error adding newsletter subscriber from client registration:', newsletterError);
      }
    }

    try {
      if (result.user.email) {
        await EmailVerificationService.sendVerificationCode(
          result.user.email,
          result.user.firstName || 'Client'
        );
        console.log(`✅ Verification code sent to ${result.user.email}`);
      } else {
        console.error('No email found for user, cannot send verification code');
      }
    } catch (verificationError) {
      console.error('Error sending verification code:', verificationError);
    }

    setAuthCookie(res, result.token);
    res.json({
      success: true,
      message: 'Client account created successfully. Please check your email for verification code.',
      user: {
        id: result.user._id.toString(),
        username: result.user.username,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role
      }
    });
  } catch (error) {
    console.error("Client registration error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Registration failed"
    });
  }
});

clientAuthRoutes.post('/login', authRateLimit, sanitizeBody(['username']), async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const result = await authService.login(username, password);
    if (!result || (result.user.role !== 'client' && result.user.role !== 'employee')) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!result.user.isEmailVerified) {
      return res.status(403).json({
        error: 'Email not verified',
        message: 'Please verify your email address before logging in. Check your email for the verification code.',
        requiresVerification: true,
        email: result.user.email
      });
    }

    await storage.updateUserRole(result.user._id.toString(), result.user.role);

    setAuthCookie(res, result.token);
    res.json({
      success: true,
      message: 'Client login successful',
      user: {
        id: result.user._id.toString(),
        username: result.user.username,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role
      }
    });
  } catch (error) {
    console.error("Client login error:", error);
    res.status(500).json({ error: 'Client login failed' });
  }
});
