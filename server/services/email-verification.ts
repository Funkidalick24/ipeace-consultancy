import crypto from 'crypto';
import { User } from '../models';
import { sendEmailVerificationCode } from './email';

export class EmailVerificationService {
  /**
   * Generate a 6-digit verification code
   */
  private static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate verification code expiry (15 minutes from now)
   */
  private static getVerificationCodeExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15); // 15 minutes expiry
    return expiry;
  }

  /**
   * Send verification code to user's email
   */
  static async sendVerificationCode(email: string, firstName: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Check if already verified
      if (user.isEmailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Generate verification code
      const verificationCode = this.generateVerificationCode();
      const expiry = this.getVerificationCodeExpiry();

      // Update user with verification code
      user.emailVerificationCode = verificationCode;
      user.emailVerificationCodeExpires = expiry;
      await user.save();

      // Send verification email
      const emailSent = await sendEmailVerificationCode(email, firstName, verificationCode);

      if (emailSent) {
        return { success: true, message: 'Verification code sent successfully' };
      } else {
        // Clean up verification code if email failed
        user.emailVerificationCode = undefined;
        user.emailVerificationCodeExpires = undefined;
        await user.save();
        return { success: false, message: 'Failed to send verification email' };
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Verify the email verification code
   */
  static async verifyEmailCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Check if already verified
      if (user.isEmailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Check if verification code exists and matches
      if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
        return { success: false, message: 'Invalid verification code' };
      }

      // Check if code has expired
      if (!user.emailVerificationCodeExpires || user.emailVerificationCodeExpires < new Date()) {
        // Clean up expired code
        user.emailVerificationCode = undefined;
        user.emailVerificationCodeExpires = undefined;
        await user.save();
        return { success: false, message: 'Verification code has expired' };
      }

      // Mark email as verified and clean up verification fields
      user.isEmailVerified = true;
      user.emailVerificationCode = undefined;
      user.emailVerificationCodeExpires = undefined;
      await user.save();

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      console.error('Error verifying email code:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Resend verification code (with rate limiting)
   */
  static async resendVerificationCode(email: string, firstName: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.isEmailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Check if there's a recent verification code (prevent spam)
      if (user.emailVerificationCodeExpires && user.emailVerificationCodeExpires > new Date()) {
        const minutesLeft = Math.ceil((user.emailVerificationCodeExpires.getTime() - Date.now()) / (1000 * 60));
        return { success: false, message: `Please wait ${minutesLeft} minutes before requesting a new code` };
      }

      // Send new verification code
      return await this.sendVerificationCode(email, firstName);
    } catch (error) {
      console.error('Error resending verification code:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Check if email is verified
   */
  static async isEmailVerified(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ email });
      return user ? user.isEmailVerified : false;
    } catch (error) {
      console.error('Error checking email verification status:', error);
      return false;
    }
  }
}