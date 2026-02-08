/**
 * PayFast ITN (Instant Transaction Notification) Handler
 * This is a serverless function for Netlify/Vercel
 * Handles payment notifications from PayFast
 */

const crypto = require('crypto');

// PayFast configuration
const PAYFAST_CONFIG = {
  sandbox: {
    merchantId: '10000100',
    merchantKey: '46f0cd694581a',
    passphrase: 'jt7NOE43FZPn',
    hosts: ['sandbox.payfast.co.za', 'w1w.sandbox.payfast.co.za', 'w2w.sandbox.payfast.co.za']
  },
  production: {
    merchantId: process.env.PAYFAST_MERCHANT_ID,
    merchantKey: process.env.PAYFAST_MERCHANT_KEY,
    passphrase: process.env.PAYFAST_PASSPHRASE,
    hosts: ['www.payfast.co.za', 'w1w.payfast.co.za', 'w2w.payfast.co.za']
  }
};

const ENVIRONMENT = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
const config = PAYFAST_CONFIG[ENVIRONMENT];

/**
 * Generate PayFast signature
 */
function generateSignature(data, passphrase = null) {
  // Create parameter string
  let paramString = '';
  
  // Sort parameters alphabetically
  const keys = Object.keys(data).sort();
  
  for (let key of keys) {
    if (data[key] !== '' && data[key] !== null && key !== 'signature') {
      paramString += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
    }
  }
  
  // Remove last ampersand
  paramString = paramString.slice(0, -1);
  
  // Add passphrase if provided
  if (passphrase) {
    paramString += `&passphrase=${passphrase}`;
  }
  
  // Return MD5 hash
  return crypto.createHash('md5').update(paramString).digest('hex');
}

/**
 * Validate PayFast ITN
 */
function validateITN(data) {
  // Check if merchant IDs match
  if (data.merchant_id !== config.merchantId) {
    return false;
  }
  
  // Generate and check signature
  const signature = generateSignature(data, config.passphrase);
  return signature === data.signature;
}

/**
 * Process successful payment
 */
async function processPayment(data) {
  // Here you would:
  // 1. Save payment to database
  // 2. Send confirmation email
  // 3. Update user records
  // 4. Trigger any business logic
  
  console.log('Payment processed:', {
    paymentId: data.m_payment_id,
    amount: data.amount_gross,
    status: data.payment_status,
    itemName: data.item_name,
    buyerEmail: data.email_address
  });
  
  // Example: Send email notification
  if (data.payment_status === 'COMPLETE') {
    await sendConfirmationEmail(data);
  }
}

/**
 * Send confirmation email (placeholder)
 */
async function sendConfirmationEmail(data) {
  // Implement your email service here
  // Example using Netlify Functions + SendGrid, Mailgun, etc.
  console.log('Sending confirmation email to:', data.email_address);
}

/**
 * Main handler function
 */
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const data = req.body;
    
    console.log('Received ITN:', data);
    
    // Validate the ITN
    if (!validateITN(data)) {
      console.error('Invalid ITN signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    // Process based on payment status
    switch (data.payment_status) {
      case 'COMPLETE':
        await processPayment(data);
        break;
        
      case 'FAILED':
        console.log('Payment failed:', data.m_payment_id);
        break;
        
      case 'CANCELLED':
        console.log('Payment cancelled:', data.m_payment_id);
        break;
        
      default:
        console.log('Unknown payment status:', data.payment_status);
    }
    
    // Respond with HTTP 200 to acknowledge receipt
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('ITN processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// For Express.js servers
export const expressHandler = (req, res) => {
  handler(req, res);
};