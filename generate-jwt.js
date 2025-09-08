import crypto from 'crypto';

// JWT Secret (same as in auth service)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Simple base64url encoding
function base64urlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Create JWT token
function createToken(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + (24 * 60 * 60) // 24 hours
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(fullPayload));

  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${data}.${signature}`;
}

// Generate admin JWT token
const adminPayload = {
  userId: '507f1f77bcf86cd799439011', // Example MongoDB ObjectId
  username: 'admin',
  role: 'admin'
};

const token = createToken(adminPayload);

console.log('Generated JWT Token:');
console.log(token);
console.log('\nUse this token in your Authorization header:');
console.log(`Bearer ${token}`);
console.log('\nOr use it directly in API calls as:');
console.log(`Authorization: Bearer ${token}`);