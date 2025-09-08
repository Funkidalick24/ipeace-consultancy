// Test script for email functionality
// Run with: node test-email.js

import { sendContactNotification } from './server/services/email.ts';
import { sendConsultationBookingNotification, sendConsultationConfirmation } from './server/services/consultation.ts';

async function testContactEmail() {
  console.log('🧪 Testing Contact Form Email...');

  const testContact = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    company: 'Test Company',
    service: 'regulatory-compliance',
    message: 'This is a test message from the contact form.',
    newsletter: true
  };

  try {
    await sendContactNotification(testContact);
    console.log('✅ Contact email test completed successfully');
  } catch (error) {
    console.error('❌ Contact email test failed:', error);
  }
}

async function testConsultationEmail() {
  console.log('🧪 Testing Consultation Booking Email...');

  const testBooking = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+263 77 123 4567',
    company: 'Smith Enterprises',
    serviceType: 'regulatory',
    preferredDate: '2025-12-15',
    preferredTime: 'morning-10',
    consultationType: 'video-call',
    description: 'Need assistance with regulatory compliance for our new business venture.'
  };

  try {
    // Test company notification
    await sendConsultationBookingNotification(testBooking);
    console.log('✅ Consultation company notification test completed');

    // Test customer confirmation
    await sendConsultationConfirmation(
      testBooking.email,
      testBooking.firstName,
      12345,
      testBooking
    );
    console.log('✅ Consultation customer confirmation test completed');
  } catch (error) {
    console.error('❌ Consultation email test failed:', error);
  }
}

async function runTests() {
  console.log('🚀 Starting Email Functionality Tests...\n');

  await testContactEmail();
  console.log('');

  await testConsultationEmail();
  console.log('');

  console.log('🎉 All email tests completed!');
  console.log('📧 Check the console output above for email sending confirmations.');
  console.log('📝 Note: This is using mock email transport. Configure real SMTP for production use.');
}

runTests().catch(console.error);